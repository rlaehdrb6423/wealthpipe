"use client"

import { useAuth } from "@/components/AuthProvider"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

interface WatchlistItem {
  stock_code: string
  created_at: string
  name?: string
  market?: string
}

export default function WatchlistClient() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [addCode, setAddCode] = useState("")
  const [adding, setAdding] = useState(false)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)

  const fetchWatchlist = useCallback(async () => {
    setFetching(true)
    setError("")
    try {
      const res = await fetch("/api/watchlist")
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to load watchlist")
        setItems([])
        return
      }
      const data = await res.json()
      setItems(data.watchlist ?? [])
    } catch {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && user) {
      fetchWatchlist()
    } else if (!loading && !user) {
      setFetching(false)
    }
  }, [loading, user, fetchWatchlist])

  async function handleAdd() {
    const code = addCode.trim()
    if (!code) return
    setAdding(true)
    setError("")
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockCode: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "추가 실패")
      } else {
        setAddCode("")
        await fetchWatchlist()
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(stockCode: string) {
    setDeletingCode(stockCode)
    setError("")
    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockCode }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "삭제 실패")
      } else {
        setItems((prev) => prev.filter((item) => item.stock_code !== stockCode))
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setDeletingCode(null)
    }
  }

  if (loading) {
    return (
      <div style={{ color: "#666", fontSize: 14, padding: "40px 0", textAlign: "center" }}>
        로딩 중...
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 12,
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 16, marginBottom: 16 }}>로그인 후 이용 가능</p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "#22c55e",
            color: "#000",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          로그인 →
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Add stock input */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <input
          type="text"
          placeholder="종목 코드 입력 (예: 005930)"
          value={addCode}
          onChange={(e) => setAddCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd()
          }}
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "#111",
            border: "1px solid #222",
            borderRadius: 8,
            color: "#fff",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !addCode.trim()}
          style={{
            padding: "10px 20px",
            background: adding ? "#1a1a1a" : "#22c55e",
            color: adding ? "#666" : "#000",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: adding ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {adding ? "추가 중..." : "추가"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#1a0000",
            border: "1px solid #3a1111",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#f87171",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Count */}
      <p style={{ color: "#666", fontSize: 13, marginBottom: 12 }}>
        총 {items.length}개 종목
      </p>

      {fetching ? (
        <div style={{ color: "#666", fontSize: 14, padding: "40px 0", textAlign: "center" }}>
          불러오는 중...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: 12,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 15, color: "#888", marginBottom: 16 }}>
            아직 관심종목이 없습니다. 스크리너에서 종목을 추가해보세요!
          </p>
          <Link
            href="/tools/screener"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "#111",
              border: "1px solid #333",
              color: "#ccc",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            스크리너 바로가기 →
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0d0d0d" }}>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    color: "#888",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  종목코드
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    color: "#888",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  종목명
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    color: "#888",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  시장
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    color: "#888",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  추가일
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    color: "#888",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  삭제
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.stock_code}
                  style={{ borderBottom: "1px solid #1a1a1a" }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.background = "#151515"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.background = "transparent"
                  }}
                >
                  <td style={{ padding: "12px 16px", fontSize: 14, fontFamily: "monospace", color: "#ccc" }}>
                    {item.stock_code}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#fff" }}>
                    {item.name || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#888" }}>
                    {item.market || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#666" }}>
                    {new Date(item.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(item.stock_code)}
                      disabled={deletingCode === item.stock_code}
                      style={{
                        padding: "4px 12px",
                        background: "transparent",
                        border: "1px solid #333",
                        borderRadius: 6,
                        color: deletingCode === item.stock_code ? "#444" : "#f87171",
                        fontSize: 12,
                        cursor: deletingCode === item.stock_code ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingCode === item.stock_code ? "..." : "삭제"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
