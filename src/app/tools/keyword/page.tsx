import type { Metadata } from "next"
import { Suspense } from "react"
import KeywordAnalyzer from "./KeywordAnalyzer"
import { getTexts } from "@/lib/i18n"

const t = getTexts("en").keyword
const SITE_URL = "https://wealthpipe.net"

type Props = {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  const keyword = q?.trim()

  if (!keyword) {
    return {
      title: t.ogTitle,
      description: t.ogDesc,
      alternates: {
        canonical: `${SITE_URL}/tools/keyword`,
        languages: { en: `${SITE_URL}/tools/keyword`, ko: `${SITE_URL}/ko/tools/keyword` },
      },
      openGraph: {
        title: t.ogTitle,
        description: t.ogDesc,
        url: `${SITE_URL}/tools/keyword`,
      },
    }
  }

  const ogUrl = `${SITE_URL}/api/og?keyword=${encodeURIComponent(keyword)}`

  return {
    title: `"${keyword}" ${t.ogTitleWithKeyword} - WealthPipe`,
    description: `"${keyword}" ${t.ogDescWithKeyword}`,
    alternates: {
      canonical: `${SITE_URL}/tools/keyword?q=${encodeURIComponent(keyword)}`,
      languages: { en: `${SITE_URL}/tools/keyword?q=${encodeURIComponent(keyword)}`, ko: `${SITE_URL}/ko/tools/keyword?q=${encodeURIComponent(keyword)}` },
    },
    openGraph: {
      title: `"${keyword}" ${t.ogTitleWithKeyword}`,
      description: `"${keyword}" ${t.ogDescWithKeyword}`,
      url: `${SITE_URL}/tools/keyword?q=${encodeURIComponent(keyword)}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `"${keyword}" ${t.ogTitleWithKeyword} - WealthPipe`,
      images: [ogUrl],
    },
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe Keyword Analyzer",
  url: `${SITE_URL}/tools/keyword`,
  applicationCategory: "SEO Tool",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  description:
    "Free Naver keyword analyzer — search volume, competition grade, profit estimate, and AI blog structure recommendations.",
  inLanguage: ["en", "ko"],
}

export default function KeywordPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <KeywordAnalyzer locale="en" />
      </Suspense>
    </>
  )
}
