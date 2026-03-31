import type { Metadata } from "next"
import { Suspense } from "react"
import KeywordCompare from "@/app/tools/keyword/compare/KeywordCompare"

const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: "키워드 비교 분석 — WealthPipe",
  description: "2~3개 키워드를 나란히 비교하세요. 검색량, 경쟁도, 수익성, 기회점수를 한 눈에 확인.",
  alternates: {
    canonical: `${SITE_URL}/ko/tools/keyword/compare`,
    languages: {
      en: `${SITE_URL}/tools/keyword/compare`,
      ko: `${SITE_URL}/ko/tools/keyword/compare`,
    },
  },
  openGraph: {
    title: "키워드 비교 분석 — WealthPipe",
    description: "2~3개 키워드를 나란히 비교 — 검색량, 경쟁도, 수익성, 기회점수.",
    url: `${SITE_URL}/ko/tools/keyword/compare`,
    locale: "ko_KR",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe 키워드 비교 분석",
  url: `${SITE_URL}/ko/tools/keyword/compare`,
  applicationCategory: "SEO Tool",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  description: "2~3개 키워드를 나란히 비교 — 검색량, 경쟁도, 수익성, 기회점수를 한 눈에.",
}

export default function KoComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <KeywordCompare locale="ko" />
      </Suspense>
    </>
  )
}
