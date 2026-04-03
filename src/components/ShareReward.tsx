"use client"

import { useCallback, useEffect, useState } from "react"

interface ShareRewardProps {
  keyword: string
  shareUrl?: string
}

interface ShareResult {
  rewarded: boolean
  message: string
  todayShares: number
  maxShares: number
  bonusAdded?: number
}

const MAX_DAILY = 3

export default function ShareReward({ keyword, shareUrl }: ShareRewardProps) {
  const [todayShares, setTodayShares] = useState<number>(0)
  const [sharing, setSharing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "")
  const remaining = Math.max(0, MAX_DAILY - todayShares)

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  async function recordShare(platform: "kakao" | "twitter" | "copy") {
    setSharing(true)
    try {
      const res = await fetch("/api/share/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, platform }),
      })
      const body: ShareResult = await res.json()

      if (!res.ok) {
        showToast(body.message || "공유 보상 처리에 실패했습니다.", "error")
        return body
      }

      setTodayShares(body.todayShares)
      if (body.rewarded) {
        showToast(`+${body.bonusAdded ?? 3} 무료 분석 추가!`, "success")
      } else {
        showToast(body.message, "error")
      }
      return body
    } catch {
      showToast("오류가 발생했습니다.", "error")
      return null
    } finally {
      setSharing(false)
    }
  }

  async function handleKakao() {
    // Open Kakao share link (fallback: open Kakao talk share URL)
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(url)}`
    window.open(kakaoUrl, "_blank", "width=600,height=400")
    await recordShare("kakao")
  }

  async function handleTwitter() {
    const text = encodeURIComponent(
      `WealthPipe에서 "${keyword}" 키워드를 분석했어요!`
    )
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank", "width=600,height=400")
    await recordShare("twitter")
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback: ignored
    }
    await recordShare("copy")
  }

  // Ensure component is only rendered on client
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null

  const btnBase: React.CSSProperties = {
    flex: 1,
    padding: "10px 0",
    border: "1px solid #333",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: sharing ? "not-allowed" : "pointer",
    opacity: sharing ? 0.5 : 1,
    background: "transparent",
    color: "#ccc",
    textAlign: "center",
  }

  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #222",
        borderRadius: 12,
        padding: 20,
        position: "relative",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: -44,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "success" ? "#22c55e" : "#f87171",
            color: toast.type === "success" ? "#000" : "#fff",
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {toast.msg}
        </div>
      )}

      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 4,
          color: "#fff",
        }}
      >
        공유하고 무료 분석 3회 받기
      </p>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
        오늘 남은 공유 보상: {remaining}/{MAX_DAILY}회
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          disabled={sharing}
          onClick={handleKakao}
          style={{
            ...btnBase,
            borderColor: "#fde04766",
            color: "#fde047",
          }}
        >
          카카오
        </button>
        <button
          type="button"
          disabled={sharing}
          onClick={handleTwitter}
          style={{
            ...btnBase,
            borderColor: "#38bdf866",
            color: "#38bdf8",
          }}
        >
          X (Twitter)
        </button>
        <button
          type="button"
          disabled={sharing}
          onClick={handleCopy}
          style={{
            ...btnBase,
            borderColor: "#a78bfa66",
            color: "#a78bfa",
          }}
        >
          링크 복사
        </button>
      </div>
    </div>
  )
}
