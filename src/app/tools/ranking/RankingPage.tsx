"use client"

import { useState, useEffect } from "react"
import { type Locale, getTexts } from "@/lib/i18n"
import AdSlot from "@/components/AdSlot"
import { initKakao, shareRanking } from "@/lib/kakao-share"

interface RankingItem {
  rank: number
  keyword: string
  volume: number
  competitionGrade: string
  opportunityScore: number
  shareCount: number
}

interface RankingPageProps {
  locale: Locale
}

const GRADE_COLORS: Record<string, string> = {
  상: "#ef4444",
  중: "#f59e0b",
  하: "#22c55e",
  HIGH: "#ef4444",
  MED: "#f59e0b",
  LOW: "#22c55e",
}

const RANK_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
}

export default function RankingPage({ locale }: RankingPageProps) {
  const t = getTexts(locale).ranking
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    initKakao()
    fetchRankings()
  }, [])

  async function fetchRankings() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ranking")
      if (!res.ok) throw new Error("fetch failed")
      const json = await res.json()
      setRankings(json.rankings ?? [])
    } catch {
      setError(t.errorText)
    } finally {
      setLoading(false)
    }
  }

  function getKeywordHref(keyword: string) {
    const base = locale === "ko" ? "/ko/tools/keyword" : "/tools/keyword"
    return `${base}/${encodeURIComponent(keyword)}`
  }

  function handleCopyLink() {
    const url =
      locale === "ko"
        ? "https://wealthpipe.net/ko/tools/ranking"
        : "https://wealthpipe.net/tools/ranking"
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleKakaoShare() {
    shareRanking()
  }

  function formatVolume(v: number) {
    if (v >= 10000) return `${Math.round(v / 1000)}k`
    return v.toLocaleString()
  }

  const gradeColor = (grade: string) =>
    GRADE_COLORS[grade] ?? "#888"

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "2px solid #222",
              borderTop: "2px solid #fff",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 14 }}>{t.loadingText}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Back link */}
      <a
        href={locale === "ko" ? "/ko" : "/"}
        style={{
          display: "inline-block",
          color: "#666",
          fontSize: 13,
          marginBottom: 32,
          textDecoration: "none",
        }}
      >
        {t.backLink}
      </a>

      {/* Heading */}
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 800,
            color: "#fff",
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          {t.heading}
        </h1>
        <p style={{ fontSize: 15, color: "#888", lineHeight: 1.6 }}>{t.subheading}</p>
      </div>

      {/* Share buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        <button
          onClick={handleCopyLink}
          style={{
            padding: "8px 16px",
            background: "#111",
            border: "1px solid #222",
            borderRadius: 8,
            color: "#fff",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {copied ? t.referralCopied : t.shareThisPage}
        </button>
        <button
          onClick={handleKakaoShare}
          style={{
            padding: "8px 16px",
            background: "#FEE500",
            border: "none",
            borderRadius: 8,
            color: "#000",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {t.kakaoShare}
        </button>
      </div>

      {/* Rankings table */}
      {rankings.length === 0 ? (
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
          }}
        >
          <p style={{ color: "#666", fontSize: 14 }}>{t.noDataText}</p>
        </div>
      ) : (
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 48,
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 100px 80px 80px 60px",
              padding: "12px 16px",
              borderBottom: "1px solid #222",
              gap: 8,
            }}
          >
            {[
              t.rankLabel,
              t.keywordLabel,
              t.volumeLabel,
              t.competitionLabel,
              t.scoreLabel,
              t.sharesLabel,
            ].map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#555",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Rows */}
          {rankings.map((item) => {
            const rankColor = RANK_COLORS[item.rank]
            const isTop3 = item.rank <= 3
            return (
              <div
                key={item.keyword}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 100px 80px 80px 60px",
                  padding: "14px 16px",
                  borderBottom: "1px solid #1a1a1a",
                  gap: 8,
                  alignItems: "center",
                  background: isTop3 ? "#0f0f0f" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontSize: isTop3 ? 18 : 14,
                    fontWeight: 800,
                    color: rankColor ?? "#555",
                  }}
                >
                  {item.rank}
                </span>

                {/* Keyword */}
                <a
                  href={getKeywordHref(item.keyword)}
                  style={{
                    fontSize: 14,
                    fontWeight: isTop3 ? 700 : 500,
                    color: isTop3 ? "#fff" : "#ccc",
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.keyword}
                </a>

                {/* Volume */}
                <span style={{ fontSize: 13, color: "#888" }}>
                  {formatVolume(item.volume)}
                </span>

                {/* Competition grade badge */}
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: gradeColor(item.competitionGrade) + "22",
                    color: gradeColor(item.competitionGrade),
                    letterSpacing: "0.05em",
                    width: "fit-content",
                  }}
                >
                  {item.competitionGrade}
                </span>

                {/* Opportunity score */}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      item.opportunityScore >= 70
                        ? "#22c55e"
                        : item.opportunityScore >= 40
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                >
                  {item.opportunityScore}
                </span>

                {/* Share count */}
                <span style={{ fontSize: 13, color: "#666" }}>{item.shareCount}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Newsletter CTA */}
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 12,
          padding: 28,
          marginBottom: 48,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
          }}
        >
          {t.nlCtaTitle}
        </p>
        <a
          href={locale === "ko" ? "/ko#newsletter" : "/#newsletter"}
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "#fff",
            color: "#000",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            alignSelf: "flex-start",
            marginTop: 4,
          }}
        >
          {t.nlCtaBtn} →
        </a>
      </div>

      {/* Ad slot */}
      <AdSlot slot="5678901234" format="auto" responsive />
    </div>
  )
}
