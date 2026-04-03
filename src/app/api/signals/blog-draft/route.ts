import { getServiceClient } from "@/lib/supabase"
import { verifyCronAuth } from "@/lib/auth"
import { getAnthropicClient } from "@/lib/anthropic"

interface Asset {
  name: string
  ticker: string
  price: number
  change: number
  changePercent: number
  signal: string
  signalReason: string
  news: string
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceClient()
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("asset_signals")
    .select("data, date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data?.data?.assets?.length) {
    return Response.json({ error: "No signals" }, { status: 404 })
  }

  const assets = data.data.assets as Asset[]
  const aiInsight = data.data.aiInsight || ""
  const dateStr = data.date

  const assetSummary = assets
    .map((a) => {
      const dir = a.signal === "bullish" ? "상승" : a.signal === "bearish" ? "하락" : "중립"
      const change = a.changePercent >= 0 ? `+${a.changePercent.toFixed(2)}%` : `${a.changePercent.toFixed(2)}%`
      return `- ${a.name}: ${a.price.toLocaleString()} (${change}) → ${dir} 시그널. ${a.signalReason}`
    })
    .join("\n")

  const anthropic = getAnthropicClient()
  const aiResponse = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `다음은 ${dateStr} AI 시장 시그널 데이터입니다:

${assetSummary}

AI 인사이트: ${aiInsight}

이 데이터를 기반으로 네이버 블로그 포스팅을 작성해주세요.

규칙:
- 제목은 H1 하나만, 날짜 포함
- 모바일 가독성: 한 문단 2~3줄, 줄바꿈 자주
- ** 볼드 사용 금지, H2~H4 제목으로 구분
- 각 자산별로 짧게 분석 (3줄 이내)
- 마지막에 "무료로 시그널 확인하기: https://wealthpipe.net/ko/tools/signals" CTA
- 총 길이: 800~1200자`,
      },
    ],
  })

  const blogContent = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : ""

  // Supabase에 저장
  await supabase.from("blog_drafts").upsert(
    {
      date: dateStr,
      type: "signals",
      content: blogContent,
      created_at: new Date().toISOString(),
    },
    { onConflict: "date,type" }
  )

  return Response.json({ success: true, date: dateStr, preview: blogContent.substring(0, 200) })
}
