import { verifyCronAuth } from "@/lib/auth"

const SCREENER_API = process.env.SCREENER_API_URL || ""

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!SCREENER_API) {
    return Response.json({ error: "SCREENER_API_URL not configured" }, { status: 500 })
  }

  try {
    // Railway 스크리너 크롤링 트리거
    const res = await fetch(`${SCREENER_API}/api/crawl`, {
      method: "POST",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      return Response.json({ error: "Crawl trigger failed", detail: text }, { status: res.status })
    }

    const data = await res.json()
    return Response.json({ success: true, ...data })
  } catch {
    return Response.json({ error: "Failed to reach screener API" }, { status: 502 })
  }
}
