import type { Metadata } from "next"
import { Suspense } from "react"
import NewsDigest from "./NewsDigest"
import { getTexts } from "@/lib/i18n"

const t = getTexts("en").news
const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: t.ogTitle,
  description: t.ogDesc,
  alternates: {
    canonical: `${SITE_URL}/tools/news`,
    languages: { en: `${SITE_URL}/tools/news`, ko: `${SITE_URL}/ko/tools/news` },
  },
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    url: `${SITE_URL}/tools/news`,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe Economic News Digest",
  url: `${SITE_URL}/tools/news`,
  applicationCategory: "Finance",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "AI-curated daily economic news digest. Stocks, real estate, FX, interest rates, and crypto — all in one place.",
  inLanguage: ["en", "ko"],
}

export default function NewsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <NewsDigest locale="en" />
      </Suspense>
    </>
  )
}
