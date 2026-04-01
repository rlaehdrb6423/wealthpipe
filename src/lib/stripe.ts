import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

export const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: 'Pro',
    price: 9900, // KRW
    priceUsd: 999, // cents
    limits: { keyword: Infinity, structure: Infinity },
  },
  business: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    name: 'Business',
    price: 29900,
    priceUsd: 2999,
    limits: { keyword: Infinity, structure: Infinity },
  },
} as const

export const FREE_LIMITS = { keyword: 5, structure: 3 }
