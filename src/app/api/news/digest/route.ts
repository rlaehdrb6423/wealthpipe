import { getServiceClient } from "@/lib/supabase"
import Anthropic from "@anthropic-ai/sdk"

const CATEGORIES = [
  { key: "stock", query: "주식시장 증시" },
  { key: "realestate", query: "부동산 아파트 시장" },
  { key: "exchange", query: "환율 달러 원화" },
  { key: "rate", query: "금리 기준금리 한국은행" },
  { key: "crypto", query: "암호화폐 비트코인 코인" },
] as const

interface NaverNewsItem {
  title: string
  link: string
  originallink: string
  description: string
  pubDate: string
}

interface ArticleData {
  title: string
  summary: string
  source: string
  category: string
  url: string
}

interface DigestOutput {
  summaries: string[]
  summariesEn: string[]
  insight: string
  insightEn: string
}

async function fetchNaverNews(query: string): Promise<NaverNewsItem | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/news?query=${encodeURIComponent(query)}&display=3&sort=date`,
      {
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Naver news API error: status=${response.status}`)
      return null
    }

    const data = await response.json()
    const items: NaverNewsItem[] = data.items || []
    if (items.length === 0) return null

    return items[0]
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`Naver news fetch error for "${query}":`, error)
    return null
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").trim()
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, "")
  } catch {
    return "naver"
  }
}

export async function GET(request: Request) {
  // Vercel Cron 인증
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date().toISOString().split("T")[0]

  // 오늘 데이터 이미 있으면 스킵
  const supabase = getServiceClient()
  const { data: existing } = await supabase
    .from("news_digest")
    .select("id")
    .eq("date", today)
    .maybeSingle()

  if (existing) {
    return Response.json({ skipped: true, reason: "Already generated for today", date: today })
  }

  // 각 카테고리별 최신 뉴스 1건씩 수집
  const newsItems = await Promise.allSettled(
    CATEGORIES.map((cat) => fetchNaverNews(cat.query))
  )

  const collected: Array<{ category: string; item: NaverNewsItem }> = []
  for (let i = 0; i < CATEGORIES.length; i++) {
    const result = newsItems[i]
    if (result.status === "fulfilled" && result.value) {
      collected.push({ category: CATEGORIES[i].key, item: result.value })
    }
  }

  if (collected.length === 0) {
    return Response.json({ error: "No news collected from Naver API" }, { status: 502 })
  }

  // Claude Haiku로 각 뉴스 요약 + 전체 인사이트 생성
  const anthropic = new Anthropic()

  const newsForAI = collected
    .map(
      (c, i) =>
        `[${i + 1}] 카테고리: ${c.category}\n제목: ${stripHtml(c.item.title)}\n내용: ${stripHtml(c.item.description)}`
    )
    .join("\n\n")

  let articles: ArticleData[] = []
  let articlesEn: ArticleData[] = []
  let aiInsight = ""
  let aiInsightEn = ""

  try {
    const aiResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `다음은 오늘의 주요 경제 뉴스 ${collected.length}건입니다. 각 뉴스를 2~3문장으로 요약하고, 마지막에 전체 시장 인사이트를 3~4문장으로 작성해주세요. 한국어와 영어 두 버전을 모두 작성하세요.

${newsForAI}

응답 형식 (JSON):
{
  "summaries": ["뉴스1 한국어 요약", ...],
  "summariesEn": ["News1 English summary", ...],
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
      const parsed: DigestOutput = JSON.parse(jsonMatch[0])
      const summaries: string[] = parsed.summaries || []
      const summariesEn: string[] = parsed.summariesEn || []
      aiInsight = parsed.insight || ""
      aiInsightEn = parsed.insightEn || ""

      articles = collected.map((c, i) => ({
        title: stripHtml(c.item.title),
        summary: summaries[i] || stripHtml(c.item.description),
        source: extractSource(c.item.originallink || c.item.link),
        category: c.category,
        url: c.item.originallink || c.item.link,
      }))
      articlesEn = collected.map((c, i) => ({
        title: stripHtml(c.item.title),
        summary: summariesEn[i] || stripHtml(c.item.description),
        source: extractSource(c.item.originallink || c.item.link),
        category: c.category,
        url: c.item.originallink || c.item.link,
      }))
    } else {
      // AI 파싱 실패 시 원본 description으로 폴백
      articles = collected.map((c) => ({
        title: stripHtml(c.item.title),
        summary: stripHtml(c.item.description),
        source: extractSource(c.item.originallink || c.item.link),
        category: c.category,
        url: c.item.originallink || c.item.link,
      }))
      aiInsight = "오늘의 시장 인사이트를 불러오는 중입니다."
    }
  } catch (error) {
    console.error("Claude AI error:", error)
    // AI 실패 시 원본 데이터로 폴백
    articles = collected.map((c) => ({
      title: stripHtml(c.item.title),
      summary: stripHtml(c.item.description),
      source: extractSource(c.item.originallink || c.item.link),
      category: c.category,
      url: c.item.originallink || c.item.link,
    }))
    aiInsight = "오늘의 시장 인사이트를 불러오는 중입니다."
  }

  // Supabase upsert
  const { error: upsertError } = await supabase.from("news_digest").upsert(
    {
      date: today,
      data: { articles, aiInsight, articlesEn, aiInsightEn },
    },
    { onConflict: "date" }
  )

  if (upsertError) {
    console.error("Supabase upsert error:", upsertError)
    return Response.json({ error: "Failed to save digest" }, { status: 500 })
  }

  return Response.json({
    success: true,
    date: today,
    articlesCount: articles.length,
  })
}
