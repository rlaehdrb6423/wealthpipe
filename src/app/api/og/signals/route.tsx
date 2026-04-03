import { ImageResponse } from "next/og"
import { getServiceClient } from "@/lib/supabase"

const SIGNAL_COLORS: Record<string, string> = {
  bullish: "#22c55e",
  bearish: "#ef4444",
  neutral: "#eab308",
}

const SIGNAL_LABELS: Record<string, string> = {
  bullish: "UP",
  bearish: "DOWN",
  neutral: "HOLD",
}

export async function GET() {
  const supabase = getServiceClient()
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("asset_signals")
    .select("data, date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle()

  const assets = (data?.data?.assets || []) as Array<{
    name: string
    ticker: string
    price: number
    changePercent: number
    signal: string
  }>

  const dateStr = (data?.date || today).replace(/-/g, ".")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)",
          padding: "48px 56px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                fontSize: "18px",
                fontWeight: 800,
                color: "#000",
              }}
            >
              W
            </div>
            <span style={{ color: "#fff", fontSize: "22px", fontWeight: 700 }}>AI Market Signals</span>
          </div>
          <span style={{ color: "#666", fontSize: "18px" }}>{dateStr}</span>
        </div>

        {/* Asset Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", flex: 1 }}>
          {assets.slice(0, 7).map((asset) => {
            const color = SIGNAL_COLORS[asset.signal] || "#eab308"
            const label = SIGNAL_LABELS[asset.signal] || "HOLD"
            const isUp = asset.changePercent >= 0
            const changeStr = isUp ? `+${asset.changePercent.toFixed(1)}%` : `${asset.changePercent.toFixed(1)}%`
            const priceStr = asset.ticker === "KRW=X" || asset.ticker === "^KS11"
              ? asset.price.toLocaleString("ko-KR", { maximumFractionDigits: 0 })
              : "$" + asset.price.toLocaleString("en-US", { maximumFractionDigits: asset.ticker === "BTC-USD" ? 0 : 2 })

            return (
              <div
                key={asset.ticker}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#1a1a1a",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  border: "1px solid #2a2a2a",
                  width: "240px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ color: "#aaa", fontSize: "15px", fontWeight: 600 }}>{asset.name}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: color + "22",
                      color: color,
                    }}
                  >
                    {label}
                  </span>
                </div>
                <span style={{ color: "#fff", fontSize: "22px", fontWeight: 800 }}>{priceStr}</span>
                <span style={{ color: isUp ? "#22c55e" : "#ef4444", fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>
                  {changeStr}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
          <span style={{ color: "#666", fontSize: "16px" }}>wealthpipe.net/tools/signals</span>
          <span style={{ color: "#888", fontSize: "15px" }}>무료로 시그널 확인하세요 →</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
