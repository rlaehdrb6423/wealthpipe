import { getServiceClient } from "@/lib/supabase"
import Anthropic from "@anthropic-ai/sdk"
import type { KeywordResult } from "@/lib/keyword-analyzer"

const MAX_POSTS_PER_RUN = 3

function buildPrompt(keyword: string, data: KeywordResult): string {
  return `당신은 한국 블로거를 위한 SEO 최적화 콘텐츠 작성 전문가입니다.

키워드: "${keyword}"
검색량: ${data.totalVolume}
경쟁등급: ${data.competitionGrade}
기회점수: ${data.opportunityScore}/100

위 데이터를 바탕으로 SEO 최적화된 블로그 글을 작성하세요.

요구사항:
- 제목은 클릭 유도적이고 키워드를 포함
- 1500~2000자
- H2 3~4개, H3 적절히 사용
- 자연스러운 키워드 삽입 (키워드 밀도 2~3%)
- 실용적인 정보 위주
- 마지막에 WealthPipe 키워드 분석기 CTA 포함
- HTML 형식으로 출력 (p, h2, h3, ul, li, strong 태그)

응답 형식 (JSON):
{
  "title": "블로그 제목",
  "description": "150자 이내 설명",
  "content": "<h2>...</h2><p>...</p>...",
  "tags": ["태그1", "태그2", "태그3"]
}`
}

function buildEnPrompt(keyword: string, data: KeywordResult): string {
  return `You are an SEO content expert for English-speaking investors.

Keyword: "${keyword}"
Search Volume: ${data.totalVolume}
Competition Grade: ${data.competitionGrade}
Opportunity Score: ${data.opportunityScore}/100

Write an SEO-optimized blog post based on the data above.

Requirements:
- Title should be click-worthy and include the keyword
- 1500~2000 characters
- 3~4 H2 headings, H3 where appropriate
- Natural keyword insertion (2~3% keyword density)
- Focus on practical information
- Include a WealthPipe keyword analyzer CTA at the end
- Output in HTML format (p, h2, h3, ul, li, strong tags)

Response format (JSON):
{
  "title": "Blog title",
  "description": "Description within 150 characters",
  "content": "<h2>...</h2><p>...</p>...",
  "tags": ["tag1", "tag2", "tag3"]
}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface GeneratedPost {
  title: string
  description: string
  content: string
  tags: string[]
}

async function generatePost(
  anthropic: Anthropic,
  prompt: string
): Promise<GeneratedPost | null> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  })

  const text =
    response.content[0].type === "text" ? response.content[0].text : null
  if (!text) return null

  // JSON 추출 (마크다운 코드 블록 처리)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
    text.match(/(\{[\s\S]*\})/)
  if (!jsonMatch) return null

  try {
    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]) as GeneratedPost
    // Sanitize HTML: strip all tags except safe ones
    if (parsed.content) {
      parsed.content = parsed.content.replace(
        /<(?!\/?(?:p|h[2-4]|ul|ol|li|strong|em|br|a)\b)[^>]*>/gi,
        ""
      )
    }
    return parsed
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceClient()

  // pending 항목 최대 3개 가져오기
  const { data: queueItems, error: fetchError } = await supabase
    .from("content_queue")
    .select("id, keyword, keyword_data")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(MAX_POSTS_PER_RUN)

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  if (!queueItems || queueItems.length === 0) {
    return Response.json({ skipped: true, reason: "No pending items in queue" })
  }

  const anthropic = new Anthropic()
  const results: { keyword: string; status: string; slug?: string }[] = []

  for (const item of queueItems) {
    const { id, keyword, keyword_data } = item

    // status → generating
    await supabase
      .from("content_queue")
      .update({ status: "generating", updated_at: new Date().toISOString() })
      .eq("id", id)

    try {
      const data = keyword_data as KeywordResult

      // 한국어 글 생성
      const koPost = await generatePost(anthropic, buildPrompt(keyword, data))
      if (!koPost) {
        await supabase
          .from("content_queue")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", id)
        results.push({ keyword, status: "failed" })
        continue
      }

      const koSlug = `${slugify(keyword)}-${Date.now()}`

      const { error: koError } = await supabase.from("blog_posts").upsert(
        {
          slug: koSlug,
          title: koPost.title,
          description: koPost.description,
          content: koPost.content,
          tags: koPost.tags,
          locale: "ko",
          published: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )

      if (koError) {
        await supabase
          .from("content_queue")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", id)
        results.push({ keyword, status: "failed" })
        continue
      }

      // 영문 글 생성
      const enPost = await generatePost(anthropic, buildEnPrompt(keyword, data))
      if (enPost) {
        const enSlug = `${slugify(keyword)}-en-${Date.now()}`
        await supabase.from("blog_posts").upsert(
          {
            slug: enSlug,
            title: enPost.title,
            description: enPost.description,
            content: enPost.content,
            tags: enPost.tags,
            locale: "en",
            published: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        )
      }

      // content_queue → completed
      await supabase
        .from("content_queue")
        .update({
          status: "completed",
          blog_slug: koSlug,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      results.push({ keyword, status: "completed", slug: koSlug })
    } catch {
      await supabase
        .from("content_queue")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", id)
      results.push({ keyword, status: "failed" })
    }
  }

  return Response.json({
    success: true,
    processed: results.length,
    results,
  })
}
