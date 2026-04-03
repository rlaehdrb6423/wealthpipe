"use client"

import { useAuth } from "@/components/AuthProvider"
import { useCallback, useEffect, useState } from "react"

interface WatchlistButtonProps {
  code: string
  name: string
}

export default function WatchlistButton({ code, name }: WatchlistButtonProps) {
  const { user, loading } = useAuth()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [busy, setBusy] = useState(false)
  const [tooltip, setTooltip] = useState("")

  const checkWatchlist = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch("/api/watchlist")
      if (!res.ok) return
      const data = await res.json()
      const codes: string[] = (data.watchlist ?? []).map(
        (item: { stock_code: string }) => item.stock_code
      )
      setInWatchlist(codes.includes(code))
    } catch {
      // silently fail
    }
  }, [user, code])

  useEffect(() => {
    if (!loading && user) {
      checkWatchlist()
    }
  }, [loading, user, checkWatchlist])

  async function handleClick() {
    if (!user) {
      setTooltip("로그인 필요")
      setTimeout(() => setTooltip(""), 2000)
      return
    }

    setBusy(true)
    try {
      if (inWatchlist) {
        const res = await fetch("/api/watchlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockCode: code }),
        })
        if (res.ok) setInWatchlist(false)
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockCode: code }),
        })
        if (res.ok) setInWatchlist(true)
      }
    } catch {
      // silently fail
    } finally {
      setBusy(false)
    }
  }

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={handleClick}
        disabled={busy || loading}
        title={name}
        aria-label={inWatchlist ? `Remove ${name} from watchlist` : `Add ${name} to watchlist`}
        style={{
          background: "transparent",
          border: "none",
          cursor: busy || loading ? "not-allowed" : "pointer",
          fontSize: 18,
          lineHeight: 1,
          padding: "4px",
          color: inWatchlist ? "#facc15" : "#555",
          opacity: busy ? 0.5 : 1,
          transition: "color 0.15s",
        }}
      >
        {inWatchlist ? "\u2605" : "\u2606"}
      </button>
      {tooltip && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#f87171",
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {tooltip}
        </span>
      )}
    </span>
  )
}
