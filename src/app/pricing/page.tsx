import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import PricingClient from "./PricingClient"

const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: "Pricing — WealthPipe",
  description: "Compare Free, Pro, and Business plans. Get unlimited keyword analysis, AI blog structures, and more with WealthPipe Pro.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
    languages: {
      en: `${SITE_URL}/pricing`,
      ko: `${SITE_URL}/ko/pricing`,
    },
  },
}

const features = [
  { name: "Keyword Analysis", free: "5 / day", pro: "Unlimited", business: "Unlimited" },
  { name: "AI Blog Structure", free: "3 / day", pro: "Unlimited", business: "Unlimited" },
  { name: "Search Trend Chart", free: "✓", pro: "✓", business: "✓" },
  { name: "Keyword Comparison", free: "1 / day", pro: "Unlimited", business: "Unlimited" },
  { name: "Keyword History", free: "—", pro: "✓", business: "✓" },
  { name: "CSV Export", free: "—", pro: "✓", business: "✓" },
  { name: "API Access", free: "—", pro: "—", business: "✓" },
  { name: "Keyword Alerts", free: "—", pro: "—", business: "✓" },
  { name: "Dedicated Support", free: "—", pro: "—", business: "✓" },
  { name: "Priority Support", free: "—", pro: "✓", business: "✓" },
]

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Link href="/" style={{ color: "#666", fontSize: 14, textDecoration: "none" }}>
            ← WealthPipe
          </Link>
          <Link href="/ko/pricing" style={{ color: "#666", fontSize: 13, textDecoration: "none", border: "1px solid #333", padding: "4px 12px", borderRadius: 6 }}>
            한국어
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Simple, Transparent Pricing</h1>
          <p style={{ color: "#888", fontSize: 16 }}>Start free. Upgrade when you need more.</p>
        </div>

        {/* Success/Cancel banners */}
        <Suspense>
          <PricingClient locale="en" showBanners />
        </Suspense>

        {/* Plan Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 48 }}>
          {/* Free */}
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: 28 }}>
            <p style={{ color: "#888", fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>FREE</p>
            <p style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>$0</p>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>Forever free</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", color: "#888", fontSize: 13, lineHeight: 1.8 }}>
              <li>5 keyword analyses / day</li>
              <li>3 AI blog structures / day</li>
              <li>Search trend charts</li>
            </ul>
            <Link
              href="/tools/keyword"
              style={{
                display: "block", textAlign: "center", padding: "12px", background: "#111",
                border: "1px solid #333", borderRadius: 8, color: "#ccc", fontSize: 14,
                fontWeight: 600, textDecoration: "none",
              }}
            >
              Start Free →
            </Link>
          </div>

          {/* Pro */}
          <div style={{ background: "#0a0a0a", border: "2px solid #22c55e33", borderRadius: 16, padding: 28, position: "relative" }}>
            <div style={{
              position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
              background: "#22c55e", color: "#000", padding: "4px 16px", borderRadius: 20,
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
            }}>
              POPULAR
            </div>
            <p style={{ color: "#22c55e", fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>PRO</p>
            <p style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
              $9.99<span style={{ fontSize: 16, color: "#666", fontWeight: 400 }}>/mo</span>
            </p>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>or ₩9,900/mo</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", color: "#ccc", fontSize: 13, lineHeight: 1.8 }}>
              <li>Unlimited keyword analyses</li>
              <li>Unlimited AI blog structures</li>
              <li>Keyword history</li>
              <li>CSV export</li>
              <li>Priority support</li>
            </ul>
            <Suspense fallback={<div style={{ height: 44 }} />}>
              <PricingClient locale="en" plan="pro" />
            </Suspense>
          </div>

          {/* Business */}
          <div style={{ background: "#0a0a0a", border: "2px solid #a855f733", borderRadius: 16, padding: 28 }}>
            <p style={{ color: "#a855f7", fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>BUSINESS</p>
            <p style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
              $29.99<span style={{ fontSize: 16, color: "#666", fontWeight: 400 }}>/mo</span>
            </p>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>or ₩29,900/mo</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", color: "#ccc", fontSize: 13, lineHeight: 1.8 }}>
              <li>Everything in Pro</li>
              <li>API access</li>
              <li>CSV export</li>
              <li>Custom keyword alerts</li>
              <li>Dedicated support</li>
            </ul>
            <Suspense fallback={<div style={{ height: 44 }} />}>
              <PricingClient locale="en" plan="business" />
            </Suspense>
          </div>
        </div>

        {/* Feature Comparison */}
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>Feature Comparison</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #222" }}>
                <th style={{ padding: "12px 0", textAlign: "left", color: "#888", fontSize: 13 }}>Feature</th>
                <th style={{ padding: "12px 0", textAlign: "center", color: "#888", fontSize: 13 }}>Free</th>
                <th style={{ padding: "12px 0", textAlign: "center", color: "#22c55e", fontSize: 13, fontWeight: 700 }}>Pro</th>
                <th style={{ padding: "12px 0", textAlign: "center", color: "#a855f7", fontSize: 13, fontWeight: 700 }}>Business</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} style={{ borderBottom: "1px solid #111" }}>
                  <td style={{ padding: "14px 0", fontSize: 14 }}>{f.name}</td>
                  <td style={{ padding: "14px 0", textAlign: "center", color: "#888", fontSize: 14 }}>{f.free}</td>
                  <td style={{ padding: "14px 0", textAlign: "center", color: "#22c55e", fontSize: 14, fontWeight: 600 }}>{f.pro}</td>
                  <td style={{ padding: "14px 0", textAlign: "center", color: "#a855f7", fontSize: 14, fontWeight: 600 }}>{f.business}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
