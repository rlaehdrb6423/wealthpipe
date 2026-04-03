import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-auth"
import { getServiceClient } from "@/lib/supabase"
import { FREE_LIMITS } from "@/lib/stripe"

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Authentication required." }, { status: 401 })
    }

    const serviceClient = getServiceClient()
    const today = new Date().toISOString().slice(0, 10)

    const [profileRes, usageRes, subscriptionRes, referralRes] = await Promise.all([
      serviceClient
        .from("profiles")
        .select("tier, email, referral_bonus")
        .eq("id", user.id)
        .single(),
      serviceClient
        .from("usage_limits")
        .select("keyword_count, structure_count")
        .eq("user_id", user.id)
        .eq("date", today)
        .single(),
      serviceClient
        .from("subscriptions")
        .select("tier, status, current_period_end, stripe_subscription_id")
        .eq("user_id", user.id)
        .single(),
      serviceClient
        .from("referrals")
        .select("id")
        .eq("referrer_id", user.id),
    ])

    const profile = profileRes.data
    const tier = profile?.tier ?? subscriptionRes.data?.tier ?? "free"

    const isPaid = tier === "pro" || tier === "business"
    const keywordLimit = isPaid ? Infinity : FREE_LIMITS.keyword + (profile?.referral_bonus ?? 0)
    const structureLimit = isPaid ? Infinity : FREE_LIMITS.structure

    return Response.json({
      user: {
        email: profile?.email ?? user.email ?? "",
        tier,
        referral_bonus: profile?.referral_bonus ?? 0,
      },
      usage: {
        keyword_count: usageRes.data?.keyword_count ?? 0,
        structure_count: usageRes.data?.structure_count ?? 0,
        keyword_limit: isPaid ? null : keywordLimit,
        structure_limit: isPaid ? null : structureLimit,
      },
      subscription: subscriptionRes.data
        ? {
            status: subscriptionRes.data.status,
            current_period_end: subscriptionRes.data.current_period_end,
          }
        : null,
      referrals: {
        count: referralRes.data?.length ?? 0,
        bonus: profile?.referral_bonus ?? 0,
      },
    })
  } catch (err) {
    console.error("Dashboard fetch error:", err)
    return Response.json({ error: "Failed to load dashboard data." }, { status: 500 })
  }
}
