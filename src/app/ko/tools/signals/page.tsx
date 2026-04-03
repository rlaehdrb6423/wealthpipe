import type { Metadata } from "next"
import { Suspense } from "react"
import SignalTracker from "@/app/tools/signals/SignalTracker"
import { getTexts } from "@/lib/i18n"

const t = getTexts("ko").signals
const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: t.ogTitle,
  description: t.ogDesc,
  alternates: {
    canonical: `${SITE_URL}/ko/tools/signals`,
    languages: { en: `${SITE_URL}/tools/signals`, ko: `${SITE_URL}/ko/tools/signals` },
  },
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    url: `${SITE_URL}/ko/tools/signals`,
    locale: "ko_KR",
    images: [{ url: `${SITE_URL}/api/og/signals`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: t.ogTitle,
    description: t.ogDesc,
    images: [`${SITE_URL}/api/og/signals`],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe 자산 시그널 트래커",
  url: `${SITE_URL}/ko/tools/signals`,
  applicationCategory: "Finance",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  description:
    "코스피, S&P 500, 나스닥, 비트코인, 금, 원달러 환율 — AI 시그널을 매일 분석합니다.",
  inLanguage: ["ko", "en"],
}

export default function KoSignalsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <SignalTracker locale="ko" />
      </Suspense>
    </>
  )
}
