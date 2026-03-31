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

export default function KoKeywordPage() {
  return (
    <Suspense>
      <KeywordAnalyzer locale="ko" />
    </Suspense>
  )
}
