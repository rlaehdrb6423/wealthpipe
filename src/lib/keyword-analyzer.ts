import {
  getSearchVolume,
  getBlogDocCount,
  getNewsCount,
  getCafeCount,
  getWebDocCount,
} from "@/lib/naver-api"
import { getServiceClient } from "@/lib/supabase"

export interface KeywordResult {
  keyword: string
  pcVolume: number
  mobileVolume: number
  totalVolume: number
  blogDocCount: number
  newsCount: number
  cafeCount: number
  webDocCount: number
  totalCompetition: number
  competitionGrade: string
  competitionLabel: string
  profitGrade: string
  profitLabel: string
  ratio: number
  relatedKeywords: string[]
  successRate: number
  compIdx: string
  avgClickCnt: number
  avgCtr: number
}

function calcCompetition(totalVolume: number, totalCompetition: number) {
  if (totalCompetition === 0) return { competitionGrade: "A", competitionLabel: "매우낮음" }
  const ratio = totalVolume / totalCompetition
  if (ratio >= 30) return { competitionGrade: "A", competitionLabel: "매우낮음" }
  if (ratio >= 10) return { competitionGrade: "B", competitionLabel: "낮음" }
  if (ratio >= 3) return { competitionGrade: "C", competitionLabel: "보통" }
  if (ratio >= 1) return { competitionGrade: "D", competitionLabel: "높음" }
  return { competitionGrade: "E", competitionLabel: "매우높음" }
}

function calcProfitGrade(totalVolume: number, competitionGrade: string, avgClickCnt: number) {
  let score = 0

  // 검색량 점수
  if (totalVolume >= 1000 && totalVolume <= 10000) score += 3
  else if (totalVolume >= 100) score += 2
  else if (totalVolume >= 10000) score += 1

  // 경쟁도 점수 (낮을수록 수익성 높음)
  if (competitionGrade === "A") score += 3
  else if (competitionGrade === "B") score += 2
  else if (competitionGrade === "C") score += 1

  // 클릭 수 점수
  if (avgClickCnt >= 50) score += 2
  else if (avgClickCnt >= 10) score += 1

  if (score >= 7) return { profitGrade: "A", profitLabel: "매우높음" }
  if (score >= 5) return { profitGrade: "B", profitLabel: "높음" }
  if (score >= 3) return { profitGrade: "C", profitLabel: "보통" }
  return { profitGrade: "D", profitLabel: "낮음" }
}

function calculateSuccessRate(totalVolume: number, totalCompetition: number): number {
  if (totalCompetition === 0) return 95
  const ratio = totalVolume / totalCompetition

  let base = 0
  if (ratio >= 30) base = 85
  else if (ratio >= 10) base = 65
  else if (ratio >= 3) base = 40
  else base = 15

  if (totalVolume >= 100 && totalVolume <= 5000) base += 10
  else if (totalVolume > 5000) base += 5

  return Math.min(99, Math.max(5, base))
}

// Supabase 캐시 (24시간 TTL)
async function getCached(keyword: string): Promise<KeywordResult | null> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("keyword_cache")
    .select("data, created_at")
    .eq("keyword", keyword)
    .single()

  if (!data) return null

  const age = Date.now() - new Date(data.created_at).getTime()
  if (age > 24 * 60 * 60 * 1000) return null

  return data.data as KeywordResult
}

async function setCache(keyword: string, result: KeywordResult) {
  const supabase = getServiceClient()
  await supabase
    .from("keyword_cache")
    .upsert({ keyword, data: result, created_at: new Date().toISOString() }, { onConflict: "keyword" })
}

export async function analyzeKeyword(keyword: string): Promise<KeywordResult | null> {
  const cached = await getCached(keyword)
  if (cached) return cached

  const [volumeData, blogDocCount, newsCount, cafeCount, webDocCount] = await Promise.all([
    getSearchVolume(keyword),
    getBlogDocCount(keyword),
    getNewsCount(keyword),
    getCafeCount(keyword),
    getWebDocCount(keyword),
  ])

  if (!volumeData) return null

  const totalVolume = volumeData.pcVolume + volumeData.mobileVolume
  const blog = blogDocCount ?? 0
  const news = newsCount ?? 0
  const cafe = cafeCount ?? 0
  const web = webDocCount ?? 0
  const totalCompetition = blog + news + cafe + web
  const ratio = blog > 0 ? Math.round((totalVolume / blog) * 100) / 100 : 0

  const { competitionGrade, competitionLabel } = calcCompetition(totalVolume, totalCompetition)
  const { profitGrade, profitLabel } = calcProfitGrade(totalVolume, competitionGrade, volumeData.avgClickCnt)

  const result: KeywordResult = {
    keyword: volumeData.keyword,
    pcVolume: volumeData.pcVolume,
    mobileVolume: volumeData.mobileVolume,
    totalVolume,
    blogDocCount: blog,
    newsCount: news,
    cafeCount: cafe,
    webDocCount: web,
    totalCompetition,
    competitionGrade,
    competitionLabel,
    profitGrade,
    profitLabel,
    ratio,
    relatedKeywords: volumeData.relatedKeywords,
    successRate: calculateSuccessRate(totalVolume, totalCompetition),
    compIdx: volumeData.compIdx,
    avgClickCnt: volumeData.avgClickCnt,
    avgCtr: volumeData.avgCtr,
  }

  await setCache(keyword, result)
  return result
}
