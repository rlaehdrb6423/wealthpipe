import { NextRequest } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase-auth"
import { getServiceClient } from "@/lib/supabase"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthpipe.net"

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const serviceClient = getServiceClient()
    const { data: subscription } = await serviceClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return Response.json({ error: "활성 구독이 없습니다." }, { status: 404 })
    }

    const stripe = getStripe()
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${SITE_URL}/pricing`,
    })

    return Response.json({ url: portalSession.url })
  } catch (err) {
    console.error("Stripe portal error:", err)
    return Response.json({ error: "포털 세션 생성에 실패했습니다." }, { status: 500 })
  }
}
