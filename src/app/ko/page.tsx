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

export default function KoHome() {
  return <WealthPipePage locale="ko" />;
}
