"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { type Locale, getTexts } from "@/lib/i18n"
import AdSlot from "@/components/AdSlot"

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
  revenueConservative: number
  revenueRealistic: number
  revenueOptimistic: number
  opportunityScore: number
  verdict: string
  verdictKey: string
  titlePattern?: {
    avgLength: number
    topWords: string[]
    titleTypes: { type: string; count: number }[]
    titles: string[]
    links: string[]
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
  initialKeyword?: string
}

export default function KeywordAnalyzer({ locale = "en", initialKeyword }: KeywordAnalyzerProps) {
  const t = getTexts(locale).keyword
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<KeywordResult | null>(null)
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shareRate, setShareRate] = useState(5)
  const [aiStructure, setAiStructure] = useState<{ h1: string; h2: string[]; lsiKeywords: string[]; recommendedLength: number; tip: string } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [trend, setTrend] = useState<{ period: string; ratio: number }[] | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState("")
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)

  useEffect(() => {
    if (initialized) return
    const q = initialKeyword || searchParams.get("q")
    if (q) {
      setKeyword(q)
      setInitialized(true)
      analyze(q)
    } else {
      setInitialized(true)
    }
  }, [searchParams, initialized, initialKeyword])

  const analyze = async (overrideKeyword?: string) => {
    const q = (overrideKeyword ?? keyword).trim()
    if (!q) return
    setLoading(true)
    setError("")
    setLimitReached(false)
    setResult(null)
    try {
      const adminKey = searchParams.get("admin") || ""
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (adminKey) headers["x-admin-key"] = adminKey
      const res = await fetch("/api/keyword", {
        method: "POST",
        headers,
        body: JSON.stringify({ keyword: q, admin: adminKey || undefined }),
      })
      let data
      try { data = await res.json() } catch { data = null }
      if (!res.ok) {
        if (res.status === 429) {
          setLimitReached(true)
        } else {
          setError(data?.error || `Error ${res.status}`)
        }
      } else if (data) {
        setResult(data)
        // Fetch trend data
        fetch("/api/keyword/trend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: q }),
        }).then(r => r.ok ? r.json() : null).then(d => setTrend(d?.trend || null)).catch(() => {})
      } else {
        setError(t.networkError)
      }
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }

  const fetchAiStructure = async () => {
    if (!result || aiLoading) return
    setAiLoading(true)
    setAiError("")
    setAiStructure(null)
    try {
      const adminKey = searchParams.get("admin") || ""
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (adminKey) headers["x-admin-key"] = adminKey
      const res = await fetch("/api/keyword-structure", {
        method: "POST",
        headers,
        body: JSON.stringify({
          keyword: result.keyword,
          context: {
            totalVolume: result.totalVolume,
            competitionLabel: result.competitionLabel,
            topTitles: result.titlePattern?.titles || [],
            topWords: result.titlePattern?.topWords || [],
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) { setAiError(data.error); return }
      setAiStructure(data)
    } catch {
      setAiError(t.networkError)
    } finally {
      setAiLoading(false)
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

  const submitWaitlist = async () => {
    if (!waitlistEmail || waitlistSubmitted) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waitlistEmail)) {
      setError(locale === "ko" ? "올바른 이메일을 입력해주세요." : "Please enter a valid email.")
      return
    }
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Pro Waitlist", email: waitlistEmail }),
      })
      if (res.ok || res.status === 409) {
        setWaitlistSubmitted(true)
      }
    } catch { /* ignore */ }
  }

  const nativeShare = async () => {
    if (!result) return
    const text = locale === "ko"
      ? `"${result.keyword}" 키워드 분석 결과 - 경쟁도: ${result.competitionLabel}, 수익성: ${result.profitLabel}`
      : `"${result.keyword}" ${t.ogTitleWithKeyword} - ${t.competition}: ${result.competitionLabel}, ${t.profitability}: ${result.profitLabel}`
    if (navigator.share) {
      try {
        await navigator.share({ title: t.ogTitleWithKeyword, text, url: shareUrl })
        claimReward("kakao")
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      claimReward("kakao")
    }
  }

  const homeHref = locale === "ko" ? "/ko" : "/"
  const nlHref = locale === "ko" ? "/ko#newsletter" : "/#newsletter"

  const langSwitchHref = (() => {
    const params = new URLSearchParams()
    const q = searchParams.get("q")
    const admin = searchParams.get("admin")
    if (q) params.set("q", q)
    if (admin) params.set("admin", admin)
    const qs = params.toString()
    return `${t.langSwitchHref}${qs ? `?${qs}` : ""}`
  })()

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href={homeHref} style={{ color: "#666", fontSize: 14, textDecoration: "none" }}>
            {t.backLink}
          </a>
          <a href={langSwitchHref} style={{ color: "#666", fontSize: 13, textDecoration: "none", border: "1px solid #333", padding: "4px 12px", borderRadius: 6 }}>
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

        {error && !limitReached && (
          <p style={{ color: "#ef4444", fontSize: 14, marginBottom: 16 }}>{error}</p>
        )}

        {/* 한도 도달 시 업그레이드 CTA */}
        {limitReached && (
          <div style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)",
            border: "1px solid #333",
            borderRadius: 16,
            padding: 28,
            marginBottom: 24,
            animation: "up 0.4s ease",
          }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t.limitTitle}</h3>
              <p style={{ color: "#888", fontSize: 14, lineHeight: 1.6 }}>{t.limitDesc}</p>
            </div>

            {/* Pro 대기자 이메일 수집 */}
            <div style={{ background: "#111", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.limitProCta}</p>
              {!waitlistSubmitted ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitWaitlist()}
                    placeholder={t.limitEmailPlaceholder}
                    style={{
                      flex: 1, padding: "10px 14px", background: "#0a0a0a", border: "1px solid #333",
                      borderRadius: 8, color: "#fff", fontSize: 13, outline: "none",
                    }}
                  />
                  <button
                    onClick={submitWaitlist}
                    style={{
                      padding: "10px 20px", background: "#fff", color: "#000", border: "none",
                      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {t.limitEmailBtn}
                  </button>
                </div>
              ) : (
                <p style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>{t.limitEmailSuccess}</p>
              )}
            </div>

            {/* 공유 보너스 안내 - 한도 도달 후 다음 분석을 유도 */}
            <div style={{
              width: "100%", padding: "12px", background: "#0a0a0a", border: "1px solid #333",
              borderRadius: 12, color: "#888", fontSize: 13, marginBottom: 12, textAlign: "center",
            }}>
              🔗 {locale === "ko"
                ? "다음 분석 결과에서 공유하면 +3회 보너스를 받을 수 있어요"
                : "Share your next analysis result to earn +3 bonus analyses"}
            </div>

            {/* Pricing 페이지 링크 */}
            <a
              href={locale === "ko" ? "/ko/pricing" : "/pricing"}
              style={{
                display: "block", width: "100%", padding: "12px", background: "transparent",
                border: "1px solid #222", borderRadius: 12, color: "#666", fontSize: 13,
                textDecoration: "none", textAlign: "center",
              }}
            >
              {locale === "ko" ? "요금제 비교 보기 →" : "Compare Plans →"}
            </a>
          </div>
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

            {/* Opportunity Score + 판정 */}
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ color: "#888", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>{t.opportunityScore}</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: gradeColor(result.opportunityScore >= 80 ? "A" : result.opportunityScore >= 60 ? "B" : result.opportunityScore >= 40 ? "C" : "E") }}>
                  {result.opportunityScore}
                </span>
              </div>
              <div style={{ background: "#111", borderRadius: 6, height: 12, overflow: "hidden", marginBottom: 12 }}>
                <div style={{
                  width: `${result.opportunityScore}%`,
                  height: "100%",
                  borderRadius: 6,
                  background: result.opportunityScore >= 80 ? "#22c55e" : result.opportunityScore >= 60 ? "#3b82f6" : result.opportunityScore >= 40 ? "#eab308" : "#ef4444",
                  transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                background: result.opportunityScore >= 80 ? "rgba(34,197,94,0.15)" : result.opportunityScore >= 60 ? "rgba(59,130,246,0.15)" : result.opportunityScore >= 40 ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)",
                color: result.opportunityScore >= 80 ? "#22c55e" : result.opportunityScore >= 60 ? "#3b82f6" : result.opportunityScore >= 40 ? "#eab308" : "#ef4444",
              }}>
                {t[result.verdictKey as keyof typeof t] || result.verdict}
              </div>
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

                {/* 수익 3단계 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
                  <div style={{ background: "#111", borderRadius: 8, padding: 12, textAlign: "center" as const }}>
                    <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{t.revenueConservative}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#888" }}>₩{fmt(result.revenueConservative)}</p>
                  </div>
                  <div style={{ background: "#111", borderRadius: 8, padding: 12, textAlign: "center" as const, border: "1px solid #22c55e" }}>
                    <p style={{ color: "#22c55e", fontSize: 11, marginBottom: 4 }}>{t.revenueRealistic}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>₩{fmt(result.revenueRealistic)}</p>
                  </div>
                  <div style={{ background: "#111", borderRadius: 8, padding: 12, textAlign: "center" as const }}>
                    <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{t.revenueOptimistic}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#3b82f6" }}>₩{fmt(result.revenueOptimistic)}</p>
                  </div>
                </div>

                {/* 커스텀 슬라이더 */}
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
                  <div style={{ background: "#111", borderRadius: 8, padding: 12, textAlign: "center" as const, marginTop: 8 }}>
                    <p style={{ color: "#888", fontSize: 11, marginBottom: 2 }}>{t.estimatedMonthlyRevenue} ({shareRate}%)</p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>
                      ₩{fmt(Math.round(result.totalVolume * (result.avgCtr / 100) * result.avgCpc * (shareRate / 100)))}
                    </p>
                  </div>
                </div>
                <p style={{ color: "#555", fontSize: 11 }}>{t.revenueDisclaimer}</p>
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
                        <a href={tp.links[i]} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#ccc", lineHeight: 1.4, textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#3b82f6")} onMouseLeave={e => (e.currentTarget.style.color = "#ccc")}>{title}</a>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* AI 글 구조 추천 */}
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t.aiStructureTitle}</h3>
                <span style={{ color: "#555", fontSize: 11 }}>{t.aiStructureLimit}</span>
              </div>
              {!aiStructure && !aiLoading && (
                <button
                  onClick={fetchAiStructure}
                  style={{
                    width: "100%", padding: "12px", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {t.aiStructureBtn}
                </button>
              )}
              {aiLoading && (
                <div style={{ textAlign: "center" as const, padding: 20, color: "#888" }}>
                  <div style={{ display: "inline-block", width: 20, height: 20, border: "2px solid #333", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 8 }} />
                  {t.aiStructureLoading}
                </div>
              )}
              {aiError && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>{aiError}</p>}
              {aiStructure && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{t.aiStructureH1}</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", background: "#111", padding: "10px 14px", borderRadius: 8 }}>{aiStructure.h1}</p>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ color: "#888", fontSize: 11, marginBottom: 6 }}>{t.aiStructureH2}</p>
                    {aiStructure.h2.map((h, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #111" }}>
                        <span style={{ color: "#3b82f6", fontSize: 12, fontWeight: 600, minWidth: 24 }}>H2</span>
                        <span style={{ fontSize: 13, color: "#ccc" }}>{h}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ color: "#888", fontSize: 11, marginBottom: 6 }}>{t.aiStructureLsi}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {aiStructure.lsiKeywords.map((k, i) => (
                        <span key={i} style={{ padding: "4px 10px", background: "#111", border: "1px solid #333", borderRadius: 16, fontSize: 12, color: "#aaa" }}>{k}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: "#111", borderRadius: 8, padding: 10, textAlign: "center" as const }}>
                      <p style={{ color: "#888", fontSize: 11, marginBottom: 2 }}>{t.aiStructureLength}</p>
                      <p style={{ fontSize: 15, fontWeight: 600 }}>{aiStructure.recommendedLength.toLocaleString()}{locale === "ko" ? "자" : " chars"}</p>
                    </div>
                  </div>
                  <div style={{ background: "#111", borderRadius: 8, padding: 12 }}>
                    <p style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{t.aiStructureTip}</p>
                    <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{aiStructure.tip}</p>
                  </div>
                </div>
              )}
            </div>

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
            <div id="share-section" style={{ position: "relative" }}>
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
                <button onClick={nativeShare} style={shareBtnStyle}>
                  {t.shareNative}
                </button>
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

            {/* 트렌드 차트 */}
            {trend && trend.length > 0 && <TrendChart data={trend} locale={locale} />}

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

            {/* AdSense 인피드 광고 */}
            <div style={{ marginTop: 16 }}>
              <AdSlot slot="KEYWORD_RESULT_BOTTOM" format="auto" responsive />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TrendChart({ data, locale }: { data: { period: string; ratio: number }[]; locale: string }) {
  const maxRatio = Math.max(...data.map(d => d.ratio), 1)
  const label = locale === "ko" ? "검색 트렌드 (12개월)" : "Search Trend (12 months)"
  const isRising = data.length >= 2 && data[data.length - 1].ratio > data[data.length - 2].ratio
  const trendLabel = locale === "ko"
    ? (isRising ? "상승 추세" : "하락 추세")
    : (isRising ? "Rising" : "Declining")

  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ color: "#888", fontSize: 12 }}>{label}</p>
        <span style={{ fontSize: 11, color: isRising ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
          {isRising ? "↑" : "↓"} {trendLabel}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d.ratio / maxRatio) * 72)
          const isLast = i === data.length - 1
          return (
            <div key={d.period} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: h,
                  background: isLast ? "#22c55e" : "#333",
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.3s ease",
                }}
                title={`${d.period}: ${d.ratio}`}
              />
            </div>
          )
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#555" }}>{data[0]?.period?.slice(0, 7)}</span>
        <span style={{ fontSize: 10, color: "#555" }}>{data[data.length - 1]?.period?.slice(0, 7)}</span>
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
