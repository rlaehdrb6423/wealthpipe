import type { Metadata } from "next";
import WealthPipePage from "@/components/WealthPipePage";

const SITE_URL = "https://wealthpipe.net";

export const metadata: Metadata = {
  title: "WealthPipe — AI Pipeline for Wealth Intelligence",
  description:
    "AI automatically collects and analyzes critical data across finance, investment, and marketing. Free keyword analyzer, economic digest, and asset signal tracker.",
  alternates: {
    canonical: SITE_URL,
    languages: { en: SITE_URL, ko: `${SITE_URL}/ko` },
  },
  openGraph: {
    title: "WealthPipe — AI Pipeline for Wealth Intelligence",
    description:
      "AI automatically collects and analyzes critical data across finance, investment, and marketing.",
    url: SITE_URL,
    locale: "en_US",
  },
};

export default function Home() {
  return <WealthPipePage locale="en" />;
}
