import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const SITE_URL = "https://wealthpipe.net";

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
    other: { "msvalidate.01": "6A4E3980272C94E1150535F557F1B69F" },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.className}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4740331651949774"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
