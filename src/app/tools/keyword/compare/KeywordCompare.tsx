"use client"

import { useState } from "react"
import { type Locale, getTexts } from "@/lib/i18n"
import AdSlot from "@/components/AdSlot"

interface CompareResult {
  keyword: string
  totalVolume: number
  competitionGrade: string
  competitionLabel: string
  profitGrade: string
  profitLabel: string
  opportunityScore: number
  verdict: string
  successRate: number
  avgCpc: number
  estimatedRevenue: number
  revenueRealistic: number
  blogDocCount: number
  ratio: number
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

function bestIdx(results: (CompareResult | null)[], key: keyof CompareResult, higher = true) {
  let best = -1
  let bestVal = higher ? -Infinity : Infinity
  results.forEach((r, i) => {
    if (!r) return
    const v = r[key] as number
    if (higher ? v > bestVal : v < bestVal) {
      bestVal = v
      best = i
    }
  })
  return best
}

interface KeywordCompareProps {
  locale?: Locale
}

export default function KeywordCompare({ locale = "en" }: KeywordCompareProps) {
  const t = getTexts(locale).keyword
  const [inputs, setInputs] = useState(["", "", ""])
  const [results, setResults] = useState<(CompareResult | null)[]>([null, null, null])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const compare = async () => {
    const keywords = inputs.map((k) => k.trim()).filter(Boolean)
    if (keywords.length < 2) {
      setError(locale === "ko" ? "최소 2개 키워드를 입력하세요." : "Enter at least 2 keywords.")
      return
    }

    setLoading(true)
    setError("")
    setResults([null, null, null])

    try {
      const promises = keywords.map((keyword) =>
        fetch("/api/keyword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword }),
        }).then(async (res) => {
          if (!res.ok) return null
          return res.json()
        }).catch(() => null)
      )

      const data = await Promise.all(promises)
      const padded: (CompareResult | null)[] = [null, null, null]
      data.forEach((d, i) => { padded[i] = d })
      setResults(padded)

      if (data.every((d) => !d)) {
        setError(locale === "ko" ? "분석 결과가 없습니다." : "No results found.")
      }
    } catch {
      setError(locale === "ko" ? "서버 오류가 발생했습니다." : "Server error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const activeResults = results.filter(Boolean) as CompareResult[]
  const hasResults = activeResults.length >= 2

  const labels = locale === "ko"
    ? {
        title: "키워드 비교 분석",
        subtitle: "2~3개 키워드를 입력하고 한 눈에 비교하세요",
        placeholder: (n: number) => `키워드 ${n}`,
        btn: "비교 분석",
        analyzing: "분석 중...",
        volume: "월간 검색량",
        competition: "경쟁도",
        profit: "수익성",
        score: "기회점수",
        success: "성공률",
        cpc: "평균 CPC",
        revenue: "예상 월수익",
        blogDocs: "블로그 문서 수",
        ratio: "검색/경쟁 비율",
        verdict: "종합 판정",
        winner: "추천",
        back: "← 단일 분석으로",
      }
    : {
        title: "Keyword Comparison",
        subtitle: "Enter 2-3 keywords and compare them side by side",
        placeholder: (n: number) => `Keyword ${n}`,
        btn: "Compare",
        analyzing: "Analyzing...",
        volume: "Monthly Volume",
        competition: "Competition",
        profit: "Profitability",
        score: "Opportunity Score",
        success: "Success Rate",
        cpc: "Avg CPC",
        revenue: "Est. Monthly Revenue",
        blogDocs: "Blog Documents",
        ratio: "Search/Competition",
        verdict: "Verdict",
        winner: "Recommended",
        back: "← Single Analysis",
      }

  const toolsPath = locale === "ko" ? "/ko/tools/keyword" : "/tools/keyword"

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "24px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <a href={toolsPath} style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>
            {labels.back}
          </a>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 12, marginBottom: 8 }}>
            {labels.title}
          </h1>
          <p style={{ color: "#888", fontSize: 14 }}>{labels.subtitle}</p>
        </div>

        {/* Input Form */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={labels.placeholder(i + 1)}
              value={inputs[i]}
              onChange={(e) => {
                const next = [...inputs]
                next[i] = e.target.value
                setInputs(next)
              }}
              onKeyDown={(e) => e.key === "Enter" && compare()}
              style={{
                flex: 1,
                minWidth: 150,
                padding: "12px 16px",
                background: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          ))}
          <button
            onClick={compare}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: loading ? "#333" : "#fff",
              color: loading ? "#888" : "#000",
              borderRadius: 8,
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? labels.analyzing : labels.btn}
          </button>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

        {/* Comparison Table */}
        {hasResults && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #222" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#888", fontWeight: 500 }}></th>
                  {results.map((r, i) =>
                    r ? (
                      <th key={i} style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: 16 }}>
                        &ldquo;{r.keyword}&rdquo;
                      </th>
                    ) : null
                  )}
                </tr>
              </thead>
              <tbody>
                {/* 기회점수 */}
                <MetricRow
                  label={labels.score}
                  results={results}
                  render={(r) => (
                    <span style={{ fontSize: 24, fontWeight: 800, color: r.opportunityScore >= 70 ? "#22c55e" : r.opportunityScore >= 40 ? "#eab308" : "#ef4444" }}>
                      {r.opportunityScore}<span style={{ fontSize: 13, color: "#666" }}>/100</span>
                    </span>
                  )}
                  bestIndex={bestIdx(results, "opportunityScore")}
                />
                {/* 월간 검색량 */}
                <MetricRow
                  label={labels.volume}
                  results={results}
                  render={(r) => <span style={{ fontWeight: 600 }}>{fmt(r.totalVolume)}</span>}
                  bestIndex={bestIdx(results, "totalVolume")}
                />
                {/* 경쟁도 */}
                <MetricRow
                  label={labels.competition}
                  results={results}
                  render={(r) => (
                    <span style={{ color: gradeColor(r.competitionGrade), fontWeight: 700 }}>
                      {r.competitionGrade} ({r.competitionLabel})
                    </span>
                  )}
                  bestIndex={bestIdx(results, "blogDocCount", false)}
                />
                {/* 수익성 */}
                <MetricRow
                  label={labels.profit}
                  results={results}
                  render={(r) => (
                    <span style={{ color: gradeColor(r.profitGrade), fontWeight: 700 }}>
                      {r.profitGrade} ({r.profitLabel})
                    </span>
                  )}
                  bestIndex={-1}
                />
                {/* 성공률 */}
                <MetricRow
                  label={labels.success}
                  results={results}
                  render={(r) => <span>{r.successRate}%</span>}
                  bestIndex={bestIdx(results, "successRate")}
                />
                {/* 평균 CPC */}
                <MetricRow
                  label={labels.cpc}
                  results={results}
                  render={(r) => <span>₩{fmt(r.avgCpc)}</span>}
                  bestIndex={bestIdx(results, "avgCpc")}
                />
                {/* 예상 월수익 */}
                <MetricRow
                  label={labels.revenue}
                  results={results}
                  render={(r) => <span style={{ color: "#22c55e" }}>₩{fmt(r.revenueRealistic)}</span>}
                  bestIndex={bestIdx(results, "revenueRealistic")}
                />
                {/* 블로그 문서 수 */}
                <MetricRow
                  label={labels.blogDocs}
                  results={results}
                  render={(r) => <span>{fmt(r.blogDocCount)}</span>}
                  bestIndex={bestIdx(results, "blogDocCount", false)}
                />
                {/* 검색/경쟁 비율 */}
                <MetricRow
                  label={labels.ratio}
                  results={results}
                  render={(r) => <span>{r.ratio.toFixed(2)}</span>}
                  bestIndex={bestIdx(results, "ratio")}
                />
                {/* 종합 판정 */}
                <MetricRow
                  label={labels.verdict}
                  results={results}
                  render={(r) => <span style={{ fontWeight: 600 }}>{r.verdict}</span>}
                  bestIndex={-1}
                />
              </tbody>
            </table>

            {/* Winner Banner */}
            {(() => {
              const winnerIdx = bestIdx(results, "opportunityScore")
              const winner = results[winnerIdx]
              if (!winner) return null
              return (
                <div style={{
                  marginTop: 24,
                  padding: "20px 24px",
                  background: "linear-gradient(135deg, #0a2010 0%, #0a0a0a 100%)",
                  border: "1px solid #22c55e33",
                  borderRadius: 12,
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{labels.winner}</p>
                  <p style={{ fontSize: 22, fontWeight: 800 }}>
                    &ldquo;{winner.keyword}&rdquo;
                    <span style={{ marginLeft: 12, color: "#22c55e" }}>{winner.opportunityScore}/100</span>
                  </p>
                  <a
                    href={`${toolsPath}/${encodeURIComponent(winner.keyword)}`}
                    style={{
                      display: "inline-block",
                      marginTop: 12,
                      padding: "10px 24px",
                      background: "#fff",
                      color: "#000",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {locale === "ko" ? "상세 분석 보기 →" : "View Details →"}
                  </a>
                </div>
              )
            })()}

            {/* AdSense */}
            <div style={{ marginTop: 24 }}>
              <AdSlot slot="COMPARE_BOTTOM" format="auto" responsive />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricRow({
  label,
  results,
  render,
  bestIndex,
}: {
  label: string
  results: (CompareResult | null)[]
  render: (r: CompareResult) => React.ReactNode
  bestIndex: number
}) {
  return (
    <tr style={{ borderBottom: "1px solid #111" }}>
      <td style={{ padding: "14px 16px", color: "#888", fontWeight: 500, whiteSpace: "nowrap" }}>{label}</td>
      {results.map((r, i) =>
        r ? (
          <td
            key={i}
            style={{
              padding: "14px 16px",
              textAlign: "center",
              background: i === bestIndex ? "#22c55e0d" : "transparent",
              borderLeft: i === bestIndex ? "2px solid #22c55e33" : "none",
              borderRight: i === bestIndex ? "2px solid #22c55e33" : "none",
            }}
          >
            {render(r)}
          </td>
        ) : null
      )}
    </tr>
  )
}
