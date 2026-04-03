import { NextRequest } from "next/server"
import { randomBytes } from "crypto"
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

    // referral_code가 없으면 생성
    const { data: profile } = await service
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single()

    let referralCode = profile?.referral_code
    if (!referralCode) {
      referralCode = randomBytes(5).toString("hex") // 10자리 랜덤 hex
      await service
        .from("profiles")
        .update({ referral_code: referralCode })
        .eq("id", user.id)
    }

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

    // referrer 유저 찾기 (referral_code 정확 매칭)
    const { data: referrerProfile, error: referrerError } = await service
      .from("profiles")
      .select("id")
      .eq("referral_code", referralCode)
      .single()

    if (referrerError || !referrerProfile) {
      return Response.json({ error: "Invalid referral code" }, { status: 400 })
    }

    const referrer = referrerProfile
    if (referrer.id === user.id) {
      return Response.json({ error: "Cannot refer yourself" }, { status: 400 })
    }

    // referral 레코드 생성 (중복 시 DB unique 제약으로 방지)
    const { error: insertError } = await service.from("referrals").insert({
      referrer_id: referrer.id,
      referred_email: user.email ?? "",
      referred_id: user.id,
      status: "completed",
      bonus_granted: true,
    })

    if (insertError) {
      if (insertError.code === "23505") {
        return Response.json({ error: "Already referred" }, { status: 400 })
      }
      return Response.json({ error: "Failed to create referral" }, { status: 500 })
    }

    // 추천인(referrer)에게 영구 보너스 +5 (원자적 증가)
    await service.rpc("increment_referral_bonus", {
      user_id: referrer.id,
      amount: REFERRAL_BONUS,
    })

    // 피추천인(referred)에게 영구 보너스 +5 (원자적 증가)
    await service.rpc("increment_referral_bonus", {
      user_id: user.id,
      amount: REFERRAL_BONUS,
    })

    return Response.json({
      success: true,
      message: "추천인 보너스가 지급되었습니다.",
      bonusGranted: REFERRAL_BONUS,
    })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
