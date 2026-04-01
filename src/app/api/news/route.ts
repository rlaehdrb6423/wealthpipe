import { getServiceClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "7", 10), 1), 30)

  const supabase = getServiceClient()

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

  return Response.json({ digests: data || [] })
}
