"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { type Locale, getTexts } from "@/lib/i18n"

interface KeywordResult {
  keyword: string
  pcVolume: number
  mobileVolume: number
  totalVolume: number
  blogDocCount: number
  newsCount: number
  cafeCount: number
  webDocCount: number
  totalCompetition: number
  competitionGrade: string
  competitionLabel: string
  profitGrade: string
  profitLabel: string
  ratio: number
  relatedKeywords: string[]
  successRate: number
  compIdx: string
  avgClickCnt: number
  avgCtr: number
  pcCpc: number
  mobileCpc: number
  avgCpc: number
  estimatedRevenue: number
  titlePattern?: {
    avgLength: number
    topWords: string[]
    titleTypes: { type: string; count: number }[]
    titles: string[]
  }
  remaining: number
}

function gradeColor(grade: string) {
  if (grade === "A") return "#22c55e"
  if (grade === "B") return "#3b82f6"
  if (grade === "C") return "#eab308"
  if (grade === "D") return "#f97316"
  return "#ef4444"
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR")
}

interface KeywordAnalyzerProps {
  locale?: Locale
}

export default function KeywordAnalyzer({ locale = "en" }: KeywordAnalyzerProps) {
  const t = getTexts(locale).keyword
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<KeywordResult | null>(null)
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shareRate, setShareRate] = useState(5)

  useEffect(() => {
    if (initialized) return
    const q = searchParams.get("q")
    if (q) {
      setKeyword(q)
      setInitialized(true)
      analyze(q)
    } else {
      setInitialized(true)
    }
  }, [searchParams, initialized])

  const analyze = async (overrideKeyword?: string) => {
    const q = (overrideKeyword ?? keyword).trim()
    if (!q) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const adminKey = searchParams.get("admin") || ""
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (adminKey) headers["x-admin-key"] = adminKey
      const res = await fetch("/api/keyword", {
        method: "POST",
        headers,
        body: JSON.stringify({ keyword: q }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = result
    ? `https://wealthpipe.net/tools/keyword?q=${encodeURIComponent(result.keyword)}`
    : ""

  const claimReward = async (platform: string) => {
    if (!result) return
    try {
      const res = await fetch("/api/share/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: result.keyword, platform }),
      })
      const data = await res.json()
      if (res.ok) {
        setToast(data.message)
        if (data.rewarded && result) {
          setResult({ ...result, remaining: result.remaining + data.bonusAdded })
        }
        setTimeout(() => setToast(null), 3000)
      }
    } catch { /* 보상 실패는 무시 */ }
  }

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const input = document.createElement("input")
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
    }
    claimReward("copy")
  }

  const homeHref = locale === "ko" ? "/ko" : "/"
  const nlHref = locale === "ko" ? "/ko#newsletter" : "/#newsletter"

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href={homeHref} style={{ color: "#666", fontSize: 14, textDecoration: "none" }}>
            {t.backLink}
          </a>
          <a href={t.langSwitchHref} style={{ color: "#666", fontSize: 13, textDecoration: "none", border: "1px solid #333", padding: "4px 12px", borderRadius: 6 }}>
            {t.langSwitchLabel}
          </a>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "24px 0 8px" }}>
          {t.heading}
        </h1>
        <p style={{ color: "#999", fontSize: 15, marginBottom: 32 }}>
          {t.subheading}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder={t.placeholder}
            style={{
              flex: 1,
              padding: "14px 16px",
              background: "#111",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              fontSize: 15,
              outline: "none",
            }}
          />
          <button
            onClick={() => analyze()}
            disabled={loading}
            style={{
              padding: "14px 28px",
              background: loading ? "#333" : "#fff",
              color: "#000",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? t.analyzingBtn : t.analyzeBtn}
          </button>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: 14, marginBottom: 16 }}>{error}</p>
        )}

        {result && (
          <div style={{ animation: "up 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "32px 0 20px" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{result.keyword}</h2>
              {result.remaining !== undefined && (
                <span style={{ color: "#666", fontSize: 13 }}>
                  {locale === "ko" ? `오늘 ${result.remaining}${t.remainingLabel}` : `${result.remaining} ${t.remainingLabel}`}
                </span>
              )}
            </div>

            {/* 핵심 지표 카드 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              <Card label={t.totalVolume} value={fmt(result.totalVolume)} sub={`${t.pcLabel} ${fmt(result.pcVolume)} / ${t.mobileLabel} ${fmt(result.mobileVolume)}`} />
              <Card
                label={t.competition}
                value={result.competitionLabel}
                sub={`${t.gradeLabel} ${result.competitionGrade}`}
                color={gradeColor(result.competitionGrade)}
              />
              <Card
                label={t.profitability}
                value={result.profitLabel}
                sub={`${t.gradeLabel} ${result.profitGrade}`}
                color={gradeColor(result.profitGrade)}
              />
            </div>

            {/* 상세 데이터 */}
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.detailTitle}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                <Row label={t.blogDocs} value={fmt(result.blogDocCount)} />
                <Row label={t.newsDocs} value={fmt(result.newsCount)} />
                <Row label={t.cafeDocs} value={fmt(result.cafeCount)} />
                <Row label={t.webDocs} value={fmt(result.webDocCount)} />
                <Row label={t.totalCompetition} value={fmt(result.totalCompetition)} />
                <Row label={t.ratio} value={result.ratio.toString()} />
                <Row label={t.avgClicks} value={fmt(result.avgClickCnt)} />
                <Row label={t.avgCtr} value={`${result.avgCtr}%`} />
                <Row label={t.adCompIdx} value={result.compIdx} />
                <Row label={t.successRate} value={`${result.successRate}%`} />
              </div>
            </div>

            {/* 수익 계산기 */}
            {result.avgCpc > 0 && (
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.revenueTitle}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
                  <Row label={t.pcCpc} value={`₩${fmt(result.pcCpc)}`} />
                  <Row label={t.mobileCpc} value={`₩${fmt(result.mobileCpc)}`} />
                  <Row label={t.avgCpc} value={`₩${fmt(result.avgCpc)}`} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#888", fontSize: 13 }}>{t.shareRate}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{shareRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={shareRate}
                    onChange={(e) => setShareRate(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#22c55e" }}
                  />
                </div>
                <div style={{ background: "#111", borderRadius: 8, padding: 16, textAlign: "center" as const }}>
                  <p style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>{t.estimatedMonthlyRevenue}</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
                    ₩{fmt(Math.round(result.totalVolume * (result.avgCtr / 100) * result.avgCpc * (shareRate / 100)))}
                  </p>
                </div>
                <p style={{ color: "#555", fontSize: 11, marginTop: 8 }}>{t.revenueDisclaimer}</p>
              </div>
            )}

            {/* 제목 패턴 분석 */}
            {result.titlePattern && result.titlePattern.titles.length > 0 && (() => {
              const tp = result.titlePattern!
              const maxCount = Math.max(...tp.titleTypes.map(tt => tt.count))
              return (
                <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.titleAnalysisTitle}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                    <div style={{ background: "#111", borderRadius: 8, padding: 12, textAlign: "center" as const }}>
                      <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{t.avgTitleLength}</p>
                      <p style={{ fontSize: 18, fontWeight: 700 }}>{tp.avgLength}<span style={{ fontSize: 12, color: "#888" }}>{t.charUnit}</span></p>
                    </div>
                    <div style={{ background: "#111", borderRadius: 8, padding: 12, textAlign: "center" as const }}>
                      <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{t.topTitleType}</p>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{tp.titleTypes[0]?.type || "-"}</p>
                    </div>
                    <div style={{ background: "#111", borderRadius: 8, padding: 12, textAlign: "center" as const }}>
                      <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{t.topWords}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>{tp.topWords.slice(0, 3).join(", ") || "-"}</p>
                    </div>
                  </div>

                  <p style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>{t.titleTypeDistribution}</p>
                  <div style={{ marginBottom: 16 }}>
                    {tp.titleTypes.map(tt => (
                      <div key={tt.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "#999", fontSize: 12, minWidth: 60 }}>{tt.type}</span>
                        <div style={{ flex: 1, background: "#111", borderRadius: 4, height: 16, overflow: "hidden" }}>
                          <div style={{ width: `${(tt.count / maxCount) * 100}%`, height: "100%", background: "#3b82f6", borderRadius: 4, transition: "width 0.3s" }} />
                        </div>
                        <span style={{ color: "#666", fontSize: 11, minWidth: 20 }}>{tt.count}</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>{t.topPostTitles}</p>
                  <div>
                    {tp.titles.map((title, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #111" }}>
                        <span style={{ color: "#555", fontSize: 12, minWidth: 20 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, color: "#ccc", lineHeight: 1.4 }}>{title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* 연관 키워드 */}
            {result.relatedKeywords.length > 0 && (
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t.relatedTitle}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.relatedKeywords.map((kw) => (
                    <button
                      key={kw}
                      onClick={() => {
                        setKeyword(kw)
                        analyze(kw)
                      }}
                      style={{
                        padding: "6px 14px",
                        background: "#111",
                        border: "1px solid #333",
                        borderRadius: 20,
                        color: "#ccc",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 공유 버튼 */}
            <div style={{ position: "relative" }}>
              <p style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>
                {t.shareBonusText}
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
                <button onClick={copyShare} style={shareBtnStyle}>
                  {t.copyLink}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${result.keyword}" ${t.ogTitleWithKeyword} - ${t.competition}: ${result.competitionLabel}, ${t.profitability}: ${result.profitLabel}`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => claimReward("twitter")}
                  style={{ ...shareBtnStyle, textDecoration: "none", textAlign: "center" as const }}
                >
                  {t.twitterShare}
                </a>
              </div>
              {toast && (
                <div style={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#22c55e",
                  color: "#fff",
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  animation: "up 0.3s ease",
                }}>
                  {toast}
                </div>
              )}
            </div>

            {/* 뉴스레터 CTA */}
            <div style={{
              background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
              border: "1px solid #222",
              borderRadius: 12,
              padding: 24,
              textAlign: "center" as const,
            }}>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {t.nlCtaTitle}
              </p>
              <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
                {t.nlCtaDesc}
              </p>
              <a
                href={nlHref}
                style={{
                  display: "inline-block",
                  padding: "12px 32px",
                  background: "#fff",
                  color: "#000",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {t.nlCtaBtn}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 16 }}>
      <p style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: color || "#fff", marginBottom: 4 }}>{value}</p>
      <p style={{ color: "#666", fontSize: 11 }}>{sub}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #111" }}>
      <span style={{ color: "#888", fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  )
}

const shareBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px 16px",
  background: "#111",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#ccc",
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}
