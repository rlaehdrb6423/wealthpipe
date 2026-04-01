import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-auth"
import { getServiceClient } from "@/lib/supabase"

const REFERRAL_BONUS = 5

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = getServiceClient()

    const { data: referrals, error } = await service
      .from("referrals")
      .select("id, status, bonus_granted, created_at")
      .eq("referrer_id", user.id)

    if (error) {
      return Response.json({ error: "Failed to fetch referrals" }, { status: 500 })
    }

    const total = referrals?.length ?? 0
    const completed = referrals?.filter((r) => r.status === "completed").length ?? 0
    const bonusAnalyses = completed * REFERRAL_BONUS
    const referralCode = user.id.slice(0, 8)
    const referralLink = `https://wealthpipe.net?ref=${referralCode}`

    return Response.json({
      referralCode,
      referralLink,
      totalReferrals: total,
      completedReferrals: completed,
      bonusAnalyses,
    })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { referralCode } = body

    if (!referralCode || typeof referralCode !== "string") {
      return Response.json({ error: "referralCode is required" }, { status: 400 })
    }

    const service = getServiceClient()

    // referrer 유저 찾기 (profiles 테이블에서 ID prefix 매칭)
    const { data: referrerProfiles, error: referrerError } = await service
      .from("profiles")
      .select("id")
      .like("id", `${referralCode}%`)
      .limit(1)

    if (referrerError || !referrerProfiles || referrerProfiles.length === 0) {
      return Response.json({ error: "Invalid referral code" }, { status: 400 })
    }

    const referrer = referrerProfiles[0]
    if (referrer.id === user.id) {
      return Response.json({ error: "Cannot refer yourself" }, { status: 400 })
    }

    // 이미 추천 처리됐는지 확인
    const { data: existing } = await service
      .from("referrals")
      .select("id")
      .eq("referred_id", user.id)
      .single()

    if (existing) {
      return Response.json({ error: "Already referred" }, { status: 400 })
    }

    // referral 레코드 생성
    await service.from("referrals").insert({
      referrer_id: referrer.id,
      referred_email: user.email ?? "",
      referred_id: user.id,
      status: "completed",
      bonus_granted: true,
    })

    // 추천인(referrer)에게 영구 보너스 +5 (profiles.referral_bonus에 저장)
    const { data: referrerProfile } = await service
      .from("profiles")
      .select("referral_bonus")
      .eq("id", referrer.id)
      .single()

    await service
      .from("profiles")
      .update({ referral_bonus: (referrerProfile?.referral_bonus || 0) + REFERRAL_BONUS })
      .eq("id", referrer.id)

    // 피추천인(referred)에게 영구 보너스 +5
    const { data: referredProfile } = await service
      .from("profiles")
      .select("referral_bonus")
      .eq("id", user.id)
      .single()

    await service
      .from("profiles")
      .update({ referral_bonus: (referredProfile?.referral_bonus || 0) + REFERRAL_BONUS })
      .eq("id", user.id)

    return Response.json({
      success: true,
      message: "추천인 보너스가 지급되었습니다.",
      bonusGranted: REFERRAL_BONUS,
    })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
