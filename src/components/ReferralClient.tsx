"use client"

import { useAuth } from "@/components/AuthProvider"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

interface ReferralData {
  referralCode: string
  referralLink: string
  totalReferrals: number
  completedReferrals: number
  bonusAnalyses: number
}

export default function ReferralClient() {
  const { user, loading } = useAuth()
  const [data, setData] = useState<ReferralData | null>(null)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState("")

  // Enter referral code
  const [inputCode, setInputCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState("")
  const [submitError, setSubmitError] = useState("")

  // Copy feedback
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const fetchReferral = useCallback(async () => {
    setFetching(true)
    setError("")
    try {
      const res = await fetch("/api/referral")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to load referral data")
      }
      const json: ReferralData = await res.json()
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchReferral()
    }
  }, [user, fetchReferral])

  async function copyText(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // fallback
    }
  }

  async function handleSubmitCode() {
    if (!inputCode.trim()) return
    setSubmitting(true)
    setSubmitMsg("")
    setSubmitError("")
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: inputCode.trim() }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body.error || "추천 코드 적용에 실패했습니다.")
      }
      setSubmitMsg(body.message || "추천인 보너스가 지급되었습니다!")
      setInputCode("")
      // Refresh stats
      fetchReferral()
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- Not logged in ----------
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
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
          borderRadius: 16,
          padding: 40,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 18, marginBottom: 16, color: "#ccc" }}>
          로그인 후 이용 가능합니다
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "#22c55e",
            color: "#000",
            fontWeight: 700,
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          로그인하기
        </Link>
      </div>
    )
  }

  // ---------- Loading / Error ----------
  if (fetching && !data) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
        추천 정보를 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
          color: "#f87171",
        }}
      >
        {error}
      </div>
    )
  }

  if (!data) return null

  // ---------- Main UI ----------
  const cardStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  }

  const copyBtnStyle: React.CSSProperties = {
    background: "#222",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#ccc",
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }

  return (
    <div>
      {/* My Referral Code */}
      <div style={cardStyle}>
        <p
          style={{
            color: "#888",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          내 추천 코드
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 3,
              color: "#22c55e",
              fontFamily: "monospace",
            }}
          >
            {data.referralCode}
          </span>
          <button
            type="button"
            style={copyBtnStyle}
            onClick={() => copyText(data.referralCode, "code")}
          >
            {copiedField === "code" ? "복사됨!" : "복사"}
          </button>
        </div>

        <p
          style={{
            color: "#888",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          추천 링크
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <code
            style={{
              flex: 1,
              background: "#0a0a0a",
              border: "1px solid #222",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "#ccc",
              wordBreak: "break-all",
            }}
          >
            {data.referralLink}
          </code>
          <button
            type="button"
            style={copyBtnStyle}
            onClick={() => copyText(data.referralLink, "link")}
          >
            {copiedField === "link" ? "복사됨!" : "복사"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ ...cardStyle, textAlign: "center", marginBottom: 0 }}>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
            총 추천 수
          </p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>
            {data.totalReferrals}
          </p>
        </div>
        <div style={{ ...cardStyle, textAlign: "center", marginBottom: 0 }}>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
            획득한 보너스 분석
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#22c55e" }}>
            {data.bonusAnalyses}회
          </p>
        </div>
      </div>

      {/* How it works */}
      <div style={cardStyle}>
        <p
          style={{
            color: "#888",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          이용 방법
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              step: "1",
              title: "추천 링크 공유",
              desc: "위의 추천 링크를 친구에게 공유하세요.",
            },
            {
              step: "2",
              title: "친구가 가입",
              desc: "친구가 링크를 통해 가입하고 추천 코드를 입력합니다.",
            },
            {
              step: "3",
              title: "보너스 지급",
              desc: "나와 친구 모두 무료 분석 5회를 받습니다!",
            },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#22c55e22",
                  color: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {item.step}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {item.title}
                </p>
                <p style={{ color: "#888", fontSize: 13 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enter referral code */}
      <div style={cardStyle}>
        <p
          style={{
            color: "#888",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          추천 코드 입력
        </p>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 12 }}>
          추천을 받았다면 아래에 추천 코드를 입력하세요.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="추천 코드를 입력하세요"
            maxLength={20}
            style={{
              flex: 1,
              background: "#0a0a0a",
              border: "1px solid #222",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 14,
              color: "#fff",
              outline: "none",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitCode()
            }}
          />
          <button
            type="button"
            disabled={submitting || !inputCode.trim()}
            onClick={handleSubmitCode}
            style={{
              background: "#22c55e",
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting || !inputCode.trim() ? 0.5 : 1,
            }}
          >
            {submitting ? "처리 중..." : "적용"}
          </button>
        </div>
        {submitMsg && (
          <p style={{ color: "#22c55e", fontSize: 13, marginTop: 10 }}>
            {submitMsg}
          </p>
        )}
        {submitError && (
          <p style={{ color: "#f87171", fontSize: 13, marginTop: 10 }}>
            {submitError}
          </p>
        )}
      </div>
    </div>
  )
}
