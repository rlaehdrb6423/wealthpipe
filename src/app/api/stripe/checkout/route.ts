import { NextRequest } from "next/server"
import { getStripe, PLANS } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase-auth"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthpipe.net"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { tier } = body as { tier: "pro" | "business" }

    if (!tier || !PLANS[tier]) {
      return Response.json({ error: "유효하지 않은 플랜입니다." }, { status: 400 })
    }

    const plan = PLANS[tier]
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/pricing?success=true`,
      cancel_url: `${SITE_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        tier,
      },
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error("Stripe checkout error:", err)
    return Response.json({ error: "결제 세션 생성에 실패했습니다." }, { status: 500 })
  }
}
