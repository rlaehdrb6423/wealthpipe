import { getAnonClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "7", 10), 1), 30)

  const supabase = getAnonClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("news_digest")
    .select("date, data, created_at")
    .gte("date", cutoffStr)
    .order("date", { ascending: false })
    .limit(days)

  if (error) {
    console.error("Supabase query error:", error)
    return Response.json({ error: "Failed to fetch news" }, { status: 500 })
  }

  // Fetch latest asset prices for category badges
  const { data: latestSignal } = await supabase
    .from("asset_signals")
    .select("data")
    .order("date", { ascending: false })
    .limit(1)
    .single()

  const CATEGORY_ASSET_MAP: Record<string, string> = {
    stock: "^KS11",
    exchange: "KRW=X",
    crypto: "BTC-USD",
  }

  let assetPrices: Record<string, { name: string; price: number; change: number; changePercent: number } | null> = {}
  if (latestSignal?.data?.assets) {
    const assets = latestSignal.data.assets as { ticker: string; name: string; price: number; change: number; changePercent: number }[]
    for (const [category, ticker] of Object.entries(CATEGORY_ASSET_MAP)) {
      const asset = assets.find((a) => a.ticker === ticker)
      if (asset) {
        assetPrices[category] = { name: asset.name, price: asset.price, change: asset.change, changePercent: asset.changePercent }
      }
    }
  }

  return new Response(JSON.stringify({ digests: data || [], assetPrices }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  })
}
