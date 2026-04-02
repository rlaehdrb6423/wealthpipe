"use client"

import { useState, useEffect, useCallback } from "react"
import { type Locale, getTexts } from "@/lib/i18n"
import { initKakao, shareScreener } from "@/lib/kakao-share"
import AdSlot from "@/components/AdSlot"

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

interface ScreenerProps {
  locale: Locale
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

function formatMarketCap(v: number | null): string {
  if (v === null || v === undefined) return "—"
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`
  return `${v.toLocaleString()}억`
}

function formatNum(v: number | null, digits = 2): string {
  if (v === null || v === undefined) return "—"
  return v.toFixed(digits)
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [breakpoint])
  return isMobile
}

interface Preset {
  label: string
  labelEn: string
  params: Record<string, string>
}

const PRESETS: Preset[] = [
  { label: "저평가주", labelEn: "Low Valuation", params: { per_max: "10", pbr_max: "1" } },
  { label: "고배당주", labelEn: "High Dividend", params: { div_min: "4", market_cap_min: "500" } },
  { label: "퀄리티주", labelEn: "Quality", params: { per_max: "15", roe_min: "15" } },
  { label: "소형 가치주", labelEn: "Small Cap Value", params: { per_max: "10", pbr_max: "1", market_cap_min: "100" } },
  { label: "순자산주", labelEn: "Net-Net", params: { pbr_max: "0.5" } },
  { label: "AI 추천", labelEn: "AI Top Picks", params: { score_min: "65", sort: "ai_score" } },
]

export default function FactorScreener({ locale }: ScreenerProps) {
  const t = getTexts(locale).screener
  const isMobile = useIsMobile()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [totalCount, setTotalCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activePreset, setActivePreset] = useState<number | null>(null)
  const [sortCol, setSortCol] = useState("market_cap")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [perMax, setPerMax] = useState("")
  const [pbrMax, setPbrMax] = useState("")
  const [roeMin, setRoeMin] = useState("")
  const [divMin, setDivMin] = useState("")
  const [capMin, setCapMin] = useState("")
  const [scoreMin, setScoreMin] = useState("")
  const [market, setMarket] = useState("")

  useEffect(() => { initKakao() }, [])

  // Fetch stats on mount
  useEffect(() => {
    fetch("/api/screener?endpoint=stats")
      .then((r) => r.json())
      .then((d) => {
        setTotalCount(d.total || 0)
        setLastUpdate(d.last_updated || "")
      })
      .catch(() => {})
  }, [])

  const fetchScreener = useCallback(
    async (overrides?: Record<string, string>) => {
      setLoading(true)
      setError("")
      try {
        const params = new URLSearchParams({ endpoint: "screener", limit: "100" })
        const filters = overrides || {
          ...(perMax && { per_max: perMax }),
          ...(pbrMax && { pbr_max: pbrMax }),
          ...(roeMin && { roe_min: roeMin }),
          ...(divMin && { div_min: divMin }),
          ...(capMin && { market_cap_min: capMin }),
          ...(scoreMin && { score_min: scoreMin }),
          ...(market && { market }),
          ...(searchQuery && { q: searchQuery }),
        }
        Object.entries(filters).forEach(([k, v]) => params.set(k, v))
        params.set("sort", sortCol)
        params.set("order", sortDir)

        const res = await fetch(`/api/screener?${params}`)
        if (!res.ok) throw new Error("fetch failed")
        const json = await res.json()
        setStocks(json.stocks || [])
      } catch {
        setError(t.errorText)
      } finally {
        setLoading(false)
      }
    },
    [perMax, pbrMax, roeMin, divMin, capMin, scoreMin, market, searchQuery, sortCol, sortDir, t.errorText]
  )

  // Initial load
  useEffect(() => {
    fetchScreener({ sort: "ai_score", order: "desc", score_min: "50" })
    setActivePreset(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyPreset(idx: number) {
    const p = PRESETS[idx]
    setPerMax(p.params.per_max || "")
    setPbrMax(p.params.pbr_max || "")
    setRoeMin(p.params.roe_min || "")
    setDivMin(p.params.div_min || "")
    setCapMin(p.params.market_cap_min || "")
    setScoreMin(p.params.score_min || "")
    setMarket(p.params.market || "")
    setSearchQuery("")
    setActivePreset(idx)
    setSortCol(p.params.sort || "market_cap")
    setSortDir((p.params.order as "asc" | "desc") || "desc")
    fetchScreener({ ...p.params, limit: "100" })
  }

  function handleSort(col: string) {
    const newDir = sortCol === col && sortDir === "desc" ? "asc" : "desc"
    setSortCol(col)
    setSortDir(newDir)
  }

  // Re-fetch when sort changes (after initial load)
  useEffect(() => {
    if (stocks.length > 0) fetchScreener()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortCol, sortDir])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setActivePreset(null)
    fetchScreener()
  }

  const COLUMN_TOOLTIPS: Record<string, string> = locale === "ko" ? {
    ai_score: "밸류에이션, 수익성, 배당, 실적 안정성을 종합한 팩터 점수 (0~100)",
    per: "주가수익비율. 주가 / 주당순이익. 낮을수록 저평가 (보통 10 이하면 저평가)",
    pbr: "주가순자산비율. 주가 / 주당순자산. 1 미만이면 자산가치보다 싸게 거래 중",
    roe: "자기자본이익률. 투자한 자본 대비 얼마나 벌었는지. 높을수록 효율적 (10%+ 양호)",
    dividend_yield: "배당수익률. 주가 대비 연간 배당금 비율. 높을수록 배당 매력적 (3%+ 고배당)",
    market_cap: "시가총액. 주가 x 발행주식수. 기업의 시장가치 크기",
    price: "현재 주가 (원)",
  } : {
    ai_score: "Composite factor score (0-100) based on valuation, profitability, dividend, and stability",
    per: "Price-to-Earnings Ratio. Lower = cheaper (under 10 is undervalued)",
    pbr: "Price-to-Book Ratio. Under 1.0 = trading below asset value",
    roe: "Return on Equity. How efficiently capital is used (10%+ is good)",
    dividend_yield: "Annual dividend / stock price. Higher = better income (3%+ is high)",
    market_cap: "Market capitalization. Stock price x shares outstanding",
    price: "Current stock price",
  }

  const columns: { key: string; label: string; align: "left" | "right" }[] = [
    { key: "name", label: t.colName, align: "left" },
    { key: "ai_score", label: t.colScore, align: "right" },
    { key: "per", label: "PER", align: "right" },
    { key: "pbr", label: "PBR", align: "right" },
    { key: "roe", label: "ROE %", align: "right" },
    { key: "dividend_yield", label: t.colDiv, align: "right" },
    { key: "market_cap", label: t.colCap, align: "right" },
    { key: "price", label: t.colPrice, align: "right" },
  ]

  // Column min-widths to prevent text overlap
  const COL_MIN_WIDTH: Record<string, number> = {
    name: isMobile ? 120 : 140,
    ai_score: 72,
    per: 60,
    pbr: 60,
    roe: 64,
    dividend_yield: 60,
    market_cap: 72,
    price: 80,
  }

  const inputStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid #333",
    borderRadius: 6,
    padding: isMobile ? "10px 12px" : "8px 12px",
    color: "#fff",
    fontSize: isMobile ? 16 : 13,
    width: "100%",
    outline: "none",
    minHeight: 44,
    boxSizing: "border-box",
  }

  // Shared cell padding
  const cellPad = isMobile ? "8px 6px" : "10px 8px"

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "0 12px 60px" : "0 16px 80px" }}>
      {/* Back link */}
      <a
        href={locale === "ko" ? "/ko" : "/"}
        style={{
          display: "inline-block",
          color: "#666",
          fontSize: 13,
          marginBottom: isMobile ? 20 : 32,
          textDecoration: "none",
          padding: isMobile ? "8px 0" : undefined,
        }}
      >
        {t.backLink}
      </a>

      {/* Heading */}
      <div style={{ marginBottom: isMobile ? 24 : 32 }}>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 42px)", fontWeight: 800, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
          {t.heading}
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 15, color: "#888", lineHeight: 1.6 }}>{t.subheading}</p>
        {totalCount > 0 && (
          <p style={{ fontSize: 12, color: "#555", marginTop: 8 }}>
            KRX {totalCount.toLocaleString()} {t.stocksLabel}
            {lastUpdate && ` · ${t.updatedLabel} ${lastUpdate.split(" ")[0]}`}
          </p>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="submit"
            style={{
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: 6,
              padding: isMobile ? "10px 16px" : "8px 20px",
              fontSize: isMobile ? 14 : 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: 44,
            }}
          >
            {t.searchBtn}
          </button>
        </div>
      </form>

      {/* Presets */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 6 : 8, marginBottom: 20 }}>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => applyPreset(i)}
            style={{
              background: activePreset === i ? "#fff" : "#111",
              color: activePreset === i ? "#000" : "#ccc",
              border: `1px solid ${activePreset === i ? "#fff" : "#333"}`,
              borderRadius: 6,
              padding: isMobile ? "8px 12px" : "6px 14px",
              fontSize: isMobile ? 13 : 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              minHeight: 44,
            }}
          >
            {locale === "ko" ? p.label : p.labelEn}
          </button>
        ))}
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{
          background: "none",
          border: "1px solid #333",
          borderRadius: 6,
          padding: isMobile ? "10px 16px" : "6px 14px",
          fontSize: isMobile ? 13 : 12,
          color: "#888",
          cursor: "pointer",
          marginBottom: 16,
          minHeight: 44,
        }}
      >
        {t.filterToggle} {showFilters ? "▲" : "▼"}
      </button>

      {/* Filters */}
      {showFilters && (
        <div
          style={{
            background: "#0d0d0d",
            border: "1px solid #222",
            borderRadius: 12,
            padding: isMobile ? 16 : 20,
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(140px, 1fr))",
            gap: isMobile ? 10 : 12,
          }}
        >
          <div>
            <label style={{ fontSize: 12, color: "#bbb", display: "block", marginBottom: 6, fontWeight: 600 }}>PER {t.maxLabel}</label>
            <input type="number" value={perMax} onChange={(e) => setPerMax(e.target.value)} style={inputStyle} placeholder="e.g. 15" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#bbb", display: "block", marginBottom: 6, fontWeight: 600 }}>PBR {t.maxLabel}</label>
            <input type="number" value={pbrMax} onChange={(e) => setPbrMax(e.target.value)} style={inputStyle} placeholder="e.g. 1.0" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#bbb", display: "block", marginBottom: 6, fontWeight: 600 }}>ROE {t.minLabel}</label>
            <input type="number" value={roeMin} onChange={(e) => setRoeMin(e.target.value)} style={inputStyle} placeholder="e.g. 10" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#bbb", display: "block", marginBottom: 6, fontWeight: 600 }}>{t.divLabel} {t.minLabel}</label>
            <input type="number" value={divMin} onChange={(e) => setDivMin(e.target.value)} style={inputStyle} placeholder="e.g. 3" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#bbb", display: "block", marginBottom: 6, fontWeight: 600 }}>{t.capLabel} {t.minLabel}</label>
            <input type="number" value={capMin} onChange={(e) => setCapMin(e.target.value)} style={inputStyle} placeholder="e.g. 1000" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#bbb", display: "block", marginBottom: 6, fontWeight: 600 }}>AI Score {t.minLabel}</label>
            <input type="number" value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} style={inputStyle} placeholder="e.g. 60" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#bbb", display: "block", marginBottom: 6, fontWeight: 600 }}>{t.marketLabel}</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              <option value="">{t.marketAll}</option>
              <option value="KOSPI">KOSPI</option>
              <option value="KOSDAQ">KOSDAQ</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gridColumn: isMobile ? "1 / -1" : undefined }}>
            <button
              onClick={() => { setActivePreset(null); fetchScreener() }}
              style={{
                background: "#fff",
                color: "#000",
                border: "none",
                borderRadius: 6,
                padding: isMobile ? "12px 20px" : "8px 20px",
                fontSize: isMobile ? 14 : 13,
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                minHeight: 44,
              }}
            >
              {t.applyBtn}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 40, height: 40, border: "2px solid #222", borderTop: "2px solid #fff", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 14 }}>{t.loadingText}</p>
          </div>
        </div>
      ) : error ? (
        <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
            {stocks.length} {t.resultsLabel}
            {isMobile && stocks.length > 0 && (
              <span style={{ marginLeft: 8, color: "#555" }}>← {locale === "ko" ? "좌우 스크롤" : "scroll"} →</span>
            )}
          </p>

          {/* Table */}
          <div
            style={{
              overflowX: "auto",
              marginBottom: 32,
              WebkitOverflowScrolling: "touch",
              position: "relative",
            }}
          >
            <table style={{ width: isMobile ? "max-content" : "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: isMobile ? 12 : 13 }}>
              <thead>
                <tr>
                  {columns.map((col, colIdx) => {
                    const isSticky = colIdx === 0
                    return (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        style={{
                          textAlign: col.align,
                          padding: cellPad,
                          borderBottom: "1px solid #222",
                          color: sortCol === col.key ? "#fff" : "#666",
                          fontWeight: 600,
                          fontSize: isMobile ? 11 : 11,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          userSelect: "none",
                          position: "sticky",
                          top: 0,
                          ...(isSticky && isMobile
                            ? { left: 0, zIndex: 3, background: "#000", boxShadow: "2px 0 4px rgba(0,0,0,0.5)" }
                            : { zIndex: 1, background: "#000" }),
                          minWidth: COL_MIN_WIDTH[col.key] || 60,
                        }}
                      >
                        {col.label}
                        {COLUMN_TOOLTIPS[col.key] && !isMobile && (
                          <span
                            title={COLUMN_TOOLTIPS[col.key]}
                            style={{ marginLeft: 3, fontSize: 9, color: "#555", cursor: "help", verticalAlign: "super" }}
                          >
                            ?
                          </span>
                        )}
                        {sortCol === col.key && (
                          <span style={{ marginLeft: 4, fontSize: 10 }}>
                            {sortDir === "desc" ? "▼" : "▲"}
                          </span>
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => {
                  const grade = getGrade(s.ai_score)
                  const gc = GRADE_COLORS[grade]
                  const naverUrl = `https://finance.naver.com/item/main.naver?code=${s.code}`

                  return (
                    <tr
                      key={s.code}
                      onClick={() => window.open(naverUrl, "_blank")}
                      style={{ cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#111")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Name column - sticky on mobile */}
                      <td
                        style={{
                          padding: cellPad,
                          borderBottom: "1px solid #111",
                          minWidth: COL_MIN_WIDTH.name,
                          ...(isMobile
                            ? { position: "sticky", left: 0, background: "#000", zIndex: 2, boxShadow: "2px 0 4px rgba(0,0,0,0.5)" }
                            : {}),
                        }}
                      >
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: isMobile ? 12 : undefined }}>{s.name}</div>
                        <div style={{ fontSize: isMobile ? 10 : 11, color: "#555" }}>
                          {s.code}
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 9,
                              padding: "1px 5px",
                              borderRadius: 3,
                              background: s.market === "KOSPI" ? "#1a2a3a" : "#2a1a3a",
                              color: s.market === "KOSPI" ? "#60a5fa" : "#c084fc",
                            }}
                          >
                            {s.market}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: cellPad, borderBottom: "1px solid #111", textAlign: "right", minWidth: COL_MIN_WIDTH.ai_score }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            background: gc.bg,
                            color: gc.text,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {grade} {s.ai_score}
                        </span>
                      </td>
                      <td style={{ padding: cellPad, borderBottom: "1px solid #111", textAlign: "right", color: "#ccc", fontVariantNumeric: "tabular-nums", minWidth: COL_MIN_WIDTH.per }}>
                        {formatNum(s.per)}
                      </td>
                      <td style={{ padding: cellPad, borderBottom: "1px solid #111", textAlign: "right", color: "#ccc", fontVariantNumeric: "tabular-nums", minWidth: COL_MIN_WIDTH.pbr }}>
                        {formatNum(s.pbr)}
                      </td>
                      <td
                        style={{
                          padding: cellPad,
                          borderBottom: "1px solid #111",
                          textAlign: "right",
                          color: s.roe && s.roe > 0 ? "#4ade80" : s.roe && s.roe < 0 ? "#f87171" : "#666",
                          fontVariantNumeric: "tabular-nums",
                          minWidth: COL_MIN_WIDTH.roe,
                        }}
                      >
                        {formatNum(s.roe)}
                      </td>
                      <td
                        style={{
                          padding: cellPad,
                          borderBottom: "1px solid #111",
                          textAlign: "right",
                          color: s.dividend_yield && s.dividend_yield >= 3 ? "#4ade80" : "#ccc",
                          fontVariantNumeric: "tabular-nums",
                          minWidth: COL_MIN_WIDTH.dividend_yield,
                        }}
                      >
                        {formatNum(s.dividend_yield)}
                      </td>
                      <td style={{ padding: cellPad, borderBottom: "1px solid #111", textAlign: "right", color: "#ccc", fontVariantNumeric: "tabular-nums", minWidth: COL_MIN_WIDTH.market_cap }}>
                        {formatMarketCap(s.market_cap)}
                      </td>
                      <td style={{ padding: cellPad, borderBottom: "1px solid #111", textAlign: "right", color: "#fff", fontWeight: 500, fontVariantNumeric: "tabular-nums", minWidth: COL_MIN_WIDTH.price }}>
                        {s.price ? s.price.toLocaleString() : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {stocks.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
              <p style={{ fontSize: 14 }}>{t.noResultText}</p>
            </div>
          )}
        </>
      )}

      {/* AI Score Guide */}
      <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: isMobile ? 24 : 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          {t.scoreGuideTitle}
        </p>
        <p style={{ fontSize: isMobile ? 12 : 13, color: "#888", lineHeight: 1.8, marginBottom: 16 }}>
          {t.scoreGuideDesc}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { g: "S", label: "80+" },
            { g: "A", label: "65-79" },
            { g: "B", label: "50-64" },
            { g: "C", label: "35-49" },
            { g: "D", label: "0-34" },
          ].map(({ g, label }) => {
            const gc = GRADE_COLORS[g]
            return (
              <span key={g} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: gc.bg }}>
                <span style={{ fontWeight: 700, color: gc.text, fontSize: 13 }}>{g}</span>
                <span style={{ color: "#888", fontSize: 11 }}>{label}</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* Kakao Share */}
      <div style={{ marginBottom: 24, display: "flex", gap: 8 }}>
        <button
          onClick={() => shareScreener()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: isMobile ? "10px 18px" : "8px 16px",
            background: "#FEE500",
            color: "#000",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          <span style={{ fontSize: 16 }}>&#x1F4E2;</span> {locale === "ko" ? "카카오톡 공유" : "Share on KakaoTalk"}
        </button>
      </div>

      {/* Newsletter CTA */}
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 12,
          padding: isMobile ? 20 : 28,
          marginBottom: isMobile ? 24 : 32,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p style={{ fontSize: 13, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.nlCtaDesc}</p>
        <p style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{t.nlCtaTitle}</p>
        <a
          href={locale === "ko" ? "/ko#newsletter" : "/#newsletter"}
          style={{
            display: "inline-block",
            padding: isMobile ? "12px 24px" : "10px 24px",
            background: "#fff",
            color: "#000",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            alignSelf: "flex-start",
            marginTop: 4,
            minHeight: 44,
            lineHeight: "20px",
          }}
        >
          {t.nlCtaBtn} →
        </a>
      </div>

      {/* Ad slot */}
      <AdSlot slot="6789012345" format="auto" responsive />
    </div>
  )
}
