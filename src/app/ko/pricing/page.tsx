import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import PricingClient from "../../pricing/PricingClient"

const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: "요금제 — WealthPipe",
  description: "Free, Pro, Business 플랜을 비교하세요. 무제한 키워드 분석, AI 글 구조 추천 등 WealthPipe Pro의 모든 기능.",
  alternates: {
    canonical: `${SITE_URL}/ko/pricing`,
    languages: {
      en: `${SITE_URL}/pricing`,
      ko: `${SITE_URL}/ko/pricing`,
    },
  },
  openGraph: {
    locale: "ko_KR",
  },
}

const features = [
  { name: "키워드 분석", free: "5회/일", pro: "무제한", business: "무제한" },
  { name: "AI 글 구조 추천", free: "3회/일", pro: "무제한", business: "무제한" },
  { name: "검색 트렌드 차트", free: "✓", pro: "✓", business: "✓" },
  { name: "키워드 비교 분석", free: "1회/일", pro: "무제한", business: "무제한" },
  { name: "키워드 히스토리", free: "—", pro: "✓", business: "✓" },
  { name: "CSV 내보내기", free: "—", pro: "✓", business: "✓" },
  { name: "API 접근", free: "—", pro: "—", business: "✓" },
  { name: "키워드 알림", free: "—", pro: "—", business: "✓" },
  { name: "전용 지원", free: "—", pro: "—", business: "✓" },
  { name: "우선 지원", free: "—", pro: "✓", business: "✓" },
]

export default function KoPricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Link href="/ko" style={{ color: "#666", fontSize: 14, textDecoration: "none" }}>
            ← WealthPipe
          </Link>
          <Link href="/pricing" style={{ color: "#666", fontSize: 13, textDecoration: "none", border: "1px solid #333", padding: "4px 12px", borderRadius: 6 }}>
            English
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>심플하고 투명한 요금제</h1>
          <p style={{ color: "#888", fontSize: 16 }}>무료로 시작하세요. 더 필요할 때 업그레이드.</p>
        </div>

        {/* Success/Cancel banners */}
        <Suspense>
          <PricingClient locale="ko" showBanners />
        </Suspense>

        {/* Plan Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 48 }}>
          {/* Free */}
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: 28 }}>
            <p style={{ color: "#888", fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>FREE</p>
            <p style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>₩0</p>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>영원히 무료</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", color: "#888", fontSize: 13, lineHeight: 1.8 }}>
              <li>키워드 분석 5회/일</li>
              <li>AI 글 구조 추천 3회/일</li>
              <li>검색 트렌드 차트</li>
            </ul>
            <Link
              href="/ko/tools/keyword"
              style={{
                display: "block", textAlign: "center", padding: "12px", background: "#111",
                border: "1px solid #333", borderRadius: 8, color: "#ccc", fontSize: 14,
                fontWeight: 600, textDecoration: "none",
              }}
            >
              무료로 시작 →
            </Link>
          </div>

          {/* Pro */}
          <div style={{ background: "#0a0a0a", border: "2px solid #22c55e33", borderRadius: 16, padding: 28, position: "relative" }}>
            <div style={{
              position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
              background: "#22c55e", color: "#000", padding: "4px 16px", borderRadius: 20,
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
            }}>
              인기
            </div>
            <p style={{ color: "#22c55e", fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>PRO</p>
            <p style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
              ₩9,900<span style={{ fontSize: 16, color: "#666", fontWeight: 400 }}>/월</span>
            </p>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>또는 $9.99/mo</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", color: "#ccc", fontSize: 13, lineHeight: 1.8 }}>
              <li>키워드 분석 무제한</li>
              <li>AI 글 구조 추천 무제한</li>
              <li>키워드 히스토리</li>
              <li>CSV 내보내기</li>
              <li>우선 지원</li>
            </ul>
            <Suspense fallback={<div style={{ height: 44 }} />}>
              <PricingClient locale="ko" plan="pro" />
            </Suspense>
          </div>

          {/* Business */}
          <div style={{ background: "#0a0a0a", border: "2px solid #a855f733", borderRadius: 16, padding: 28 }}>
            <p style={{ color: "#a855f7", fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>BUSINESS</p>
            <p style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
              ₩29,900<span style={{ fontSize: 16, color: "#666", fontWeight: 400 }}>/월</span>
            </p>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>또는 $29.99/mo</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", color: "#ccc", fontSize: 13, lineHeight: 1.8 }}>
              <li>Pro의 모든 기능</li>
              <li>API 접근</li>
              <li>CSV 내보내기</li>
              <li>커스텀 키워드 알림</li>
              <li>전용 지원</li>
            </ul>
            <Suspense fallback={<div style={{ height: 44 }} />}>
              <PricingClient locale="ko" plan="business" />
            </Suspense>
          </div>
        </div>

        {/* Feature Comparison */}
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>기능 비교</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #222" }}>
                <th style={{ padding: "12px 0", textAlign: "left", color: "#888", fontSize: 13 }}>기능</th>
                <th style={{ padding: "12px 0", textAlign: "center", color: "#888", fontSize: 13 }}>Free</th>
                <th style={{ padding: "12px 0", textAlign: "center", color: "#22c55e", fontSize: 13, fontWeight: 700 }}>Pro</th>
                <th style={{ padding: "12px 0", textAlign: "center", color: "#a855f7", fontSize: 13, fontWeight: 700 }}>Business</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} style={{ borderBottom: "1px solid #111" }}>
                  <td style={{ padding: "14px 0", fontSize: 14 }}>{f.name}</td>
                  <td style={{ padding: "14px 0", textAlign: "center", color: "#888", fontSize: 14 }}>{f.free}</td>
                  <td style={{ padding: "14px 0", textAlign: "center", color: "#22c55e", fontSize: 14, fontWeight: 600 }}>{f.pro}</td>
                  <td style={{ padding: "14px 0", textAlign: "center", color: "#a855f7", fontSize: 14, fontWeight: 600 }}>{f.business}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
