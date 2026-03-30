import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WealthPipe — AI Pipeline for Wealth Intelligence",
  description:
    "재테크·투자·마케팅 데이터를 AI가 자동으로 수집하고 분석합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={dmSans.className}>
      <body>{children}</body>
    </html>
  );
}
