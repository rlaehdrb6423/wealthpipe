import type { Metadata } from "next"
import { Suspense } from "react"
import KeywordAnalyzer from "@/app/tools/keyword/KeywordAnalyzer"
import { getTexts } from "@/lib/i18n"

const t = getTexts("ko").keyword
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
        canonical: `${SITE_URL}/ko/tools/keyword`,
        languages: { en: `${SITE_URL}/tools/keyword`, ko: `${SITE_URL}/ko/tools/keyword` },
      },
      openGraph: {
        title: t.ogTitle,
        description: t.ogDesc,
        url: `${SITE_URL}/ko/tools/keyword`,
        locale: "ko_KR",
      },
    }
  }

  const ogUrl = `${SITE_URL}/api/og?keyword=${encodeURIComponent(keyword)}`

  return {
    title: `"${keyword}" ${t.ogTitleWithKeyword} - WealthPipe`,
    description: `"${keyword}" ${t.ogDescWithKeyword}`,
    alternates: {
      canonical: `${SITE_URL}/ko/tools/keyword?q=${encodeURIComponent(keyword)}`,
      languages: { en: `${SITE_URL}/tools/keyword?q=${encodeURIComponent(keyword)}`, ko: `${SITE_URL}/ko/tools/keyword?q=${encodeURIComponent(keyword)}` },
    },
    openGraph: {
      title: `"${keyword}" ${t.ogTitleWithKeyword}`,
      description: `"${keyword}" ${t.ogDescWithKeyword}`,
      url: `${SITE_URL}/ko/tools/keyword?q=${encodeURIComponent(keyword)}`,
      locale: "ko_KR",
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
  name: "WealthPipe 키워드 분석기",
  url: `${SITE_URL}/ko/tools/keyword`,
  applicationCategory: "SEO Tool",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  description:
    "무료 네이버 키워드 분석기 — 검색량, 경쟁도, 수익성, AI 블로그 글 구조 추천까지 한 번에.",
  inLanguage: ["ko", "en"],
}

export default function KoKeywordPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <KeywordAnalyzer locale="ko" />
      </Suspense>
    </>
  )
}
