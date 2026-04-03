import { getServiceClient } from "@/lib/supabase"
import { postTweet } from "@/lib/twitter"
import { verifyCronAuth } from "@/lib/auth"

const SIGNAL_EMOJI: Record<string, string> = {
  bullish: "\u{1F7E2}",
  bearish: "\u{1F534}",
  neutral: "\u{1F7E1}",
}

function formatPrice(price: number, ticker: string): string {
  if (ticker === "KRW=X" || ticker === "^KS11") {
    return price.toLocaleString("ko-KR", { maximumFractionDigits: 0 })
  }
  return "$" + price.toLocaleString("en-US", { maximumFractionDigits: ticker === "BTC-USD" ? 0 : 2 })
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceClient()
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("asset_signals")
    .select("data")
    .eq("date", today)
    .maybeSingle()

  if (!data?.data?.assets?.length) {
    return Response.json({ error: "No signals for today" }, { status: 404 })
  }

  const assets = data.data.assets as Array<{
    name: string
    ticker: string
    price: number
    changePercent: number
    signal: string
  }>

  // 트윗 본문 생성
  const lines = assets.map((a) => {
    const emoji = SIGNAL_EMOJI[a.signal] || "\u{1F7E1}"
    const change = a.changePercent >= 0 ? `+${a.changePercent.toFixed(1)}%` : `${a.changePercent.toFixed(1)}%`
    return `${emoji} ${a.name} ${formatPrice(a.price, a.ticker)} (${change})`
  })

  const dateStr = today.replace(/-/g, ".")
  const tweet = `${dateStr} AI \uc2dc\uc7a5 \uc2dc\uadf8\ub110\n\n${lines.join("\n")}\n\n\ubb34\ub8cc \uc2dc\uadf8\ub110 \ud655\uc778 \u2192 https://wealthpipe.net/ko/tools/signals\n\n#\uc8fc\uc2dd #\ucf54\uc2a4\ud53c #\ube44\ud2b8\ucf54\uc778 #\ud22c\uc790 #\uc7ac\ud14c\ud06c`

  // 280자 제한 체크
  if (tweet.length > 280) {
    // 해시태그 줄여서 재시도
    const shortTweet = `${dateStr} AI \uc2dc\uc7a5 \uc2dc\uadf8\ub110\n\n${lines.join("\n")}\n\nhttps://wealthpipe.net/ko/tools/signals`
    const result = await postTweet(shortTweet)
    return Response.json({ success: !!result, tweetId: result?.id, truncated: true })
  }

  const result = await postTweet(tweet)

  if (!result) {
    return Response.json({ error: "Failed to post tweet" }, { status: 500 })
  }

  return Response.json({ success: true, tweetId: result.id })
}
