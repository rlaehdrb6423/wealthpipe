import { getServiceClient } from "@/lib/supabase"
import { ASSETS } from "@/lib/yahoo-finance"

const ALL_TICKERS = ASSETS.map((a) => a.ticker)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "7", 10), 1), 30)

  const supabase = getServiceClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days - 1) // 1일 더 여유 (보완용)
  const cutoffStr = cutoff.toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("asset_signals")
    .select("date, data, created_at")
    .gte("date", cutoffStr)
    .order("date", { ascending: false })
    .limit(days + 1)

  if (error) {
    console.error("Supabase query error:", error)
    return Response.json({ error: "Failed to fetch signals" }, { status: 500 })
  }

  const signals = data || []

  // 오늘 데이터에 빠진 자산이 있으면 어제 데이터로 보완
  if (signals.length >= 2) {
    const today = signals[0]
    const yesterday = signals[1]
    const todayAssets = today.data?.assets || []
    const todayTickers = new Set(todayAssets.map((a: { ticker: string }) => a.ticker))
    const missingTickers = ALL_TICKERS.filter((t) => !todayTickers.has(t))

    if (missingTickers.length > 0 && yesterday.data?.assets) {
      const yesterdayAssets = yesterday.data.assets as Array<{ ticker: string; [key: string]: unknown }>
      const fillers = yesterdayAssets.filter((a) => missingTickers.includes(a.ticker))
      if (fillers.length > 0) {
        today.data = {
          ...today.data,
          assets: [...todayAssets, ...fillers].sort((a: { ticker: string }, b: { ticker: string }) => {
            const order = ALL_TICKERS
            return (order.indexOf(a.ticker) === -1 ? 999 : order.indexOf(a.ticker)) -
                   (order.indexOf(b.ticker) === -1 ? 999 : order.indexOf(b.ticker))
          }),
        }
      }
    }
  }

  // 요청한 일수만 반환 (보완용 추가분 제거)
  const result = signals.slice(0, days)

  return new Response(JSON.stringify({ signals: result }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  })
}
