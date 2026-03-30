import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WealthPipe — AI Data Pipeline Platform",
  description: "재테크, 투자, 마케팅의 핵심 데이터를 AI가 자동으로 수집하고 분석합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
