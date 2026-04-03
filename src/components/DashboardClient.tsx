"use client"

import { useAuth } from "@/components/AuthProvider"
import { useEffect, useState } from "react"
import Link from "next/link"

interface DashboardData {
  user: { email: string; tier: string; referral_bonus: number }
  usage: {
    keyword_count: number
    structure_count: number
    keyword_limit: number | null
    structure_limit: number | null
  }
  subscription: {
    status: string
    current_period_end: string | null
  } | null
  referrals: { count: number; bonus: number }
}

const tierBadgeStyles: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "#333", color: "#999", label: "Free" },
  pro: { bg: "#1a2a3a", color: "#60a5fa", label: "Pro" },
  business: { bg: "#1a3a2a", color: "#4ade80", label: "Business" },
}

const tools = [
  { name: "Keyword Analysis", href: "/tools/keyword", icon: "K", desc: "Analyze keyword volume and competition" },
  { name: "News Signals", href: "/tools/news", icon: "N", desc: "Track trending news topics" },
  { name: "Market Signals", href: "/tools/signals", icon: "S", desc: "Monitor market signal data" },
  { name: "Stock Screener", href: "/tools/screener", icon: "R", desc: "Screen stocks with AI filters" },
]

function getBarColor(pct: number): string {
  if (pct < 50) return "#22c55e"
  if (pct < 80) return "#eab308"
  return "#ef4444"
}

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const isUnlimited = limit === null
  const pct = isUnlimited ? 0 : limit === 0 ? 100 : Math.min((used / limit) * 100, 100)

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#ccc", fontSize: 14 }}>{label}</span>
        <span style={{ color: "#888", fontSize: 13 }}>
          {isUnlimited ? `${used} / Unlimited` : `${used} / ${limit}`}
        </span>
      </div>
      <div style={{ background: "#1a1a1a", borderRadius: 6, height: 8, overflow: "hidden" }}>
        <div
          style={{
            width: isUnlimited ? "0%" : `${pct}%`,
            height: "100%",
            background: isUnlimited ? "#22c55e" : getBarColor(pct),
            borderRadius: 6,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  )
}

export default function DashboardClient() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      window.location.href = "/login"
      return
    }

    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        return res.json()
      })
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #333",
              borderTop: "3px solid #fff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#888", fontSize: 14 }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      </div>
    )
  }

  if (!data) return null

  const badge = tierBadgeStyles[data.user.tier] ?? tierBadgeStyles.free
  const isFree = data.user.tier === "free"

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Link href="/" style={{ color: "#666", fontSize: 14, textDecoration: "none" }}>
            &larr; WealthPipe
          </Link>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Dashboard</h1>

        {/* Top row: User Info + Subscription */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* User Info Card */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#888", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>
              Account
            </h2>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, wordBreak: "break-all" }}>
              {data.user.email}
            </p>
            <span
              style={{
                display: "inline-block",
                background: badge.bg,
                color: badge.color,
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {badge.label}
            </span>
            {data.referrals.count > 0 && (
              <p style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
                Referrals: {data.referrals.count} (+{data.referrals.bonus} bonus analyses)
              </p>
            )}
          </div>

          {/* Subscription Card */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#888", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>
              Subscription
            </h2>
            {data.subscription ? (
              <>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  {data.user.tier.charAt(0).toUpperCase() + data.user.tier.slice(1)} Plan
                </p>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>
                  Status: <span style={{ color: data.subscription.status === "active" ? "#22c55e" : "#eab308" }}>{data.subscription.status}</span>
                </p>
                {data.subscription.current_period_end && (
                  <p style={{ color: "#888", fontSize: 13 }}>
                    Next billing: {new Date(data.subscription.current_period_end).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                <Link
                  href="/api/stripe/portal"
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    padding: "8px 16px",
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: 8,
                    color: "#ccc",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Manage Subscription
                </Link>
              </>
            ) : (
              <>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Free Plan</p>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
                  Limited daily usage. Upgrade for unlimited access.
                </p>
                <Link
                  href="/pricing"
                  style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Upgrade Now
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#888", marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>
            Today&apos;s Usage
          </h2>
          <UsageBar
            used={data.usage.keyword_count}
            limit={data.usage.keyword_limit}
            label="Keyword Analyses"
          />
          <UsageBar
            used={data.usage.structure_count}
            limit={data.usage.structure_limit}
            label="Structure Generations"
          />
        </div>

        {/* Upgrade CTA for free users */}
        {isFree && (
          <div
            style={{
              background: "linear-gradient(135deg, #0a1a0a, #0a0a1a)",
              border: "1px solid #22c55e33",
              borderRadius: 12,
              padding: 24,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Unlock unlimited analyses
            </p>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
              Upgrade to Pro for unlimited keyword analyses, AI blog structures, CSV export, and more.
            </p>
            <Link
              href="/pricing"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View Plans &rarr;
            </Link>
          </div>
        )}

        {/* Quick Links to Tools */}
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#888", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>
          Tools
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              style={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: 12,
                padding: 20,
                textDecoration: "none",
                color: "#fff",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#444"
                e.currentTarget.style.background = "#161616"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#222"
                e.currentTarget.style.background = "#111"
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "#1a1a1a",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#888",
                  marginBottom: 12,
                }}
              >
                {tool.icon}
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{tool.name}</p>
              <p style={{ color: "#666", fontSize: 12, lineHeight: 1.5 }}>{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
