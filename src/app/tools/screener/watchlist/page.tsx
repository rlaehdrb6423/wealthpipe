"use client"

import { useState, useEffect } from "react"

interface WatchlistItem {
  stock_code: string
  created_at: string
}

interface StockData {
  code: string
  name: string
  market: string
  price: number | null
  ai_score: number
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [stocks, setStocks] = useState<Map<string, StockData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/watchlist")
        if (res.status === 401) {
          setError("로그인이 필요합니다.")
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error()
        const data = await res.json()
        const watchlist: WatchlistItem[] = data.watchlist || []
        setItems(watchlist)

        if (watchlist.length > 0) {
          const searchResults = await Promise.all(
            watchlist.map(async (w) => {
              const r = await fetch(`/api/screener?endpoint=search&q=${encodeURIComponent(w.stock_code)}`)
              if (!r.ok) return null
              const d = await r.json()
              const stock = d.stocks?.[0]
              return stock ? { code: stock.code, name: stock.name, market: stock.market, price: stock.price, ai_score: stock.ai_score } as StockData : null
            })
          )
          const map = new Map<string, StockData>()
          for (const s of searchResults) {
            if (s) map.set(s.code, s)
          }
          setStocks(map)
        }
      } catch {
        setError("데이터를 불러오지 못했습니다.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const removeItem = async (code: string) => {
    await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockCode: code }),
    })
    setItems((prev) => prev.filter((i) => i.stock_code !== code))
  }

  const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
    S: { bg: "#1a3a2a", text: "#4ade80" },
    A: { bg: "#1a2a3a", text: "#60a5fa" },
    B: { bg: "#2a2a1a", text: "#facc15" },
    C: { bg: "#2a1f1a", text: "#fb923c" },
    D: { bg: "#2a1a1a", text: "#f87171" },
  }

  function getGrade(score: number) {
    if (score >= 80) return "S"
    if (score >= 65) return "A"
    if (score >= 50) return "B"
    if (score >= 35) return "C"
    return "D"
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/tools/screener" style={{ color: "#666", fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 24 }}>
          ← 스크리너로 돌아가기
        </a>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>관심 종목</h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>저장한 종목을 한눈에 확인하세요.</p>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <div style={{ width: 40, height: 40, border: "2px solid #222", borderTop: "2px solid #fff", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
            {error.includes("로그인") && (
              <a href="/login" style={{ display: "inline-block", marginTop: 12, padding: "10px 24px", background: "#fff", color: "#000", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                로그인 →
              </a>
            )}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <p style={{ fontSize: 14 }}>아직 관심 종목이 없습니다.</p>
            <a href="/tools/screener" style={{ display: "inline-block", marginTop: 12, padding: "10px 24px", background: "#fff", color: "#000", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              스크리너에서 추가하기 →
            </a>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item) => {
              const stock = stocks.get(item.stock_code)
              const grade = stock ? getGrade(stock.ai_score) : null
              const gc = grade ? GRADE_COLORS[grade] : null

              return (
                <div
                  key={item.stock_code}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#111", border: "1px solid #222", borderRadius: 12, padding: "14px 18px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{stock?.name || item.stock_code}</span>
                      {stock?.market && (
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: stock.market === "KOSPI" ? "#1a2a3a" : "#2a1a3a", color: stock.market === "KOSPI" ? "#60a5fa" : "#c084fc" }}>
                          {stock.market}
                        </span>
                      )}
                      {gc && grade && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: gc.bg, color: gc.text }}>
                          {grade} {stock!.ai_score}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: "#666" }}>{item.stock_code}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {stock?.price && (
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                        ₩{stock.price.toLocaleString()}
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(item.stock_code)}
                      style={{ background: "none", border: "none", color: "#666", fontSize: 16, cursor: "pointer", padding: 4 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
