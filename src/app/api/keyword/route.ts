import { NextRequest } from "next/server"
import { analyzeKeyword } from "@/lib/keyword-analyzer"
import { getServiceClient } from "@/lib/supabase"

const DAILY_LIMIT = 5

async function checkUsageLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = getServiceClient()
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("usage_limits")
    .select("count, bonus_count")
    .eq("ip_address", ip)
    .eq("date", today)
    .single()

  if (!data) return { allowed: true, remaining: DAILY_LIMIT - 1 }

  const totalAllowed = DAILY_LIMIT + (data.bonus_count || 0)
  if (data.count >= totalAllowed) return { allowed: false, remaining: 0 }
  return { allowed: true, remaining: totalAllowed - data.count - 1 }
}

async function incrementUsage(ip: string) {
  const supabase = getServiceClient()
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("usage_limits")
    .select("id, count")
    .eq("ip_address", ip)
    .eq("date", today)
    .single()

  if (data) {
    await supabase
      .from("usage_limits")
      .update({ count: data.count + 1 })
      .eq("id", data.id)
  } else {
    await supabase
      .from("usage_limits")
      .insert({ ip_address: ip, date: today, count: 1 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    const { allowed, remaining } = await checkUsageLimit(ip)
    if (!allowed) {
      return Response.json(
        { error: "오늘 무료 사용 횟수를 모두 사용했습니다. (5회/일)", remaining: 0 },
        { status: 429 }
      )
    }

    const body = await request.json()
    const keyword = body.keyword?.trim()

    if (!keyword) {
      return Response.json({ error: "키워드를 입력해주세요." }, { status: 400 })
    }
    if (keyword.length > 50) {
      return Response.json({ error: "키워드는 50자 이내로 입력해주세요." }, { status: 400 })
    }

    const result = await analyzeKeyword(keyword)

    if (!result) {
      return Response.json(
        { error: `"${keyword.replace(/[<>"'&]/g, "").slice(0, 30)}"의 검색 데이터가 없습니다. 다른 키워드를 시도해주세요.` },
        { status: 404 }
      )
    }

    await incrementUsage(ip)

    return Response.json({ ...result, remaining })
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
