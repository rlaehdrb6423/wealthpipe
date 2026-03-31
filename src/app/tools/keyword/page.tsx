import type { Metadata } from "next"
import { Suspense } from "react"
import KeywordAnalyzer from "./KeywordAnalyzer"

type Props = {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  const keyword = q?.trim()

  if (!keyword) {
    return {
      title: "무료 키워드 분석기 - WealthPipe",
      description: "네이버 검색량, 경쟁도, 수익성을 한눈에 분석하세요. 블로그 수익화를 위한 무료 키워드 분석 도구.",
      openGraph: {
        title: "무료 키워드 분석기 - WealthPipe",
        description: "네이버 검색량, 경쟁도, 수익성을 한눈에 분석하세요.",
        url: "https://wealthpipe.net/tools/keyword",
      },
    }
  }

  const ogUrl = `https://wealthpipe.net/api/og?keyword=${encodeURIComponent(keyword)}`

  return {
    title: `"${keyword}" 키워드 분석 - WealthPipe`,
    description: `"${keyword}" 네이버 검색량, 경쟁도, 수익성 분석 결과를 확인하세요.`,
    openGraph: {
      title: `"${keyword}" 키워드 분석 결과`,
      description: `"${keyword}" 네이버 검색량, 경쟁도, 수익성 분석 결과`,
      url: `https://wealthpipe.net/tools/keyword?q=${encodeURIComponent(keyword)}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `"${keyword}" 키워드 분석 결과 - WealthPipe`,
      images: [ogUrl],
    },
  }
}

export default function KeywordPage() {
  return (
    <Suspense>
      <KeywordAnalyzer />
    </Suspense>
  )
}
