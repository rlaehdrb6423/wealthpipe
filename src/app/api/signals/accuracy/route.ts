import { calculateAccuracy } from "@/lib/signal-accuracy"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = Math.min(Math.max(parseInt(searchParams.get("days") || "30", 10), 7), 90)

  try {
    const accuracy = await calculateAccuracy(days)

    return new Response(JSON.stringify({ accuracy, days }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    })
  } catch {
    return Response.json({ error: "Failed to calculate accuracy" }, { status: 500 })
  }
}
