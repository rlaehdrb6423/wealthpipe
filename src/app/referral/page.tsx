import type { Metadata } from "next"
import Link from "next/link"
import ReferralClient from "@/components/ReferralClient"

const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: "추천인 프로그램 — WealthPipe",
  description:
    "친구를 추천하고 무료 분석 보너스를 받으세요. Refer friends and earn bonus analyses on WealthPipe.",
  alternates: {
    canonical: `${SITE_URL}/referral`,
  },
}

export default function ReferralPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "80px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Link
            href="/"
            style={{ color: "#666", fontSize: 14, textDecoration: "none" }}
          >
            ← WealthPipe
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            추천인 프로그램
          </h1>
          <p style={{ color: "#888", fontSize: 16, lineHeight: 1.6 }}>
            친구를 추천하면 나도, 친구도 <strong style={{ color: "#22c55e" }}>무료 분석 5회</strong>를 받아요.
            <br />
            Refer a friend — you both get 5 bonus analyses.
          </p>
        </div>

        <ReferralClient />
      </div>
    </div>
  )
}
