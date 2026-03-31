import type { Metadata } from "next"
import { Suspense } from "react"
import { getServiceClient } from "@/lib/supabase"
import KeywordAnalyzer from "@/app/tools/keyword/KeywordAnalyzer"

const SITE_URL = "https://wealthpipe.net"

type Props = {
  params: Promise<{ keyword: string }>
}

async function getCachedKeyword(keyword: string) {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("keyword_cache")
    .select("data")
    .eq("keyword", keyword)
    .single()
  return data?.data as Record<string, unknown> | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword: rawKeyword } = await params
  const keyword = decodeURIComponent(rawKeyword)
  const cached = await getCachedKeyword(keyword)

  const title = `"${keyword}" 키워드 분석 — WealthPipe`
  const description = cached
    ? `"${keyword}" — 월간 검색량: ${(cached.totalVolume as number)?.toLocaleString()}, 경쟁도: ${cached.competitionLabel}, 기회점수: ${cached.opportunityScore}/100`
    : `"${keyword}" 무료 키워드 분석 — 검색량, 경쟁도, 수익성을 한 번에 확인하세요.`

  const ogParams = cached
    ? `keyword=${encodeURIComponent(keyword)}&volume=${cached.totalVolume}&competition=${cached.competitionLabel}&cg=${cached.competitionGrade}&profit=${cached.profitLabel}&pg=${cached.profitGrade}&score=${cached.opportunityScore}`
    : `keyword=${encodeURIComponent(keyword)}`
  const ogUrl = `${SITE_URL}/api/og?${ogParams}`

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/ko/tools/keyword/${encodeURIComponent(keyword)}`,
      languages: {
        en: `${SITE_URL}/tools/keyword/${encodeURIComponent(keyword)}`,
        ko: `${SITE_URL}/ko/tools/keyword/${encodeURIComponent(keyword)}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/ko/tools/keyword/${encodeURIComponent(keyword)}`,
      locale: "ko_KR",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [ogUrl],
    },
  }
}

export default async function KoKeywordPermalinkPage({ params }: Props) {
  const { keyword: rawKeyword } = await params
  const keyword = decodeURIComponent(rawKeyword)
  const cached = await getCachedKeyword(keyword)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `"${keyword}" 키워드 분석 — WealthPipe`,
    url: `${SITE_URL}/ko/tools/keyword/${encodeURIComponent(keyword)}`,
    applicationCategory: "SEO Tool",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    description: cached
      ? `"${keyword}" 분석 — 검색량 ${(cached.totalVolume as number)?.toLocaleString()}, 경쟁도 ${cached.competitionLabel}, 기회점수 ${cached.opportunityScore}/100`
      : `"${keyword}" 무료 키워드 분석`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <KeywordAnalyzer locale="ko" initialKeyword={keyword} />
      </Suspense>
    </>
  )
}
