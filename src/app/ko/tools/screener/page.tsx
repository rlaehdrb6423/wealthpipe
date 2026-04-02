import type { Metadata } from "next"
import { Suspense } from "react"
import FactorScreener from "@/app/tools/screener/FactorScreener"
import { getTexts } from "@/lib/i18n"

const t = getTexts("ko").screener
const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: t.ogTitle,
  description: t.ogDesc,
  alternates: {
    canonical: `${SITE_URL}/ko/tools/screener`,
    languages: { en: `${SITE_URL}/tools/screener`, ko: `${SITE_URL}/ko/tools/screener` },
  },
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    url: `${SITE_URL}/ko/tools/screener`,
    locale: "ko_KR",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe KRX 팩터 스크리너",
  url: `${SITE_URL}/ko/tools/screener`,
  applicationCategory: "Finance",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  description:
    "KOSPI·KOSDAQ 전종목 PER, PBR, ROE, 배당수익률을 AI가 분석합니다. 무료 팩터 스크리너.",
  inLanguage: ["en", "ko"],
}

export default function ScreenerPageKo() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <FactorScreener locale="ko" />
      </Suspense>
    </>
  )
}
