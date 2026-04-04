import { NextRequest } from "next/server"
import { getServiceClient } from "@/lib/supabase"

const PLATFORMS = ["kakao", "twitter", "copy"] as const
const BONUS_PER_SHARE = 3
const MAX_DAILY_SHARES = 3

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-real-ip") || "unknown"
    const body = await request.json()
    const { keyword, platform } = body

    if (!keyword || typeof keyword !== "string") {
      return Response.json({ error: "키워드가 필요합니다." }, { status: 400 })
    }

    if (!platform || !PLATFORMS.includes(platform)) {
      return Response.json({ error: "올바른 공유 플랫폼을 지정해주세요." }, { status: 400 })
    }

    const supabase = getServiceClient()
    const today = new Date().toISOString().split("T")[0]

    // 오늘 공유 횟수 확인 + IP+keyword+platform 중복 체크
    const { count } = await supabase
      .from("shares")
      .select("*", { count: "exact", head: true })
      .eq("sharer_ip", ip)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)

    const todayShares = count ?? 0

    if (todayShares >= MAX_DAILY_SHARES) {
      return Response.json({
        rewarded: false,
        message: "오늘의 공유 보상을 모두 받으셨습니다.",
        todayShares,
        maxShares: MAX_DAILY_SHARES,
      })
    }

    // 공유 기록 저장 (동일 IP+keyword+platform+date 중복 시 DB unique constraint로 방지)
    const { error: insertError } = await supabase.from("shares").insert({
      keyword: keyword.slice(0, 50),
      platform,
      sharer_ip: ip,
      share_date: today,
    })

    if (insertError) {
      if (insertError.code === "23505") {
        return Response.json({
          rewarded: false,
          message: "이미 이 키워드를 해당 플랫폼으로 공유하셨습니다.",
          todayShares,
          maxShares: MAX_DAILY_SHARES,
        })
      }
      return Response.json({ error: "공유 기록 저장 실패" }, { status: 500 })
    }

    // 보너스 분석 횟수 부여 (원자적 upsert)
    const { data: usage } = await supabase
      .from("usage_limits")
      .select("id")
      .eq("ip_address", ip)
      .eq("date", today)
      .single()

    if (usage) {
      await supabase.rpc("increment_bonus_count", {
        p_ip: ip,
        p_date: today,
        p_amount: BONUS_PER_SHARE,
      })
    } else {
      await supabase
        .from("usage_limits")
        .insert({ ip_address: ip, date: today, count: 0, bonus_count: BONUS_PER_SHARE })
    }

    return Response.json({
      rewarded: true,
      message: `공유 감사합니다! 보너스 분석 ${BONUS_PER_SHARE}회가 추가되었습니다.`,
      todayShares: todayShares + 1,
      maxShares: MAX_DAILY_SHARES,
      bonusAdded: BONUS_PER_SHARE,
    })
  } catch {
    return Response.json({ error: "보상 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
