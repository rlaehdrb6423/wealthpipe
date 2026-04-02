import { getServiceClient } from "@/lib/supabase"
import { getResendClient } from "@/lib/resend"
import { getAnthropicClient } from "@/lib/anthropic"
import { verifyCronAuth } from "@/lib/auth"

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceClient()

  // 1. 지난 24시간 인기 키워드 TOP 5 집계
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: keywords } = await supabase
    .from("keyword_cache")
    .select("keyword, data")
    .gte("created_at", oneDayAgo)
    .order("created_at", { ascending: false })
    .limit(50)

  if (!keywords || keywords.length === 0) {
    return Response.json({ skipped: true, reason: "No keywords today" })
  }

  // 검색량 기준 TOP 5
  const sorted = keywords
    .map((k) => ({
      keyword: k.keyword,
      volume: (k.data as Record<string, unknown>).totalVolume as number,
      grade: (k.data as Record<string, unknown>).competitionGrade as string,
      score: (k.data as Record<string, unknown>).opportunityScore as number,
      verdict: (k.data as Record<string, unknown>).verdict as string,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)

  // 2. Claude로 일일 트렌드 요약 생성
  const anthropic = getAnthropicClient()
  const keywordSummary = sorted
    .map((k, i) => `${i + 1}. "${k.keyword}" — 월간 검색량 ${k.volume?.toLocaleString()}, 경쟁 ${k.grade}등급, 기회점수 ${k.score}/100`)
    .join("\n")

  const aiResponse = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `다음은 오늘 WealthPipe에서 가장 많이 분석된 키워드 TOP 5입니다:\n\n${keywordSummary}\n\n이 키워드들을 바탕으로 블로거/마케터를 위한 오늘의 트렌드 인사이트를 3~4문장으로 작성해주세요. 톤: 실용적이고 간결하게. 한국어로 작성.`,
      },
    ],
  })

  const trendInsight =
    aiResponse.content[0].type === "text"
      ? aiResponse.content[0].text
      : "오늘의 트렌드 분석을 확인해보세요."

  // 3. 이메일 HTML 생성
  const keywordCards = sorted
    .map(
      (k) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;">
          <a href="https://wealthpipe.net/tools/keyword/${encodeURIComponent(k.keyword)}" style="color:#fff;text-decoration:none;font-weight:600;">"${k.keyword}"</a>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;color:#888;text-align:right;">
          ${k.volume?.toLocaleString()}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;text-align:center;">
          <span style="color:${k.grade === "A" ? "#22c55e" : k.grade === "B" ? "#3b82f6" : "#eab308"};font-weight:700;">${k.grade}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1a1a1a;text-align:right;color:${k.score >= 70 ? "#22c55e" : k.score >= 40 ? "#eab308" : "#ef4444"};">
          ${k.score}/100
        </td>
      </tr>`
    )
    .join("")

  const emailHtml = `
    <div style="max-width:560px;margin:0 auto;font-family:-apple-system,sans-serif;color:#e0e0e0;background:#0a0a0a;padding:32px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="display:inline-block;width:28px;height:28px;border-radius:6px;background:#fff;text-align:center;line-height:28px;font-weight:800;color:#000;font-size:14px;margin-right:10px;">W</span>
        <span style="color:#888;font-size:14px;">WealthPipe Daily</span>
      </div>

      <h1 style="font-size:22px;color:#fff;margin-bottom:8px;">오늘의 인기 키워드 TOP 5</h1>
      <p style="font-size:13px;color:#666;margin-bottom:24px;">${new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="border-bottom:2px solid #222;">
            <th style="padding:8px 16px;text-align:left;color:#888;font-size:12px;font-weight:500;">키워드</th>
            <th style="padding:8px 16px;text-align:right;color:#888;font-size:12px;font-weight:500;">검색량</th>
            <th style="padding:8px 16px;text-align:center;color:#888;font-size:12px;font-weight:500;">경쟁</th>
            <th style="padding:8px 16px;text-align:right;color:#888;font-size:12px;font-weight:500;">기회</th>
          </tr>
        </thead>
        <tbody>${keywordCards}</tbody>
      </table>

      <div style="background:#111;border:1px solid #222;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="font-size:13px;color:#888;margin-bottom:8px;font-weight:600;">AI 트렌드 인사이트</p>
        <p style="font-size:14px;line-height:1.7;color:#ccc;">${trendInsight}</p>
      </div>

      <a href="https://wealthpipe.net/tools/keyword" style="display:inline-block;padding:12px 28px;background:#fff;color:#000;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">무료 키워드 분석하기 →</a>

      <hr style="border:none;border-top:1px solid #222;margin:24px 0;" />
      <p style="font-size:11px;color:#555;">wealthpipe.net · 구독 해지는 이 이메일에 회신해주세요.</p>
    </div>
  `

  // 4. 구독자 목록 조회 + 발송
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("email, name")
    .eq("status", "active")

  if (!subscribers || subscribers.length === 0) {
    return Response.json({ skipped: true, reason: "No active subscribers" })
  }

  // Resend batch 발송 (최대 100명씩)
  const batchSize = 100
  let sent = 0
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize)
    const emails = batch.map((sub) => ({
      from: "WealthPipe <noreply@wealthpipe.net>" as const,
      to: sub.email,
      subject: `[WealthPipe] 오늘의 인기 키워드 TOP 5 — ${sorted[0].keyword}`,
      html: emailHtml,
    }))

    const resend = getResendClient()
    await resend.batch.send(emails)
    sent += batch.length
  }

  return Response.json({
    success: true,
    sent,
    topKeywords: sorted.map((k) => k.keyword),
  })
}
