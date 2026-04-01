import type { Metadata } from "next"
import { Suspense } from "react"
import RankingPage from "./RankingPage"
import { getTexts } from "@/lib/i18n"

const t = getTexts("en").ranking
const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: t.ogTitle,
  description: t.ogDesc,
  alternates: {
    canonical: `${SITE_URL}/tools/ranking`,
    languages: {
      en: `${SITE_URL}/tools/ranking`,
      ko: `${SITE_URL}/ko/tools/ranking`,
    },
  },
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    url: `${SITE_URL}/tools/ranking`,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "WealthPipe Weekly Keyword Ranking",
  description: "Top 20 most analyzed keywords this week on WealthPipe",
  url: `${SITE_URL}/tools/ranking`,
}

export default function RankingEnPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <RankingPage locale="en" />
      </Suspense>
    </>
  )
}
