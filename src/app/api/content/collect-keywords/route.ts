import { getServiceClient } from "@/lib/supabase"
import { analyzeKeyword } from "@/lib/keyword-analyzer"
import { verifyCronAuth } from "@/lib/auth"

const SEED_KEYWORDS = [
  // 키워드 분석기 유입
  "네이버 키워드 분석",
  "블로그 키워드 찾기",
  "네이버 검색량 조회",
  "블로그 수익화",
  "네이버 블로그 키워드",
  "애드센스 수익",
  // 시그널 트래커 유입
  "주식 매매 시그널",
  "코스피 전망",
  "비트코인 전망",
  "환율 전망",
  "금 시세 전망",
  "유가 전망",
  // 스크리너 유입
  "저평가 주식 찾기",
  "배당주 추천",
  "주식 스크리너",
  "ETF 투자",
  // 뉴스 다이제스트 유입
  "오늘 경제 뉴스",
  "주식 시장 뉴스",
  // 일반 재테크
  "재테크 방법",
  "주식 투자 초보",
]

const BATCH_SIZE = 5

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getServiceClient()

  // 파이프라인 상태 조회 (현재 인덱스)
  const { data: stateRow } = await supabase
    .from("content_pipeline_state")
    .select("current_index, last_run_date")
    .eq("id", "default")
    .single()

  const today = new Date().toISOString().split("T")[0]
  let currentIndex = stateRow?.current_index ?? 0

  // 오늘 이미 실행됐으면 스킵
  if (stateRow?.last_run_date === today) {
    return Response.json({ skipped: true, reason: "Already ran today" })
  }

  // 오늘 배치 키워드 5개 선택
  const batchKeywords = SEED_KEYWORDS.slice(currentIndex, currentIndex + BATCH_SIZE)
  if (batchKeywords.length === 0) {
    return Response.json({ skipped: true, reason: "No keywords in batch" })
  }

  // 병렬 키워드 분석 (순차 → Promise.allSettled)
  const analysisResults = await Promise.allSettled(
    batchKeywords.map((keyword) => analyzeKeyword(keyword).then((data) => ({ keyword, data })))
  )

  const results: { keyword: string; status: string }[] = []

  for (const result of analysisResults) {
    if (result.status === "rejected") {
      results.push({ keyword: "unknown", status: "error" })
      continue
    }

    const { keyword, data } = result.value
    if (!data) {
      results.push({ keyword, status: "failed" })
      continue
    }

    const { error } = await supabase.from("content_queue").insert({
      keyword,
      keyword_data: data as unknown as Record<string, unknown>,
      status: "pending",
    })

    if (error?.code === "23505") {
      results.push({ keyword, status: "already_queued" })
    } else {
      results.push({ keyword, status: error ? "failed" : "queued" })
    }
  }

  // 다음 인덱스 계산 (순환)
  const nextIndex = (currentIndex + BATCH_SIZE) % SEED_KEYWORDS.length

  // 파이프라인 상태 업데이트
  await supabase.from("content_pipeline_state").upsert({
    id: "default",
    current_index: nextIndex,
    last_run_date: today,
    updated_at: new Date().toISOString(),
  })

  return Response.json({
    success: true,
    processed: results.length,
    results,
    nextIndex,
  })
}
