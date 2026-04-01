export interface AssetData {
  name: string
  ticker: string
  price: number
  change: number
  changePercent: number
}

const ASSETS = [
  { name: "KOSPI", ticker: "^KS11" },
  { name: "S&P 500", ticker: "^GSPC" },
  { name: "NASDAQ", ticker: "^IXIC" },
  { name: "Bitcoin", ticker: "BTC-USD" },
  { name: "Gold", ticker: "GC=F" },
  { name: "USD/KRW", ticker: "KRW=X" },
]

export { ASSETS }

export async function fetchAssetData(ticker: string, name: string): Promise<AssetData | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5d&interval=1d`
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WealthPipe/1.0)",
        Accept: "application/json",
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) return null

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    if (!meta) return null

    const price: number = meta.regularMarketPrice ?? meta.previousClose ?? 0
    const prevClose: number = meta.previousClose ?? meta.chartPreviousClose ?? price
    const change = price - prevClose
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0

    return {
      name,
      ticker,
      price,
      change,
      changePercent,
    }
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

export async function fetchAllAssets(): Promise<AssetData[]> {
  const results = await Promise.all(
    ASSETS.map((a) => fetchAssetData(a.ticker, a.name))
  )
  return results.filter((r): r is AssetData => r !== null)
}
