import type { Metadata } from "next"
import { Suspense } from "react"
import NewsDigest from "@/app/tools/news/NewsDigest"
import { getTexts } from "@/lib/i18n"

const t = getTexts("ko").news
const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: t.ogTitle,
  description: t.ogDesc,
  alternates: {
    canonical: `${SITE_URL}/ko/tools/news`,
    languages: { en: `${SITE_URL}/tools/news`, ko: `${SITE_URL}/ko/tools/news` },
  },
  openGraph: {
    title: t.ogTitle,
    description: t.ogDesc,
    url: `${SITE_URL}/ko/tools/news`,
    locale: "ko_KR",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WealthPipe 경제 뉴스 다이제스트",
  url: `${SITE_URL}/ko/tools/news`,
  applicationCategory: "Finance",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  description:
    "AI가 매일 경제 핵심 뉴스를 요약합니다. 주식, 부동산, 환율, 금리, 암호화폐를 한곳에서.",
  inLanguage: ["ko", "en"],
}

export default function KoNewsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense>
        <NewsDigest locale="ko" />
      </Suspense>
    </>
  )
}
