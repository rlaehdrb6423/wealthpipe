import type { Metadata } from "next"
import { Suspense } from "react"
import RankingPage from "@/app/tools/ranking/RankingPage"
import { getTexts } from "@/lib/i18n"

const t = getTexts("ko").ranking
const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: t.ogTitle,
  description: t.ogDesc,
  alternates: {
    canonical: `${SITE_URL}/ko/tools/ranking`,
    languages: {
      en: `${SITE_URL}/tools/ranking`,
      ko: `${SITE_URL}/ko/tools/ranking`,
    },
  },
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    url: `${SITE_URL}/ko/tools/ranking`,
    locale: "ko_KR",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "WealthPipe 주간 키워드 랭킹",
  description: "이번 주 WealthPipe에서 가장 많이 분석된 키워드 TOP 20",
  url: `${SITE_URL}/ko/tools/ranking`,
}

export default function KoRankingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <RankingPage locale="ko" />
      </Suspense>
    </>
  )
}
