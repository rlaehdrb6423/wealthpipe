const SCREENER_API = process.env.SCREENER_API_URL || ""

export async function GET(request: Request) {
  if (!SCREENER_API) {
    return Response.json({ error: "SCREENER_API_URL not configured" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint") || "screener"

  const allowed = ["screener", "stats", "search", "distribution"]
  if (!allowed.includes(endpoint)) {
    return Response.json({ error: "Invalid endpoint" }, { status: 400 })
  }

  const params = new URLSearchParams(searchParams)
  params.delete("endpoint")

  try {
    const res = await fetch(`${SCREENER_API}/api/${endpoint}?${params}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: endpoint === "stats" ? 300 : 0 },
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
