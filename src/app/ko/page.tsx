import type { Metadata } from "next";
import WealthPipePage from "@/components/WealthPipePage";

const SITE_URL = "https://wealthpipe.net";

export const metadata: Metadata = {
  title: "WealthPipe — AI 데이터 파이프라인",
  description:
    "재테크, 투자, 마케팅의 핵심 데이터를 AI가 자동으로 수집하고 분석합니다. 무료 키워드 분석기, 경제 뉴스 다이제스트, 자산 시그널 트래커.",
  alternates: {
    canonical: `${SITE_URL}/ko`,
    languages: { en: SITE_URL, ko: `${SITE_URL}/ko` },
  },
  openGraph: {
    title: "WealthPipe — AI 데이터 파이프라인",
    description:
      "재테크, 투자, 마케팅의 핵심 데이터를 AI가 자동으로 수집하고 분석합니다.",
    url: `${SITE_URL}/ko`,
    locale: "ko_KR",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WealthPipe",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: "AI가 재테크, 투자, 마케팅 데이터를 자동으로 수집하고 분석합니다.",
    sameAs: ["https://x.com/wealthpipe_DK"],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "WealthPipe는 무료인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "네, 모든 도구(키워드 분석기, 뉴스 다이제스트, 시그널 트래커, 팩터 스크리너)를 무료로 사용할 수 있습니다. 로그인도 필요 없습니다.",
        },
      },
      {
        "@type": "Question",
        name: "AI 시장 시그널은 얼마나 자주 업데이트되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "코스피, S&P 500, 나스닥, 비트코인, 금, 유가, 환율 시그널이 매일 자동으로 업데이트됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "키워드 분석기는 어떤 데이터를 제공하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "네이버 검색량, 경쟁도, 수익성 분석과 AI 기회점수를 제공합니다. 블로거와 마케터에게 최적의 키워드를 찾아드립니다.",
        },
      },
    ],
  },
];

export default function KoHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <WealthPipePage locale="ko" />
    </>
  );
}
