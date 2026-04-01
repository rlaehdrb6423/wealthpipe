import { getServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getServiceClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // 최근 7일 keyword_cache에서 키워드별 분석 횟수 집계
    const { data: cacheData, error: cacheError } = await supabase
      .from("keyword_cache")
      .select("keyword, data, created_at")
      .gte("created_at", sevenDaysAgo)
      .limit(1000)

    if (cacheError) {
      return Response.json({ error: "Failed to fetch ranking data" }, { status: 500 })
    }

    // 키워드별 분석 횟수 집계
    const keywordMap = new Map<
      string,
      { count: number; data: Record<string, unknown> }
    >()

    for (const row of cacheData ?? []) {
      const existing = keywordMap.get(row.keyword)
      if (existing) {
        existing.count += 1
      } else {
        keywordMap.set(row.keyword, { count: 1, data: row.data as Record<string, unknown> })
      }
    }

    // shares 테이블에서 공유 횟수 집계
    const { data: sharesData } = await supabase
      .from("shares")
      .select("keyword")
      .gte("created_at", sevenDaysAgo)

    const shareMap = new Map<string, number>()
    for (const row of sharesData ?? []) {
      shareMap.set(row.keyword, (shareMap.get(row.keyword) ?? 0) + 1)
    }

    // 점수 계산 및 정렬 (분석 횟수 * 2 + 공유 횟수)
    const ranked = Array.from(keywordMap.entries())
      .map(([keyword, { count, data }]) => {
        const shareCount = shareMap.get(keyword) ?? 0
        const score = count * 2 + shareCount

        const volume =
          typeof data.totalSearchVolume === "number"
            ? data.totalSearchVolume
            : typeof data.pcSearchCount === "number" && typeof data.mobileSearchCount === "number"
            ? (data.pcSearchCount as number) + (data.mobileSearchCount as number)
            : 0

        const competitionGrade =
          typeof data.competitionGrade === "string"
            ? data.competitionGrade
            : typeof data.competition === "string"
            ? data.competition
            : "N/A"

        const opportunityScore =
          typeof data.opportunityScore === "number" ? data.opportunityScore : 0

        return { keyword, volume, competitionGrade, opportunityScore, shareCount, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((item, idx) => ({ rank: idx + 1, ...item }))

    return new Response(JSON.stringify({ rankings: ranked }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
