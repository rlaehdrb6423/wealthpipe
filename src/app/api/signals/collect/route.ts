import { getServiceClient } from "@/lib/supabase"
import { fetchAssetsByTickers, fetchAllAssets, type AssetData } from "@/lib/yahoo-finance"
import { getAnthropicClient } from "@/lib/anthropic"
import { verifyCronAuth } from "@/lib/auth"
import { stripHtml } from "@/lib/sanitize"

interface AssetSignal {
  name: string
  ticker: string
  price: number
  change: number
  changePercent: number
  signal: "bullish" | "bearish" | "neutral"
  signalReason: string
  signalReasonEn?: string
  news: string
}

const ASSET_GROUPS: Record<string, string[]> = {
  kr: ["^KS11", "KRW=X"],
  us: ["^GSPC", "^IXIC", "GC=F", "CL=F"],
  crypto: ["BTC-USD"],
}

async function fetchAssetNews(query: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/news?query=${encodeURIComponent(query)}&display=1&sort=date`,
      {
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!response.ok) return ""
    const data = await response.json()
    const item = data.items?.[0]
    if (!item) return ""
    return stripHtml(item.title)
  } catch {
    clearTimeout(timeoutId)
    return ""
  }
}

const NEWS_QUERIES: Record<string, string> = {
  "^KS11": "코스피 증시",
  "^GSPC": "S&P500 미국증시",
  "^IXIC": "나스닥 기술주",
  "BTC-USD": "비트코인 시세",
  "GC=F": "금값 금시세",
  "CL=F": "유가 WTI 원유",
  "KRW=X": "원달러 환율",
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const group = searchParams.get("group") // kr, us, crypto, or null (all)

  const today = new Date().toISOString().split("T")[0]
  const supabase = getServiceClient()

  // 그룹별 또는 전체 자산 수집
  const targetTickers = group && ASSET_GROUPS[group] ? ASSET_GROUPS[group] : null
  const assets = targetTickers
    ? await fetchAssetsByTickers(targetTickers)
    : await fetchAllAssets()

  if (assets.length === 0) {
    return Response.json({ error: "No asset data collected" }, { status: 502 })
  }

  // 네이버 뉴스 수집 (병렬)
  const newsResults = await Promise.allSettled(
    assets.map((a) => fetchAssetNews(NEWS_QUERIES[a.ticker] || a.name))
  )

  const newsMap: Record<string, string> = {}
  assets.forEach((a, i) => {
    const result = newsResults[i]
    newsMap[a.ticker] = result.status === "fulfilled" ? result.value : ""
  })

  // Claude Haiku로 시그널 판단 + 인사이트
  const anthropic = getAnthropicClient()

  const assetSummary = assets
    .map(
      (a, i) =>
        `${i + 1}. ${a.name} (${a.ticker}): 현재가 ${a.price.toLocaleString()}, 변동 ${a.change >= 0 ? "+" : ""}${a.change.toFixed(2)} (${a.changePercent >= 0 ? "+" : ""}${a.changePercent.toFixed(2)}%), 관련 뉴스: "${newsMap[a.ticker] || "없음"}"`
    )
    .join("\n")

  let newSignals: AssetSignal[] = []
  let groupInsight = ""
  let groupInsightEn = ""

  try {
    const aiResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `다음은 오늘의 주요 자산 시세입니다. 각 자산에 대해 시그널(bullish/bearish/neutral)과 이유를 판단하고, 전체 시장 인사이트를 작성해주세요. 한국어와 영어 두 버전을 모두 작성하세요.

${assetSummary}

응답 형식 (JSON):
{
  "signals": [
    {"ticker": "^KS11", "signal": "bullish|bearish|neutral", "reason": "시그널 이유 (한국어)", "reasonEn": "Signal reason (English)"},
    ...
  ],
  "insight": "전체 시장 인사이트 (한국어)",
  "insightEn": "Overall market insight (English)"
}

중요: 반드시 위 JSON 형식으로만 응답하세요.`,
        },
      ],
    })

    const raw = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const signals: Array<{ ticker: string; signal: string; reason: string; reasonEn?: string }> = parsed.signals || []
      groupInsight = parsed.insight || ""
      groupInsightEn = parsed.insightEn || ""

      newSignals = assets.map((a: AssetData) => {
        const sig = signals.find((s) => s.ticker === a.ticker)
        return {
          name: a.name,
          ticker: a.ticker,
          price: a.price,
          change: a.change,
          changePercent: a.changePercent,
          signal: (sig?.signal as "bullish" | "bearish" | "neutral") || "neutral",
          signalReason: sig?.reason || "",
          signalReasonEn: sig?.reasonEn || "",
          news: newsMap[a.ticker] || "",
        }
      })
    } else {
      newSignals = assets.map((a: AssetData) => ({
        name: a.name,
        ticker: a.ticker,
        price: a.price,
        change: a.change,
        changePercent: a.changePercent,
        signal: "neutral" as const,
        signalReason: "",
        news: newsMap[a.ticker] || "",
      }))
      groupInsight = "시장 인사이트를 분석 중입니다."
    }
  } catch (error) {
    console.error("Claude AI error:", error)
    newSignals = assets.map((a: AssetData) => ({
      name: a.name,
      ticker: a.ticker,
      price: a.price,
      change: a.change,
      changePercent: a.changePercent,
      signal: "neutral" as const,
      signalReason: "",
      news: newsMap[a.ticker] || "",
    }))
    groupInsight = "시장 인사이트를 분석 중입니다."
  }

  // 기존 데이터 로드 후 병합
  const { data: existing } = await supabase
    .from("asset_signals")
    .select("data")
    .eq("date", today)
    .maybeSingle()

  let mergedAssets: AssetSignal[] = []
  let mergedInsight = groupInsight
  let mergedInsightEn = groupInsightEn

  if (existing?.data) {
    const existingAssets: AssetSignal[] = existing.data.assets || []
    // 기존 자산 중 이번에 업데이트하지 않는 것은 유지
    const updatedTickers = new Set(newSignals.map((s) => s.ticker))
    const kept = existingAssets.filter((a) => !updatedTickers.has(a.ticker))
    mergedAssets = [...kept, ...newSignals]

    // 인사이트: 전체 수집이 아니면 기존 인사이트에 그룹 인사이트 추가
    if (group) {
      const existingInsight = existing.data.aiInsight || ""
      const existingInsightEn = existing.data.aiInsightEn || ""
      mergedInsight = existingInsight
        ? `${existingInsight} | ${groupInsight}`
        : groupInsight
      mergedInsightEn = existingInsightEn
        ? `${existingInsightEn} | ${groupInsightEn}`
        : groupInsightEn
    }
  } else {
    mergedAssets = newSignals
  }

  // 자산 순서 정렬 (KOSPI, S&P500, NASDAQ, Bitcoin, Gold, USD/KRW)
  const TICKER_ORDER = ["^KS11", "^GSPC", "^IXIC", "BTC-USD", "GC=F", "CL=F", "KRW=X"]
  mergedAssets.sort((a, b) => {
    const ai = TICKER_ORDER.indexOf(a.ticker)
    const bi = TICKER_ORDER.indexOf(b.ticker)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  // Supabase 저장
  const { error: upsertError } = await supabase.from("asset_signals").upsert(
    {
      date: today,
      data: { assets: mergedAssets, aiInsight: mergedInsight, aiInsightEn: mergedInsightEn, updatedAt: new Date().toISOString() },
    },
    { onConflict: "date" }
  )

  if (upsertError) {
    console.error("Supabase upsert error:", upsertError)
    return Response.json({ error: "Failed to save signals" }, { status: 500 })
  }

  return Response.json({
    success: true,
    date: today,
    group: group || "all",
    assetsUpdated: newSignals.length,
    totalAssets: mergedAssets.length,
  })
}
