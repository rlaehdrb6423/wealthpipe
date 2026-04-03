"use client"

import { useState, useEffect } from "react"
import { type Locale, getTexts } from "@/lib/i18n"
import { initKakao, shareNews } from "@/lib/kakao-share"
import AdSlot from "@/components/AdSlot"

interface Article {
  title: string
  summary: string
  source: string
  category: string
  url: string
}

interface DigestData {
  articles: Article[]
  aiInsight: string
  articlesEn?: Article[]
  aiInsightEn?: string
}

interface Digest {
  date: string
  data: DigestData
  created_at: string
}

interface NewsDigestProps {
  locale: Locale
}

const CATEGORY_COLORS: Record<string, string> = {
  stock: "#3b82f6",
  realestate: "#22c55e",
  exchange: "#f59e0b",
  rate: "#a855f7",
  crypto: "#f97316",
}

export default function NewsDigest({ locale }: NewsDigestProps) {
  const t = getTexts(locale).news
  const [digests, setDigests] = useState<Digest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [assetPrices, setAssetPrices] = useState<Record<string, { name: string; price: number; change: number; changePercent: number }>>({})


  useEffect(() => { initKakao() }, [])

  useEffect(() => {
    async function fetchDigests() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/news?days=7")
        if (!res.ok) throw new Error("fetch failed")
        const json = await res.json()
        setDigests(json.digests || [])
        if (json.assetPrices) setAssetPrices(json.assetPrices)
      } catch {
        setError(t.errorText)
      } finally {
        setLoading(false)
      }
    }
    fetchDigests()
  }, [t.errorText])

  function toggleDate(date: string) {
    setExpandedDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
      } else {
        next.add(date)
      }
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

  function getCategoryLabel(key: string): string {
    const cats = t.categories as Record<string, string>
    return cats[key] ?? key
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "2px solid #222", borderTop: "2px solid #fff", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 14 }}>{t.loadingText}</p>
        </div>
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

  const today = digests[0]
  const archive = digests.slice(1)

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

      {/* Today's digest */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
          {t.todayLabel}
        </h2>

        {!today ? (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: 14 }}>{t.noDataText}</p>
          </div>
        ) : (
          <DigestView digest={today} t={t} getCategoryLabel={getCategoryLabel} formatDate={formatDate} locale={locale} assetPrices={assetPrices} />
        )}
      </section>

      {/* Kakao Share */}
      <div style={{ marginBottom: 24, display: "flex", gap: 8 }}>
        <button
          onClick={() => shareNews()}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#FEE500", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <span style={{ fontSize: 16 }}>&#x1F4E2;</span> {locale === "ko" ? "카카오톡 공유" : "Share on KakaoTalk"}
        </button>
      </div>

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
            {archive.map((digest) => (
              <div key={digest.date} style={{ background: "#111", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
                <button
                  onClick={() => toggleDate(digest.date)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 600 }}
                >
                  <span>{formatDate(digest.date)}</span>
                  <span style={{ color: "#666", fontSize: 12, transform: expandedDates.has(digest.date) ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                </button>
                {expandedDates.has(digest.date) && (
                  <div style={{ padding: "0 20px 20px" }}>
                    <DigestView digest={digest} t={t} getCategoryLabel={getCategoryLabel} formatDate={formatDate} locale={locale} assetPrices={assetPrices} compact />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ad slot */}
      <AdSlot slot="5678901234" format="auto" responsive />
    </div>
  )
}

interface DigestViewProps {
  digest: Digest
  t: ReturnType<typeof getTexts>["news"]
  getCategoryLabel: (key: string) => string
  formatDate: (d: string) => string
  locale: string
  assetPrices?: Record<string, { name: string; price: number; change: number; changePercent: number }>
  compact?: boolean
}

function DigestView({ digest, t, getCategoryLabel, locale, assetPrices = {}, compact = false }: DigestViewProps) {
  const displayArticles = locale === "en" && digest.data.articlesEn?.length
    ? digest.data.articlesEn
    : digest.data.articles
  const displayInsight = locale === "en" && digest.data.aiInsightEn
    ? digest.data.aiInsightEn
    : digest.data.aiInsight

  return (
    <div>
      {/* Article cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {displayArticles.map((article, i) => {
          const color = CATEGORY_COLORS[article.category] ?? "#888"
          return (
            <div
              key={i}
              style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: compact ? "16px" : "20px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: color + "22",
                    color,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {getCategoryLabel(article.category)}
                </span>
                {assetPrices[article.category] && (() => {
                  const ap = assetPrices[article.category]
                  const apUp = ap.changePercent >= 0
                  return (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: apUp ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: apUp ? "#22c55e" : "#ef4444",
                    }}>
                      {ap.name} {ap.price.toLocaleString()} {apUp ? "+" : ""}{ap.changePercent.toFixed(2)}%
                    </span>
                  )
                })()}
                <span style={{ fontSize: 11, color: "#555" }}>{article.source}</span>
              </div>
              <h3 style={{ fontSize: compact ? 14 : 16, fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.4 }}>
                {article.title}
              </h3>
              <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, marginBottom: 12 }}>{article.summary}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#666", textDecoration: "none", borderBottom: "1px solid #333", paddingBottom: 1 }}
              >
                {t.readMore}
              </a>
            </div>
          )
        })}
      </div>

      {/* AI Insight */}
      {displayInsight && (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: compact ? "16px" : "20px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            {t.aiInsightLabel}
          </p>
          <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.8 }}>{displayInsight}</p>
        </div>
      )}
    </div>
  )
}
