"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { type Locale, getTexts } from "@/lib/i18n"
import OpportunityScore from "./components/OpportunityScore"
import RevenueCalculator from "./components/RevenueCalculator"
import TitleAnalysis from "./components/TitleAnalysis"
import AiStructure from "./components/AiStructure"
import RelatedKeywords from "./components/RelatedKeywords"

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
  const [aiStructure, setAiStructure] = useState<{ h1: string; h2: string[]; lsiKeywords: string[]; recommendedLength: number; tip: string } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")

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
    <div className="min-h-screen bg-black text-white px-5 pt-20 pb-16">
      <div className="max-w-[720px] mx-auto">
        <div className="flex justify-between items-center">
          <a href={homeHref} className="text-[#666] text-sm no-underline">
            {t.backLink}
          </a>
          <a
            href={langSwitchHref}
            className="text-[#666] text-[13px] no-underline border border-[#333] px-3 py-1 rounded-md"
          >
            {t.langSwitchLabel}
          </a>
        </div>

        <h1 className="text-3xl font-bold mt-6 mb-2">{t.heading}</h1>
        <p className="text-[#999] text-[15px] mb-8">{t.subheading}</p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder={t.placeholder}
            className="flex-1 px-4 py-3.5 bg-[#111] border border-[#333] rounded-lg text-white text-[15px] outline-none"
          />
          <button
            onClick={() => analyze()}
            disabled={loading}
            className="px-7 py-3.5 border-none rounded-lg text-[15px] font-semibold text-black"
            style={{ background: loading ? "#333" : "#fff", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? t.analyzingBtn : t.analyzeBtn}
          </button>
        </div>

        {error && (
          <p className="text-[#ef4444] text-sm mb-4">{error}</p>
        )}

        {result && (
          <div style={{ animation: "up 0.4s ease" }}>
            <div className="flex items-center gap-3 mt-8 mb-5">
              <h2 className="text-[22px] font-bold">{result.keyword}</h2>
              {result.remaining !== undefined && (
                <span className="text-[#666] text-[13px]">
                  {locale === "ko" ? `오늘 ${result.remaining}${t.remainingLabel}` : `${result.remaining} ${t.remainingLabel}`}
                </span>
              )}
            </div>

            {/* 핵심 지표 카드 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card
                label={t.totalVolume}
                value={fmt(result.totalVolume)}
                sub={`${t.pcLabel} ${fmt(result.pcVolume)} / ${t.mobileLabel} ${fmt(result.mobileVolume)}`}
              />
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
            <OpportunityScore
              opportunityScore={result.opportunityScore}
              verdictKey={result.verdictKey}
              verdict={result.verdict}
              t={t}
            />

            {/* 상세 데이터 */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-6">
              <h3 className="text-base font-semibold mb-4">{t.detailTitle}</h3>
              <div className="grid grid-cols-2 gap-3">
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
              <RevenueCalculator
                totalVolume={result.totalVolume}
                pcCpc={result.pcCpc}
                mobileCpc={result.mobileCpc}
                avgCpc={result.avgCpc}
                avgCtr={result.avgCtr}
                revenueConservative={result.revenueConservative}
                revenueRealistic={result.revenueRealistic}
                revenueOptimistic={result.revenueOptimistic}
                shareRate={shareRate}
                onShareRateChange={setShareRate}
                t={t}
              />
            )}

            {/* 제목 패턴 분석 */}
            {result.titlePattern && result.titlePattern.titles.length > 0 && (
              <TitleAnalysis titlePattern={result.titlePattern} t={t} />
            )}

            {/* AI 글 구조 추천 */}
            <AiStructure
              aiStructure={aiStructure}
              aiLoading={aiLoading}
              aiError={aiError}
              onFetch={fetchAiStructure}
              locale={locale}
              t={t}
            />

            {/* 연관 키워드 */}
            <RelatedKeywords
              keywords={result.relatedKeywords}
              onSelect={(kw) => {
                setKeyword(kw)
                analyze(kw)
              }}
              t={t}
            />

            {/* 공유 버튼 */}
            <div className="relative">
              <p className="text-[#888] text-xs mb-2">{t.shareBonusText}</p>
              <div className="flex gap-2 mb-10">
                <button
                  onClick={copyShare}
                  className="flex-1 px-4 py-3 bg-[#111] border border-[#333] rounded-lg text-[#ccc] text-sm cursor-pointer flex items-center justify-center"
                >
                  {t.copyLink}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${result.keyword}" ${t.ogTitleWithKeyword} - ${t.competition}: ${result.competitionLabel}, ${t.profitability}: ${result.profitLabel}`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => claimReward("twitter")}
                  className="flex-1 px-4 py-3 bg-[#111] border border-[#333] rounded-lg text-[#ccc] text-sm no-underline flex items-center justify-center"
                >
                  {t.twitterShare}
                </a>
              </div>
              {toast && (
                <div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#22c55e] text-white px-5 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap"
                  style={{ animation: "up 0.3s ease" }}
                >
                  {toast}
                </div>
              )}
            </div>

            {/* 뉴스레터 CTA */}
            <div
              className="border border-[#222] rounded-xl p-6 text-center"
              style={{ background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)" }}
            >
              <p className="text-base font-semibold mb-2">{t.nlCtaTitle}</p>
              <p className="text-[#888] text-sm mb-4">{t.nlCtaDesc}</p>
              <a
                href={nlHref}
                className="inline-block px-8 py-3 bg-white text-black rounded-lg text-sm font-semibold no-underline"
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
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
      <p className="text-[#888] text-xs mb-1.5">{label}</p>
      <p className="text-xl font-bold mb-1" style={{ color: color || "#fff" }}>{value}</p>
      <p className="text-[#666] text-[11px]">{sub}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-[#111]">
      <span className="text-[#888] text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
