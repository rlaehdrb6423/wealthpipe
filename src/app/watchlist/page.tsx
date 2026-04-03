import type { Metadata } from "next"
import WatchlistClient from "@/components/WatchlistClient"

const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: "관심종목 — WealthPipe",
  description: "Save and manage your favorite KRX stocks. Track KOSPI and KOSDAQ watchlist in one place.",
  alternates: {
    canonical: `${SITE_URL}/watchlist`,
  },
}

export default function WatchlistPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>관심종목</h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Watchlist</p>
        <WatchlistClient />
      </div>
    </div>
  )
}
