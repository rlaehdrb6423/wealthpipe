import type { Metadata } from "next";

export const metadata: Metadata = {
  other: { "html-lang": "ko" },
};

export default function KoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div lang="ko">{children}</div>;
}
