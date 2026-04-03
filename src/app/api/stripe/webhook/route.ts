import { NextRequest } from "next/server"
import { getStripe } from "@/lib/stripe"
import { getServiceClient } from "@/lib/supabase"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const tier = session.metadata?.tier as "pro" | "business"

        if (!userId || !tier) break

        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const item = subscription.items.data[0]

        const { error: upsertError } = await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          tier,
          status: subscription.status,
          current_period_start: item ? new Date(item.current_period_start * 1000).toISOString() : null,
          current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })

        if (upsertError) {
          console.error("Failed to upsert subscription:", upsertError)
          return Response.json({ error: "Subscription upsert failed" }, { status: 500 })
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ tier })
          .eq("id", userId)

        if (profileError) {
          console.error("Failed to update profile tier:", profileError)
        }

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const tier = (subscription.metadata?.tier as "pro" | "business") || "pro"

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        const updatedItem = subscription.items.data[0]

        await supabase
          .from("subscriptions")
          .update({
            tier,
            status: subscription.status,
            current_period_start: updatedItem ? new Date(updatedItem.current_period_start * 1000).toISOString() : null,
            current_period_end: updatedItem ? new Date(updatedItem.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (existing?.user_id) {
          await supabase
            .from("profiles")
            .update({ tier })
            .eq("id", existing.user_id)
        }

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        await supabase
          .from("subscriptions")
          .delete()
          .eq("stripe_subscription_id", subscription.id)

        if (existing?.user_id) {
          await supabase
            .from("profiles")
            .update({ tier: "free" })
            .eq("id", existing.user_id)
        }

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subDetails = invoice.parent?.subscription_details
        const rawSub = subDetails?.subscription
        const subscriptionId = typeof rawSub === "string" ? rawSub : rawSub?.id

        if (subscriptionId) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subscriptionId)
        }

        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    return Response.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return Response.json({ received: true })
}
