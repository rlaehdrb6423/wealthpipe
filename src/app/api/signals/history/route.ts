import { ASSETS } from "@/lib/yahoo-finance"

export interface PricePoint {
  timestamp: number
  close: number
}

async function fetchHistory(ticker: string, range: string = "1mo"): Promise<PricePoint[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=1d`
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WealthPipe/1.0)",
        Accept: "application/json",
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) return []

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    if (!result) return []

    const timestamps: number[] = result.timestamp || []
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || []

    const points: PricePoint[] = []
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null) {
        points.push({ timestamp: timestamps[i], close: closes[i]! })
      }
    }
    return points
  } catch {
    clearTimeout(timeoutId)
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") === "7d" ? "7d" : "1mo"

  try {
    const results = await Promise.all(
      ASSETS.map(async (a) => {
        const history = await fetchHistory(a.ticker, range)
        return [a.ticker, history] as const
      })
    )

    const historyMap: Record<string, PricePoint[]> = {}
    for (const [ticker, history] of results) {
      historyMap[ticker] = history
    }

    return new Response(JSON.stringify({ history: historyMap }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300",
      },
    })
  } catch {
    return Response.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
