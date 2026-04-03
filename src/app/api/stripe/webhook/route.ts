import { NextRequest } from "next/server"
import { getStripe } from "@/lib/stripe"
import { getServiceClient } from "@/lib/supabase"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    console.error("[stripe-webhook] Missing stripe-signature header")
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err instanceof Error ? err.message : err)
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const supabase = getServiceClient()

  console.log(`[stripe-webhook] Processing event: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const tier = session.metadata?.tier as "pro" | "business"

        if (!userId || !tier) {
          console.warn(`[stripe-webhook] checkout.session.completed missing metadata: user_id=${userId}, tier=${tier}, session=${session.id}`)
          break
        }

        const subscriptionId = session.subscription as string
        if (!subscriptionId) {
          console.error(`[stripe-webhook] checkout.session.completed has no subscription ID, session=${session.id}`)
          break
        }

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
          console.error(`[stripe-webhook] Failed to upsert subscription for user=${userId}:`, upsertError)
          return Response.json({ error: "Subscription upsert failed" }, { status: 500 })
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ tier })
          .eq("id", userId)

        if (profileError) {
          console.error(`[stripe-webhook] Failed to update profile tier for user=${userId}:`, profileError)
        } else {
          console.log(`[stripe-webhook] User ${userId} upgraded to ${tier} via checkout`)
        }

        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subDetails = invoice.parent?.subscription_details
        const rawSub = subDetails?.subscription
        const subscriptionId = typeof rawSub === "string" ? rawSub : rawSub?.id

        if (!subscriptionId) {
          console.warn(`[stripe-webhook] invoice.payment_succeeded has no subscription ID, invoice=${invoice.id}`)
          break
        }

        // Retrieve the subscription to get the latest period info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const item = subscription.items.data[0]

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("user_id, tier")
          .eq("stripe_subscription_id", subscriptionId)
          .single()

        if (existing) {
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: item ? new Date(item.current_period_start * 1000).toISOString() : null,
              current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId)

          if (updateError) {
            console.error(`[stripe-webhook] Failed to confirm subscription active for sub=${subscriptionId}:`, updateError)
          }

          // Ensure profile tier is up-to-date (handles recovery from past_due)
          if (existing.user_id && existing.tier) {
            await supabase
              .from("profiles")
              .update({ tier: existing.tier })
              .eq("id", existing.user_id)
          }

          console.log(`[stripe-webhook] Payment succeeded, subscription ${subscriptionId} confirmed active for user=${existing.user_id}`)
        } else {
          console.warn(`[stripe-webhook] invoice.payment_succeeded but no matching subscription found for sub=${subscriptionId}`)
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

        if (!existing) {
          console.warn(`[stripe-webhook] subscription.updated but no matching record for sub=${subscription.id}`)
          break
        }

        const updatedItem = subscription.items.data[0]

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            tier,
            status: subscription.status,
            current_period_start: updatedItem ? new Date(updatedItem.current_period_start * 1000).toISOString() : null,
            current_period_end: updatedItem ? new Date(updatedItem.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (updateError) {
          console.error(`[stripe-webhook] Failed to update subscription for sub=${subscription.id}:`, updateError)
        }

        if (existing.user_id) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ tier })
            .eq("id", existing.user_id)

          if (profileError) {
            console.error(`[stripe-webhook] Failed to update profile for user=${existing.user_id}:`, profileError)
          } else {
            console.log(`[stripe-webhook] Subscription updated: user=${existing.user_id}, tier=${tier}, status=${subscription.status}`)
          }
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

        const { error: deleteError } = await supabase
          .from("subscriptions")
          .delete()
          .eq("stripe_subscription_id", subscription.id)

        if (deleteError) {
          console.error(`[stripe-webhook] Failed to delete subscription for sub=${subscription.id}:`, deleteError)
        }

        if (existing?.user_id) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ tier: "free" })
            .eq("id", existing.user_id)

          if (profileError) {
            console.error(`[stripe-webhook] Failed to downgrade profile for user=${existing.user_id}:`, profileError)
          } else {
            console.log(`[stripe-webhook] Subscription deleted: user=${existing.user_id} downgraded to free`)
          }
        } else {
          console.warn(`[stripe-webhook] subscription.deleted but no matching record for sub=${subscription.id}`)
        }

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subDetails = invoice.parent?.subscription_details
        const rawSub = subDetails?.subscription
        const subscriptionId = typeof rawSub === "string" ? rawSub : rawSub?.id

        if (subscriptionId) {
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subscriptionId)

          if (updateError) {
            console.error(`[stripe-webhook] Failed to mark subscription past_due for sub=${subscriptionId}:`, updateError)
          } else {
            console.log(`[stripe-webhook] Payment failed, subscription ${subscriptionId} marked past_due`)
          }
        } else {
          console.warn(`[stripe-webhook] invoice.payment_failed has no subscription ID, invoice=${invoice.id}`)
        }

        break
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
        break
    }
  } catch (err) {
    console.error(`[stripe-webhook] Handler error for ${event.type} (${event.id}):`, err instanceof Error ? { message: err.message, stack: err.stack } : err)
    return Response.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return Response.json({ received: true })
}
