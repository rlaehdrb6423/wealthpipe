import type { Metadata } from "next"
import { Suspense } from "react"
import FactorScreener from "./FactorScreener"
import { getTexts } from "@/lib/i18n"

const t = getTexts("en").screener
const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: t.ogTitle,
  description: t.ogDesc,
  alternates: {
    canonical: `${SITE_URL}/tools/screener`,
    languages: { en: `${SITE_URL}/tools/screener`, ko: `${SITE_URL}/ko/tools/screener` },
  },
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    url: `${SITE_URL}/tools/screener`,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe KRX Factor Screener",
  url: `${SITE_URL}/tools/screener`,
  applicationCategory: "Finance",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "AI-scored KRX stock screener — filter KOSPI and KOSDAQ stocks by PER, PBR, ROE, dividend yield, and AI factor score.",
  inLanguage: ["en", "ko"],
}

export default function ScreenerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <FactorScreener locale="en" />
      </Suspense>
    </>
  )
}
