import { NextRequest } from "next/server"
import { timingSafeEqual } from "crypto"
import Anthropic from "@anthropic-ai/sdk"
import { getServiceClient } from "@/lib/supabase"

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" })
}

const DAILY_LIMIT = 3

async function checkStructureLimit(ip: string): Promise<boolean> {
  const supabase = getServiceClient()
  const today = new Date().toISOString().split("T")[0]
  const { data } = await supabase
    .from("structure_usage")
    .select("count")
    .eq("ip_address", ip)
    .eq("date", today)
    .single()
  return !data || data.count < DAILY_LIMIT
}

async function incrementStructureUsage(ip: string) {
  const supabase = getServiceClient()
  const today = new Date().toISOString().split("T")[0]
  const { data } = await supabase
    .from("structure_usage")
    .select("id, count")
    .eq("ip_address", ip)
    .eq("date", today)
    .single()
  if (data) {
    await supabase.from("structure_usage").update({ count: data.count + 1 }).eq("id", data.id)
  } else {
    await supabase.from("structure_usage").insert({ ip_address: ip, date: today, count: 1 })
  }
}

async function getCachedStructure(keyword: string): Promise<BlogStructure | null> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("structure_cache")
    .select("data, created_at")
    .eq("keyword", keyword)
    .single()
  if (!data) return null
  const age = Date.now() - new Date(data.created_at).getTime()
  if (age > 7 * 24 * 60 * 60 * 1000) return null
  return data.data as BlogStructure
}

async function setCacheStructure(keyword: string, result: BlogStructure) {
  const supabase = getServiceClient()
  await supabase
    .from("structure_cache")
    .upsert({ keyword, data: result, created_at: new Date().toISOString() }, { onConflict: "keyword" })
}

interface BlogStructure {
  h1: string
  h2: string[]
  lsiKeywords: string[]
  recommendedLength: number
  tip: string
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const adminKey = request.headers.get("x-admin-key") || ""
    const isAdmin = adminKey.length > 0 && process.env.ADMIN_SECRET && adminKey.length === process.env.ADMIN_SECRET.length
      ? timingSafeEqual(Buffer.from(adminKey), Buffer.from(process.env.ADMIN_SECRET))
      : false

    if (!isAdmin) {
      const allowed = await checkStructureLimit(ip)
      if (!allowed) {
        return Response.json(
          { error: "AI 글 구조 추천은 하루 3회까지 무료입니다." },
          { status: 429 }
        )
      }
    }

    const body = await request.json()
    const keyword = body.keyword?.trim()
    const context = body.context || {}

    if (!keyword) {
      return Response.json({ error: "키워드를 입력해주세요." }, { status: 400 })
    }

    const cached = await getCachedStructure(keyword)
    if (cached) return Response.json(cached)

    const contextInfo = [
      context.totalVolume ? `월간 검색량: ${context.totalVolume}` : "",
      context.competitionLabel ? `경쟁도: ${context.competitionLabel}` : "",
      context.topTitles?.length ? `상위 블로그 제목:\n${context.topTitles.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}` : "",
      context.topWords?.length ? `자주 쓰이는 단어: ${context.topWords.join(", ")}` : "",
    ].filter(Boolean).join("\n")

    const message = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `한국 네이버 블로그 SEO 전문가로서, "${keyword}" 키워드로 상위 노출될 블로그 글 구조를 추천해줘.

${contextInfo}

반드시 아래 JSON 형식으로만 응답해. 다른 텍스트 없이 JSON만:
{
  "h1": "메인 제목 (키워드 포함, 40자 이내)",
  "h2": ["소제목1", "소제목2", "소제목3", "소제목4"],
  "lsiKeywords": ["LSI키워드1", "LSI키워드2", "LSI키워드3", "LSI키워드4", "LSI키워드5"],
  "recommendedLength": 2500,
  "tip": "이 키워드로 글 쓸 때 핵심 팁 (1문장)"
}`
      }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: "AI 응답 파싱 실패" }, { status: 500 })
    }

    const structure: BlogStructure = JSON.parse(jsonMatch[0])
    await setCacheStructure(keyword, structure)
    if (!isAdmin) await incrementStructureUsage(ip)

    return Response.json(structure)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("keyword-structure error:", msg)
    return Response.json({ error: "AI 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
