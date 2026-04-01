import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-auth"
import { getServiceClient } from "@/lib/supabase"

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const serviceClient = getServiceClient()
    const { data: subscription } = await serviceClient
      .from("subscriptions")
      .select("tier, status, current_period_end")
      .eq("user_id", user.id)
      .single()

    if (!subscription) {
      return Response.json({ tier: "free", status: "active", currentPeriodEnd: null })
    }

    return Response.json({
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
    })
  } catch (err) {
    console.error("Subscription fetch error:", err)
    return Response.json({ error: "구독 정보를 불러오지 못했습니다." }, { status: 500 })
  }
}
