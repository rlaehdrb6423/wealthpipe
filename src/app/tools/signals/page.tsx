import type { Metadata } from "next"
import { Suspense } from "react"
import SignalTracker from "./SignalTracker"
import { getTexts } from "@/lib/i18n"

const t = getTexts("en").signals
const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: t.ogTitle,
  description: t.ogDesc,
  alternates: {
    canonical: `${SITE_URL}/tools/signals`,
    languages: { en: `${SITE_URL}/tools/signals`, ko: `${SITE_URL}/ko/tools/signals` },
  },
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    url: `${SITE_URL}/tools/signals`,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe Asset Signal Tracker",
  url: `${SITE_URL}/tools/signals`,
  applicationCategory: "Finance",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "AI-powered daily market signals for KOSPI, S&P 500, NASDAQ, Bitcoin, Gold, and USD/KRW.",
  inLanguage: ["en", "ko"],
}

export default function SignalsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <SignalTracker locale="en" />
      </Suspense>
    </>
  )
}
