"use client"

import { useEffect, useState } from "react"

interface Stock {
  code: string
  name: string
  market: string
  price: number | null
  market_cap: number | null
  per: number | null
  pbr: number | null
  roe: number | null
  dividend_yield: number | null
  ai_score: number
}

interface StockDetailModalProps {
  stock: Stock | null
  onClose: () => void
  locale: "ko" | "en"
}

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: "#1a3a2a", text: "#4ade80" },
  A: { bg: "#1a2a3a", text: "#60a5fa" },
  B: { bg: "#2a2a1a", text: "#facc15" },
  C: { bg: "#2a1f1a", text: "#fb923c" },
  D: { bg: "#2a1a1a", text: "#f87171" },
}

function getGrade(score: number): string {
  if (score >= 80) return "S"
  if (score >= 65) return "A"
  if (score >= 50) return "B"
  if (score >= 35) return "C"
  return "D"
}

function formatMarketCap(v: number | null, locale: string): string {
  if (v === null || v === undefined) return "—"
  if (locale === "ko") {
    if (v >= 10000) return `${(v / 10000).toFixed(1)}조`
    return `${v.toLocaleString()}억`
  }
  if (v >= 10000) return `₩${(v / 10000).toFixed(1)}T`
  return `₩${v.toLocaleString()}B`
}

function fmt(v: number | null, digits = 2): string {
  if (v === null || v === undefined) return "—"
  return v.toFixed(digits)
}

export default function StockDetailModal({ stock, onClose, locale }: StockDetailModalProps) {
  useEffect(() => {
    if (!stock) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [stock, onClose])

  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [watchLoading, setWatchLoading] = useState(false)

  useEffect(() => {
    if (!stock) return
    fetch("/api/watchlist").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.watchlist) {
        setIsWatchlisted(d.watchlist.some((w: { stock_code: string }) => w.stock_code === stock.code))
      }
    }).catch(() => {})
  }, [stock])

  const toggleWatchlist = async () => {
    if (!stock || watchLoading) return
    setWatchLoading(true)
    try {
      if (isWatchlisted) {
        await fetch("/api/watchlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockCode: stock.code }),
        })
        setIsWatchlisted(false)
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockCode: stock.code }),
        })
        if (res.ok || res.status === 409) setIsWatchlisted(true)
      }
    } catch { /* ignore */ }
    finally { setWatchLoading(false) }
  }

  if (!stock) return null

  const grade = getGrade(stock.ai_score)
  const gc = GRADE_COLORS[grade]
  const naverUrl = `https://finance.naver.com/item/main.naver?code=${stock.code}`
  const yahooSuffix = stock.market === "KOSPI" ? ".KS" : ".KQ"
  const yahooUrl = `https://finance.yahoo.com/quote/${stock.code}${yahooSuffix}/`

  const metrics = [
    { label: "PER", value: fmt(stock.per) },
    { label: "PBR", value: fmt(stock.pbr) },
    { label: "ROE", value: stock.roe != null ? `${fmt(stock.roe)}%` : "—" },
    { label: locale === "ko" ? "배당률" : "Div. Yield", value: stock.dividend_yield != null ? `${fmt(stock.dividend_yield)}%` : "—" },
    { label: locale === "ko" ? "시가총액" : "Market Cap", value: formatMarketCap(stock.market_cap, locale) },
    { label: locale === "ko" ? "현재가" : "Price", value: stock.price ? `₩${stock.price.toLocaleString()}` : "—" },
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0a0a0a", border: "1px solid #222", borderRadius: 16,
          maxWidth: 480, width: "100%", padding: 28, position: "relative",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", color: "#666",
            fontSize: 20, cursor: "pointer", padding: 4,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{stock.name}</h2>
            <span style={{
              fontSize: 10, padding: "2px 6px", borderRadius: 4,
              background: stock.market === "KOSPI" ? "#1a2a3a" : "#2a1a3a",
              color: stock.market === "KOSPI" ? "#60a5fa" : "#c084fc",
              fontWeight: 600,
            }}>
              {stock.market}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{stock.code}</p>
        </div>

        {/* AI Score */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          background: gc.bg, borderRadius: 12, padding: 16, marginBottom: 20,
        }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: gc.text }}>{grade}</span>
          <div>
            <p style={{ fontSize: 28, fontWeight: 700, color: gc.text, margin: 0 }}>{stock.ai_score}</p>
            <p style={{ fontSize: 11, color: "#888", margin: 0 }}>AI Score</p>
          </div>
        </div>

        {/* Watchlist button */}
        <button
          onClick={toggleWatchlist}
          disabled={watchLoading}
          style={{
            width: "100%", padding: "10px 16px", marginBottom: 16,
            background: isWatchlisted ? "#1a2a1a" : "#111",
            border: `1px solid ${isWatchlisted ? "#22c55e44" : "#333"}`,
            borderRadius: 8, color: isWatchlisted ? "#22c55e" : "#888",
            fontSize: 13, fontWeight: 600, cursor: watchLoading ? "not-allowed" : "pointer",
          }}
        >
          {isWatchlisted
            ? (locale === "ko" ? "★ 관심 종목에서 제거" : "★ Remove from Watchlist")
            : (locale === "ko" ? "☆ 관심 종목 추가" : "☆ Add to Watchlist")}
        </button>

        {/* Metrics grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ background: "#111", borderRadius: 8, padding: 12 }}>
              <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{m.label}</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* External links */}
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={naverUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: "12px 16px", background: "#111", border: "1px solid #333",
              borderRadius: 8, color: "#ccc", fontSize: 13, fontWeight: 600,
              textDecoration: "none", textAlign: "center",
            }}
          >
            {locale === "ko" ? "네이버 금융" : "Naver Finance"} →
          </a>
          <a
            href={yahooUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: "12px 16px", background: "#111", border: "1px solid #333",
              borderRadius: 8, color: "#ccc", fontSize: 13, fontWeight: 600,
              textDecoration: "none", textAlign: "center",
            }}
          >
            Yahoo Finance →
          </a>
        </div>
      </div>
    </div>
  )
}
