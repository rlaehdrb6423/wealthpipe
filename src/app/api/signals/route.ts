import { getServiceClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "7", 10), 1), 30)

  const supabase = getServiceClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("asset_signals")
    .select("date, data, created_at")
    .gte("date", cutoffStr)
    .order("date", { ascending: false })
    .limit(days)

  if (error) {
    console.error("Supabase query error:", error)
    return Response.json({ error: "Failed to fetch signals" }, { status: 500 })
  }

  return new Response(JSON.stringify({ signals: data || [] }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  })
}
