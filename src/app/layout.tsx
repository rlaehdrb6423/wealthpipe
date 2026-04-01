import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const SITE_URL = "https://wealthpipe.net";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WealthPipe — AI Pipeline for Wealth Intelligence",
    template: "%s | WealthPipe",
  },
  description:
    "AI automatically collects and analyzes critical data across finance, investment, and marketing. Free tools for bloggers, investors, and marketers.",
  verification: {
    google: "SwxTRCc5nta8bfJ1XuSY4EaVcENhu8NTezyJskbYQDQ",
    other: {
      "msvalidate.01": "6A4E3980272C94E1150535F557F1B69F",
      "naver-site-verification": "273734bbcab1776bbaae3539d72d730b2a95a319",
    },
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: SITE_URL,
      ko: `${SITE_URL}/ko`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "WealthPipe",
    locale: "en_US",
    url: SITE_URL,
    title: "WealthPipe — AI Pipeline for Wealth Intelligence",
    description:
      "AI automatically collects and analyzes critical data across finance, investment, and marketing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WealthPipe — AI Pipeline for Wealth Intelligence",
    description:
      "AI automatically collects and analyzes critical data across finance, investment, and marketing.",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale } = await params;
  const lang = locale === "ko" ? "ko" : "en";
  return (
    <html lang={lang} className={dmSans.className}>
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4740331651949774"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
