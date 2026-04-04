import { NextRequest } from "next/server"
import { timingSafeEqual } from "crypto"
import { analyzeKeyword } from "@/lib/keyword-analyzer"
import { getServiceClient } from "@/lib/supabase"

const DAILY_LIMIT = 5

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-real-ip") || "unknown"
    const body = await request.json()
    const adminKey = request.headers.get("x-admin-key") || ""
    const isAdmin = adminKey.length > 0 && process.env.ADMIN_SECRET && adminKey.length === process.env.ADMIN_SECRET.length
      ? timingSafeEqual(Buffer.from(adminKey), Buffer.from(process.env.ADMIN_SECRET))
      : false

    let remaining = 999
    if (!isAdmin) {
      const supabase = getServiceClient()
      const today = new Date().toISOString().split("T")[0]
      const { data: usageResult, error: usageError } = await supabase.rpc("check_and_increment_usage", {
        p_ip: ip,
        p_date: today,
        p_daily_limit: DAILY_LIMIT,
      })
      if (usageError || !usageResult?.[0]?.allowed) {
        return Response.json(
          { error: "오늘 무료 사용 횟수를 모두 사용했습니다. (5회/일)", remaining: 0 },
          { status: 429 }
        )
      }
      remaining = usageResult[0].remaining
    }

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

    return Response.json({ ...result, remaining })
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
