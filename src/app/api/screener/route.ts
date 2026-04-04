const SCREENER_API = process.env.SCREENER_API_URL || ""

const ALLOWED_HOSTS = ["factor-screener-production.up.railway.app"]

function isAllowedScreenerUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ALLOWED_HOSTS.includes(parsed.hostname)
  } catch {
    return false
  }
}

const ALLOWED_PARAMS: Record<string, string[]> = {
  screener: ["market", "sort", "order", "limit", "offset", "per_max", "pbr_max", "roe_min", "div_min", "cap_min", "score_min", "preset"],
  stats: [],
  search: ["q", "market"],
  distribution: ["factor", "market"],
}

export async function GET(request: Request) {
  if (!SCREENER_API || !isAllowedScreenerUrl(SCREENER_API)) {
    return Response.json({ error: "SCREENER_API_URL not configured" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint") || "screener"

  const allowed = ["screener", "stats", "search", "distribution"]
  if (!allowed.includes(endpoint)) {
    return Response.json({ error: "Invalid endpoint" }, { status: 400 })
  }

  // 허용된 파라미터만 전달 (SSRF 방지)
  const safeParams = new URLSearchParams()
  for (const key of (ALLOWED_PARAMS[endpoint] || [])) {
    const val = searchParams.get(key)
    if (val) safeParams.set(key, val)
  }
  const params = safeParams

  try {
    const res = await fetch(`${SCREENER_API}/api/${endpoint}?${params}`, {
      headers: { Accept: "application/json" },
      cache: endpoint === "stats" ? "force-cache" : "no-store",
    })

    if (!res.ok) {
      return Response.json({ error: "Upstream error" }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data, {
      headers: {
        "Cache-Control": endpoint === "stats" ? "public, s-maxage=300, stale-while-revalidate=60" : "public, s-maxage=30, stale-while-revalidate=10",
      },
    })
  } catch {
    return Response.json({ error: "Failed to reach screener API" }, { status: 502 })
  }
}
