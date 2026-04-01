import { getServiceClient } from "@/lib/supabase"
import { fetchAllAssets, type AssetData } from "@/lib/yahoo-finance"
import Anthropic from "@anthropic-ai/sdk"

interface AssetSignal {
  name: string
  ticker: string
  price: number
  change: number
  changePercent: number
  signal: "bullish" | "bearish" | "neutral"
  signalReason: string
  news: string
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
    return item.title.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").trim()
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
  "KRW=X": "원달러 환율",
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date().toISOString().split("T")[0]
  const supabase = getServiceClient()

  // 오늘 데이터 이미 있으면 스킵
  const { data: existing } = await supabase
    .from("asset_signals")
    .select("id")
    .eq("date", today)
    .maybeSingle()

  if (existing) {
    return Response.json({ skipped: true, reason: "Already collected today", date: today })
  }

  // 1. Yahoo Finance 데이터 수집
  const assets = await fetchAllAssets()

  if (assets.length === 0) {
    return Response.json({ error: "No asset data collected" }, { status: 502 })
  }

  // 2. 네이버 뉴스 수집 (병렬)
  const newsResults = await Promise.allSettled(
    assets.map((a) => fetchAssetNews(NEWS_QUERIES[a.ticker] || a.name))
  )

  const newsMap: Record<string, string> = {}
  assets.forEach((a, i) => {
    const result = newsResults[i]
    newsMap[a.ticker] = result.status === "fulfilled" ? result.value : ""
  })

  // 3. Claude Haiku로 시그널 판단 + 인사이트
  const anthropic = new Anthropic()

  const assetSummary = assets
    .map(
      (a, i) =>
        `${i + 1}. ${a.name} (${a.ticker}): 현재가 ${a.price.toLocaleString()}, 변동 ${a.change >= 0 ? "+" : ""}${a.change.toFixed(2)} (${a.changePercent >= 0 ? "+" : ""}${a.changePercent.toFixed(2)}%), 관련 뉴스: "${newsMap[a.ticker] || "없음"}"`
    )
    .join("\n")

  let signalData: AssetSignal[] = []
  let aiInsight = ""

  try {
    const aiResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: `다음은 오늘의 주요 자산 시세입니다. 각 자산에 대해 시그널(bullish/bearish/neutral)과 이유를 판단하고, 전체 시장 인사이트를 작성해주세요.

${assetSummary}

응답 형식 (JSON):
{
  "signals": [
    {"ticker": "^KS11", "signal": "bullish|bearish|neutral", "reason": "시그널 이유 1문장"},
    ...
  ],
  "insight": "전체 시장 인사이트 3~4문장"
}

중요: 반드시 위 JSON 형식으로만 응답하세요. 한국어로 작성하세요.`,
        },
      ],
    })

    const raw = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const signals: Array<{ ticker: string; signal: string; reason: string }> = parsed.signals || []
      aiInsight = parsed.insight || ""

      signalData = assets.map((a: AssetData) => {
        const sig = signals.find((s) => s.ticker === a.ticker)
        return {
          name: a.name,
          ticker: a.ticker,
          price: a.price,
          change: a.change,
          changePercent: a.changePercent,
          signal: (sig?.signal as "bullish" | "bearish" | "neutral") || "neutral",
          signalReason: sig?.reason || "",
          news: newsMap[a.ticker] || "",
        }
      })
    } else {
      // 파싱 실패 시 neutral 기본값
      signalData = assets.map((a: AssetData) => ({
        name: a.name,
        ticker: a.ticker,
        price: a.price,
        change: a.change,
        changePercent: a.changePercent,
        signal: "neutral" as const,
        signalReason: "",
        news: newsMap[a.ticker] || "",
      }))
      aiInsight = "시장 인사이트를 분석 중입니다."
    }
  } catch (error) {
    console.error("Claude AI error:", error)
    signalData = assets.map((a: AssetData) => ({
      name: a.name,
      ticker: a.ticker,
      price: a.price,
      change: a.change,
      changePercent: a.changePercent,
      signal: "neutral" as const,
      signalReason: "",
      news: newsMap[a.ticker] || "",
    }))
    aiInsight = "시장 인사이트를 분석 중입니다."
  }

  // 4. Supabase 저장
  const { error: upsertError } = await supabase.from("asset_signals").upsert(
    {
      date: today,
      data: { assets: signalData, aiInsight, updatedAt: new Date().toISOString() },
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
    assetsCount: signalData.length,
  })
}
