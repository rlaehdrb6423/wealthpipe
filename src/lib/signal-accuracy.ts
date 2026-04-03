import { getServiceClient } from "@/lib/supabase"

export interface AccuracyResult {
  [ticker: string]: { total: number; correct: number; rate: number }
}

interface AssetSignal {
  ticker: string
  signal: "bullish" | "bearish" | "neutral"
  price: number
}

interface SignalRow {
  date: string
  data: { assets: AssetSignal[] }
}

export async function calculateAccuracy(days: number = 30): Promise<AccuracyResult> {
  const supabase = getServiceClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - (days + 1))

  const { data, error } = await supabase
    .from("asset_signals")
    .select("date, data")
    .gte("date", cutoff.toISOString().split("T")[0])
    .order("date", { ascending: true })

  if (error || !data || data.length < 2) return {}

  const rows = data as SignalRow[]
  const result: AccuracyResult = {}

  for (let i = 0; i < rows.length - 1; i++) {
    const today = rows[i]
    const tomorrow = rows[i + 1]

    for (const asset of today.data.assets) {
      if (asset.signal === "neutral" || !asset.price) continue

      const nextAsset = tomorrow.data.assets.find((a) => a.ticker === asset.ticker)
      if (!nextAsset?.price) continue

      if (!result[asset.ticker]) {
        result[asset.ticker] = { total: 0, correct: 0, rate: 0 }
      }

      result[asset.ticker].total++

      const priceUp = nextAsset.price > asset.price
      if ((asset.signal === "bullish" && priceUp) || (asset.signal === "bearish" && !priceUp)) {
        result[asset.ticker].correct++
      }
    }
  }

  for (const ticker of Object.keys(result)) {
    const r = result[ticker]
    r.rate = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0
  }

  return result
}
