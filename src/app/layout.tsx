import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WealthPipe — AI Pipeline for Wealth Intelligence",
  description: "재테크·투자·마케팅 데이터를 AI가 자동으로 수집하고 분석합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, background: "#000" }}>{children}</body>
    </html>
  );
}
