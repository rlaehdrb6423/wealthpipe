"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

interface PricingClientProps {
  locale?: "en" | "ko"
  plan?: "pro" | "business"
  showBanners?: boolean
}

export default function PricingClient({ locale = "en", plan, showBanners = false }: PricingClientProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tier, setTier] = useState<string>("free")
  const [subLoading, setSubLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bannerVisible, setBannerVisible] = useState(true)

  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  const t = useCallback(
    (ko: string, en: string) => (locale === "ko" ? ko : en),
    [locale]
  )

  useEffect(() => {
    if (!user) {
      setTier("free")
      return
    }
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => {
        if (d.tier) setTier(d.tier)
      })
      .catch(() => {})
  }, [user])

  // Auto-dismiss banners after 8 seconds
  useEffect(() => {
    if (success || canceled) {
      setBannerVisible(true)
      const timer = setTimeout(() => setBannerVisible(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [success, canceled])

  const handleCheckout = async (targetPlan: "pro" | "business") => {
    if (!user) {
      router.push(locale === "ko" ? "/ko/login" : "/login")
      return
    }
    setActionLoading(targetPlan)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetPlan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        console.error("Checkout error:", data.error)
      }
    } catch (err) {
      console.error("Checkout request failed:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePortal = async () => {
    setSubLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        console.error("Portal error:", data.error)
      }
    } catch (err) {
      console.error("Portal request failed:", err)
    } finally {
      setSubLoading(false)
    }
  }

  const renderButton = (targetPlan: "pro" | "business") => {
    const isGreen = targetPlan === "pro"
    const color = isGreen ? "#22c55e" : "#a855f7"
    const textColor = isGreen ? "#000" : "#fff"

    if (loading) return <div style={{ height: 44 }} />

    // User is on this plan -- show current plan badge + manage button
    if (tier === targetPlan) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{
            textAlign: "center", padding: "6px 12px",
            background: `${color}20`, border: `1px solid ${color}50`,
            borderRadius: 8, color, fontSize: 12, fontWeight: 700,
          }}>
            {t("현재 플랜", "Current Plan")}
          </div>
          <button
            onClick={handlePortal}
            disabled={subLoading}
            style={{
              display: "block", width: "100%", textAlign: "center", padding: "12px",
              background: color, border: "none", borderRadius: 8, color: textColor,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              opacity: subLoading ? 0.6 : 1,
            }}
          >
            {subLoading ? t("처리 중...", "Loading...") : t("관리", "Manage")}
          </button>
        </div>
      )
    }

    // On business plan viewing pro card -- disabled
    if (targetPlan === "pro" && tier === "business") {
      return (
        <button
          disabled
          style={{
            display: "block", width: "100%", textAlign: "center", padding: "12px",
            background: "#111", border: "1px solid #333", borderRadius: 8, color: "#555",
            fontSize: 14, fontWeight: 700, cursor: "not-allowed",
          }}
        >
          {t("현재 Business 플랜", "On Business Plan")}
        </button>
      )
    }

    // Not logged in -- show sign-in prompt
    if (!user) {
      return (
        <button
          onClick={() => router.push(locale === "ko" ? "/ko/login" : "/login")}
          style={{
            display: "block", width: "100%", textAlign: "center", padding: "12px",
            background: color, border: "none", borderRadius: 8, color: textColor,
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          {t("로그인 후 구독", "Sign in to Subscribe")}
        </button>
      )
    }

    // Logged in on free (or lower tier) -- show upgrade button
    return (
      <button
        onClick={() => handleCheckout(targetPlan)}
        disabled={actionLoading === targetPlan}
        style={{
          display: "block", width: "100%", textAlign: "center", padding: "12px",
          background: color, border: "none", borderRadius: 8, color: textColor,
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          opacity: actionLoading === targetPlan ? 0.6 : 1,
        }}
      >
        {actionLoading === targetPlan
          ? t("처리 중...", "Loading...")
          : targetPlan === "pro"
            ? t("Pro로 업그레이드 →", "Upgrade to Pro →")
            : t("Business로 업그레이드 →", "Upgrade to Business →")}
      </button>
    )
  }

  // Render tier indicator when user is logged in
  const renderTierIndicator = () => {
    if (loading || !user) return null

    const tierLabel = tier === "business" ? "Business" : tier === "pro" ? "Pro" : "Free"
    const tierColor = tier === "business" ? "#a855f7" : tier === "pro" ? "#22c55e" : "#888"

    return (
      <div style={{
        textAlign: "center", marginBottom: 16,
        display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
      }}>
        <span style={{ color: "#888", fontSize: 13 }}>
          {t("현재 플랜:", "Current plan:")}
        </span>
        <span style={{
          color: tierColor, fontSize: 13, fontWeight: 700,
          padding: "2px 10px", border: `1px solid ${tierColor}40`,
          borderRadius: 12, background: `${tierColor}10`,
        }}>
          {tierLabel}
        </span>
      </div>
    )
  }

  return (
    <>
      {showBanners && bannerVisible && success && (
        <div style={{
          marginBottom: 24, padding: "14px 20px",
          background: "#22c55e15", border: "1px solid #22c55e33",
          borderRadius: 10, textAlign: "center",
          position: "relative",
        }}>
          <p style={{ color: "#22c55e", fontSize: 14, fontWeight: 600 }}>
            {t("구독이 완료되었습니다! 이제 무제한으로 사용하세요.", "Subscription activated! Enjoy unlimited access.")}
          </p>
          <button
            onClick={() => setBannerVisible(false)}
            style={{
              position: "absolute", top: 8, right: 12,
              background: "none", border: "none", color: "#22c55e80",
              cursor: "pointer", fontSize: 16, lineHeight: 1,
            }}
            aria-label="Close"
          >
            x
          </button>
        </div>
      )}
      {showBanners && bannerVisible && canceled && (
        <div style={{
          marginBottom: 24, padding: "14px 20px",
          background: "#ef444415", border: "1px solid #ef444433",
          borderRadius: 10, textAlign: "center",
          position: "relative",
        }}>
          <p style={{ color: "#ef4444", fontSize: 14, fontWeight: 600 }}>
            {t("결제가 취소되었습니다. 다시 시도하실 수 있습니다.", "Payment was canceled. You can try again anytime.")}
          </p>
          <button
            onClick={() => setBannerVisible(false)}
            style={{
              position: "absolute", top: 8, right: 12,
              background: "none", border: "none", color: "#ef444480",
              cursor: "pointer", fontSize: 16, lineHeight: 1,
            }}
            aria-label="Close"
          >
            x
          </button>
        </div>
      )}
      {showBanners && renderTierIndicator()}
      {plan && renderButton(plan)}
    </>
  )
}
