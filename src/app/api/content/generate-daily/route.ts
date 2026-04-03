import { getServiceClient } from "@/lib/supabase"
import { getAnthropicClient } from "@/lib/anthropic"
import { verifyCronAuth } from "@/lib/auth"
import { publishToWordPress } from "@/lib/wordpress"
import { sanitizeBlogContent } from "@/lib/sanitize"
import type Anthropic from "@anthropic-ai/sdk"
import type { KeywordResult } from "@/lib/keyword-analyzer"

// 경쟁강도 A~B (낮은 경쟁) 키워드 중 기회점수 높은 순으로 선택
async function pickBestKeyword(supabase: ReturnType<typeof getServiceClient>) {
  // 오늘 이미 생성했는지 확인
  const today = new Date().toISOString().split("T")[0]
  const { data: existing } = await supabase
    .from("daily_content")
    .select("id")
    .gte("created_at", `${today}T00:00:00Z`)
    .limit(1)

  if (existing && existing.length > 0) {
    return null // 오늘 이미 생성됨
  }

  // content_queue에서 경쟁강도 낮은 키워드 선택
  const { data: candidates } = await supabase
    .from("content_queue")
    .select("keyword, keyword_data")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50)

  if (!candidates || candidates.length === 0) return null

  // 기회점수 높은 순 정렬 (경쟁강도 A~C 우선, 없으면 D~E도 허용)
  const withData = candidates.filter((c) => {
    const d = c.keyword_data as KeywordResult | null
    return d && d.competitionGrade
  })
  const lowComp = withData.filter((c) =>
    ["A", "B", "C"].includes((c.keyword_data as KeywordResult).competitionGrade)
  )
  const scored = (lowComp.length > 0 ? lowComp : withData)
    .sort((a, b) => {
      const da = a.keyword_data as KeywordResult
      const db = b.keyword_data as KeywordResult
      return (db.opportunityScore || 0) - (da.opportunityScore || 0)
    })

  // 최근 사용한 키워드 제외
  const { data: recent } = await supabase
    .from("daily_content")
    .select("keyword")
    .order("created_at", { ascending: false })
    .limit(30)

  const usedKeywords = new Set(recent?.map((r) => r.keyword) || [])
  const picked = scored.find((s) => !usedKeywords.has(s.keyword))

  return picked || scored[0] || null
}

function buildNaverBlogPrompt(keyword: string, data: KeywordResult): string {
  return `당신은 네이버 블로그 SEO 전문 작가입니다.

키워드: "${keyword}"
검색량: ${data.totalVolume} (PC: ${data.pcVolume}, 모바일: ${data.mobileVolume})
경쟁등급: ${data.competitionGrade} (${data.competitionLabel})
기회점수: ${data.opportunityScore}/100

네이버 블로그에 올릴 정보글을 작성하세요.

규칙:
- "요"체 사용 (친근한 존댓말)
- 1500~2000자
- 모바일 가독성 최우선: 한 문단 2~3줄, 자주 줄바꿈
- H2 3~4개, H3 적절히
- 키워드 자연 삽입 (2~3%)
- 실용적 정보 위주, 구체적 데이터 포함
- 볼드(**) 사용 금지 — 제목 계층으로 구분
- AI틱 표현 금지: 혁신적인, 획기적인, 놀라운, 드디어, 마침내, 게임체인저
- 중학생도 이해할 수 있는 수준
- HTML 형식 (p, h2, h3, ul, li 태그)

응답 형식 (JSON):
{
  "title": "제목",
  "content": "<h2>...</h2><p>...</p>...",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"]
}`
}

function buildWordPressPrompt(keyword: string, data: KeywordResult): string {
  return `당신은 워드프레스 SEO 블로그 전문 작가입니다.

키워드: "${keyword}"
검색량: ${data.totalVolume}
경쟁등급: ${data.competitionGrade}
기회점수: ${data.opportunityScore}/100

워드프레스 블로그(igetmindset.com)에 올릴 정보글을 작성하세요.

규칙:
- "요"체 사용 (친근한 존댓말)
- 2000~3000자 (워드프레스는 좀 더 길게)
- H2 4~5개, H3 적절히
- 키워드 자연 삽입 (2~3%)
- 실용적 정보 + 구체적 데이터
- FAQ 섹션 포함 (Q&A 2~3개)
- 볼드(**) 사용 금지 — 제목 계층으로 구분
- AI틱 표현 금지
- HTML 형식 (p, h2, h3, h4, ul, li 태그)

응답 형식 (JSON):
{
  "title": "제목",
  "description": "150자 이내 메타 설명",
  "content": "<h2>...</h2><p>...</p>...",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"]
}`
}

function buildSocialPrompt(keyword: string, data: KeywordResult, platform: "threads" | "x"): string {
  const platformName = platform === "threads" ? "쓰레드(Threads)" : "X(트위터)"
  const maxLen = platform === "threads" ? "500자" : "280자"

  return `당신은 ${platformName} 바이럴 콘텐츠 전문가입니다.

키워드/주제: "${keyword}"
관련 데이터: 검색량 ${data.totalVolume}, 경쟁등급 ${data.competitionGrade}

${platformName}에 올릴 글 3개를 작성하세요.
3개는 각각 다른 앵글이어야 합니다:

1번: 밈/개그 — 해당 주제를 재밌게 비틀어서. 공감되는 유머.
2번: 정보 — 핵심 팁이나 데이터를 짧고 임팩트 있게.
3번: 밈+정보 믹스 — 유머로 시작해서 유용한 정보로 마무리.

규칙:
- 각 글 ${maxLen} 이내
- 반말 OK, 친구한테 말하듯이
- wealthpipe.net 링크 넣지 마세요
- 해시태그는 글당 3~5개
- AI틱 표현 절대 금지
- 이모지 적당히 (글당 0~2개)
- 한국어로 작성

응답 형식 (JSON):
{
  "posts": [
    { "content": "글 내용\\n\\n#해시태그1 #해시태그2", "angle": "meme" },
    { "content": "글 내용\\n\\n#해시태그1 #해시태그2", "angle": "info" },
    { "content": "글 내용\\n\\n#해시태그1 #해시태그2", "angle": "mix" }
  ]
}`
}

async function callClaude(
  anthropic: Anthropic,
  prompt: string,
  maxTokens = 2000
): Promise<string | null> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  })
  return response.content[0].type === "text" ? response.content[0].text : null
}

function parseJson<T>(text: string | null): T | null {
  if (!text) return null
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/)
  if (!match) return null
  try {
    return JSON.parse(match[1] || match[0]) as T
  } catch {
    return null
  }
}

interface BlogResult {
  title: string
  description?: string
  content: string
  tags: string[]
}

interface SocialResult {
  posts: { content: string; angle: string }[]
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceClient()

  // 1. 키워드 선정
  const picked = await pickBestKeyword(supabase)
  if (!picked) {
    return Response.json({ skipped: true, reason: "No suitable keyword or already generated today" })
  }

  const { keyword, keyword_data } = picked
  const data = keyword_data as KeywordResult
  const anthropic = getAnthropicClient()
  const results: { platform: string; status: string; error?: string }[] = []

  // 2. 4개 플랫폼 콘텐츠 병렬 생성
  const [naverRaw, wpRaw, threadsRaw, xRaw] = await Promise.allSettled([
    callClaude(anthropic, buildNaverBlogPrompt(keyword, data), 2500),
    callClaude(anthropic, buildWordPressPrompt(keyword, data), 3500),
    callClaude(anthropic, buildSocialPrompt(keyword, data, "threads")),
    callClaude(anthropic, buildSocialPrompt(keyword, data, "x")),
  ])

  const naverPost = parseJson<BlogResult>(naverRaw.status === "fulfilled" ? naverRaw.value : null)
  let wpPost = parseJson<BlogResult>(wpRaw.status === "fulfilled" ? wpRaw.value : null)

  // WP 생성 실패 시 1회 재시도
  if (!wpPost) {
    console.log("WP generation failed, retrying...", wpRaw.status === "rejected" ? wpRaw.reason : "parse error")
    const wpRetry = await callClaude(anthropic, buildWordPressPrompt(keyword, data), 4000)
    wpPost = parseJson<BlogResult>(wpRetry)
  }
  const threadsPosts = parseJson<SocialResult>(threadsRaw.status === "fulfilled" ? threadsRaw.value : null)
  const xPosts = parseJson<SocialResult>(xRaw.status === "fulfilled" ? xRaw.value : null)

  // 3. 네이버 블로그 저장
  if (naverPost) {
    naverPost.content = sanitizeBlogContent(naverPost.content)
    await supabase.from("daily_content").insert({
      keyword,
      keyword_data,
      platform: "naver_blog",
      title: naverPost.title,
      content: naverPost.content,
      tags: naverPost.tags || [],
    })
    results.push({ platform: "naver_blog", status: "ok" })
  } else {
    results.push({ platform: "naver_blog", status: "failed", error: "Generation failed" })
  }

  // 4. 워드프레스 저장 + 자동 발행
  if (wpPost) {
    wpPost.content = sanitizeBlogContent(wpPost.content)
    let wpId: number | null = null
    let wpUrl: string | null = null

    try {
      const wpResult = await publishToWordPress({
        title: wpPost.title,
        content: wpPost.content,
        excerpt: wpPost.description,
        tags: wpPost.tags,
      })
      wpId = wpResult.id
      wpUrl = wpResult.url
    } catch (e) {
      console.error("WP publish error:", e)
    }

    await supabase.from("daily_content").insert({
      keyword,
      keyword_data,
      platform: "wordpress",
      title: wpPost.title,
      content: wpPost.content,
      tags: wpPost.tags || [],
      wp_post_id: wpId,
      wp_post_url: wpUrl,
    })
    results.push({
      platform: "wordpress",
      status: wpId ? "published" : "saved_only",
      error: wpId ? undefined : "WP publish failed, content saved",
    })
  } else {
    results.push({ platform: "wordpress", status: "failed", error: "Generation failed" })
  }

  // 5. 쓰레드 3개 저장
  if (threadsPosts?.posts) {
    for (const post of threadsPosts.posts) {
      await supabase.from("daily_content").insert({
        keyword,
        keyword_data,
        platform: "threads",
        title: post.angle,
        content: post.content,
        tags: [],
      })
    }
    results.push({ platform: "threads", status: "ok" })
  } else {
    results.push({ platform: "threads", status: "failed", error: "Generation failed" })
  }

  // 6. X 3개 저장
  if (xPosts?.posts) {
    for (const post of xPosts.posts) {
      await supabase.from("daily_content").insert({
        keyword,
        keyword_data,
        platform: "x",
        title: post.angle,
        content: post.content,
        tags: [],
      })
    }
    results.push({ platform: "x", status: "ok" })
  } else {
    results.push({ platform: "x", status: "failed", error: "Generation failed" })
  }

  return Response.json({
    success: true,
    keyword,
    competitionGrade: data.competitionGrade,
    opportunityScore: data.opportunityScore,
    results,
  })
}
