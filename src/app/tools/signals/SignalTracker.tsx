"use client"

import { useState, useEffect } from "react"
import { type Locale, getTexts } from "@/lib/i18n"
import AdSlot from "@/components/AdSlot"

interface AssetSignal {
  name: string
  ticker: string
  price: number
  change: number
  changePercent: number
  signal: "bullish" | "bearish" | "neutral"
  signalReason: string
  news: string
}

interface SignalDay {
  date: string
  data: {
    assets: AssetSignal[]
    aiInsight: string
    updatedAt: string
  }
  created_at: string
}

interface SignalTrackerProps {
  locale: Locale
}

function formatPrice(price: number, ticker: string): string {
  if (ticker === "KRW=X" || ticker === "^KS11") {
    return price.toLocaleString("ko-KR", { maximumFractionDigits: 2 })
  }
  if (ticker === "BTC-USD") {
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 })
  }
  return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 2 })
}

const SIGNAL_COLORS = {
  bullish: "#22c55e",
  bearish: "#ef4444",
  neutral: "#eab308",
}

export default function SignalTracker({ locale }: SignalTrackerProps) {
  const t = getTexts(locale).signals
  const [days, setDays] = useState<SignalDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchSignals() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/signals?days=7")
        if (!res.ok) throw new Error("fetch failed")
        const json = await res.json()
        setDays(json.signals || [])
      } catch {
        setError(t.errorText)
      } finally {
        setLoading(false)
      }
    }
    fetchSignals()
  }, [t.errorText])

  function toggleDate(date: string) {
    setExpandedDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function getSignalLabel(signal: string): string {
    const labels = t.signalLabels as Record<string, string>
    return labels[signal] ?? signal
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "2px solid #222", borderTop: "2px solid #fff", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 14 }}>{t.loadingText}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      </div>
    )
  }

  const today = days[0]
  const archive = days.slice(1)

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Back link */}
      <a
        href={locale === "ko" ? "/ko" : "/"}
        style={{ display: "inline-block", color: "#666", fontSize: 13, marginBottom: 32, textDecoration: "none" }}
      >
        {t.backLink}
      </a>

      {/* Heading */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
          {t.heading}
        </h1>
        <p style={{ fontSize: 15, color: "#888", lineHeight: 1.6 }}>{t.subheading}</p>
      </div>

      {/* Today's signals */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
          {t.todayLabel}
        </h2>

        {!today ? (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: 14 }}>{t.noDataText}</p>
          </div>
        ) : (
          <SignalDayView day={today} t={t} locale={locale} getSignalLabel={getSignalLabel} />
        )}
      </section>

      {/* Newsletter CTA */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 28, marginBottom: 48, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 13, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.nlCtaDesc}</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{t.nlCtaTitle}</p>
        <a
          href={locale === "ko" ? "/ko#newsletter" : "/#newsletter"}
          style={{ display: "inline-block", padding: "10px 24px", background: "#fff", color: "#000", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", alignSelf: "flex-start", marginTop: 4 }}
        >
          {t.nlCtaBtn} →
        </a>
      </div>

      {/* Archive */}
      {archive.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
            {t.archiveLabel}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {archive.map((day) => (
              <div key={day.date} style={{ background: "#111", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
                <button
                  onClick={() => toggleDate(day.date)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 600 }}
                >
                  <span>{formatDate(day.date)}</span>
                  <span style={{ color: "#666", fontSize: 12, transform: expandedDates.has(day.date) ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                </button>
                {expandedDates.has(day.date) && (
                  <div style={{ padding: "0 20px 20px" }}>
                    <SignalDayView day={day} t={t} locale={locale} getSignalLabel={getSignalLabel} compact />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ad slot */}
      <AdSlot slot="6789012345" format="auto" responsive />
    </div>
  )
}

interface SignalDayViewProps {
  day: SignalDay
  t: ReturnType<typeof getTexts>["signals"]
  locale: Locale
  getSignalLabel: (signal: string) => string
  compact?: boolean
}

function SignalDayView({ day, t, getSignalLabel, compact = false }: SignalDayViewProps) {
  const { assets, aiInsight } = day.data

  return (
    <div>
      {/* Asset grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {assets.map((asset) => {
          const isUp = asset.changePercent >= 0
          const changeColor = isUp ? "#22c55e" : "#ef4444"
          const signalColor = SIGNAL_COLORS[asset.signal] || "#eab308"

          return (
            <div
              key={asset.ticker}
              style={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: 12,
                padding: compact ? "14px" : "18px",
              }}
            >
              {/* Header: name + signal badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{asset.name}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: signalColor + "22",
                    color: signalColor,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {getSignalLabel(asset.signal)}
                </span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: compact ? 20 : 24, fontWeight: 800, color: "#fff" }}>
                  {formatPrice(asset.price, asset.ticker)}
                </span>
              </div>

              {/* Change */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: asset.signalReason ? 10 : 0 }}>
                <span style={{ fontSize: 13, color: changeColor, fontWeight: 600 }}>
                  {isUp ? "+" : ""}{asset.change.toFixed(2)}
                </span>
                <span style={{ fontSize: 12, color: changeColor }}>
                  ({isUp ? "+" : ""}{asset.changePercent.toFixed(2)}%)
                </span>
              </div>

              {/* Signal reason */}
              {asset.signalReason && (
                <p style={{ fontSize: 11, color: "#888", lineHeight: 1.5, marginTop: 8, borderTop: "1px solid #1a1a1a", paddingTop: 8 }}>
                  {asset.signalReason}
                </p>
              )}

              {/* News */}
              {asset.news && (
                <p style={{ fontSize: 11, color: "#666", lineHeight: 1.4, marginTop: 6 }}>
                  {asset.news}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* AI Insight */}
      {aiInsight && (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: compact ? "16px" : "20px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            {t.aiInsightLabel}
          </p>
          <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.8 }}>{aiInsight}</p>
        </div>
      )}
    </div>
  )
}
