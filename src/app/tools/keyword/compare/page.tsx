import type { Metadata } from "next"
import { Suspense } from "react"
import KeywordCompare from "./KeywordCompare"

const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: "Keyword Comparison — WealthPipe",
  description: "Compare 2-3 keywords side by side. Search volume, competition, profitability, and opportunity score at a glance.",
  alternates: {
    canonical: `${SITE_URL}/tools/keyword/compare`,
    languages: {
      en: `${SITE_URL}/tools/keyword/compare`,
      ko: `${SITE_URL}/ko/tools/keyword/compare`,
    },
  },
  openGraph: {
    title: "Keyword Comparison — WealthPipe",
    description: "Compare keywords side by side — volume, competition, profit, opportunity score.",
    url: `${SITE_URL}/tools/keyword/compare`,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe Keyword Comparison",
  url: `${SITE_URL}/tools/keyword/compare`,
  applicationCategory: "SEO Tool",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  description: "Compare 2-3 keywords side by side with search volume, competition, and opportunity score.",
}

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <KeywordCompare locale="en" />
      </Suspense>
    </>
  )
}
