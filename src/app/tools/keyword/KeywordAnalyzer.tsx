"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

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

export default function KeywordAnalyzer() {
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<KeywordResult | null>(null)
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)

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
      const res = await fetch("/api/keyword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: q }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = result
    ? `https://wealthpipe.net/tools/keyword?q=${encodeURIComponent(result.keyword)}`
    : ""

  const copyShare = async () => {
    await navigator.clipboard.writeText(shareUrl)
    alert("링크가 복사되었습니다!")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/" style={{ color: "#666", fontSize: 14, textDecoration: "none" }}>
          ← WealthPipe
        </a>

        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "24px 0 8px" }}>
          키워드 분석기
        </h1>
        <p style={{ color: "#999", fontSize: 15, marginBottom: 32 }}>
          네이버 검색량, 경쟁도, 수익성을 한눈에 분석하세요.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="분석할 키워드 입력 (예: 주식 투자)"
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
            {loading ? "분석 중..." : "분석"}
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
                  오늘 {result.remaining}회 남음
                </span>
              )}
            </div>

            {/* 핵심 지표 카드 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              <Card label="월간 검색량" value={fmt(result.totalVolume)} sub={`PC ${fmt(result.pcVolume)} / 모바일 ${fmt(result.mobileVolume)}`} />
              <Card
                label="경쟁도"
                value={result.competitionLabel}
                sub={`등급 ${result.competitionGrade}`}
                color={gradeColor(result.competitionGrade)}
              />
              <Card
                label="수익성"
                value={result.profitLabel}
                sub={`등급 ${result.profitGrade}`}
                color={gradeColor(result.profitGrade)}
              />
            </div>

            {/* 상세 데이터 */}
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>상세 데이터</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                <Row label="블로그 발행량" value={fmt(result.blogDocCount)} />
                <Row label="뉴스 문서수" value={fmt(result.newsCount)} />
                <Row label="카페 글수" value={fmt(result.cafeCount)} />
                <Row label="웹 문서수" value={fmt(result.webDocCount)} />
                <Row label="총 경쟁 문서" value={fmt(result.totalCompetition)} />
                <Row label="검색량/발행량 비율" value={result.ratio.toString()} />
                <Row label="평균 클릭수" value={fmt(result.avgClickCnt)} />
                <Row label="평균 클릭률" value={`${result.avgCtr}%`} />
                <Row label="광고 경쟁지수" value={result.compIdx} />
                <Row label="성공률" value={`${result.successRate}%`} />
              </div>
            </div>

            {/* 연관 키워드 */}
            {result.relatedKeywords.length > 0 && (
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>연관 키워드</h3>
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
            <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
              <button onClick={copyShare} style={shareBtnStyle}>
                링크 복사
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${result.keyword}" 키워드 분석 결과 - 경쟁도: ${result.competitionLabel}, 수익성: ${result.profitLabel}`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...shareBtnStyle, textDecoration: "none", textAlign: "center" as const }}
              >
                트위터 공유
              </a>
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
                매주 핫 키워드 분석을 이메일로 받아보세요
              </p>
              <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
                WealthPipe 뉴스레터 - 매주 월요일 발행
              </p>
              <a
                href="/#newsletter"
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
                뉴스레터 구독하기
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
