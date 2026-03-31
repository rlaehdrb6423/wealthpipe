import {
  getSearchVolume,
  getBlogSearchResult,
  getNewsCount,
  getCafeCount,
  getWebDocCount,
} from "@/lib/naver-api"
import { getServiceClient } from "@/lib/supabase"

export interface TitlePattern {
  avgLength: number
  topWords: string[]
  titleTypes: { type: string; count: number }[]
  titles: string[]
  links: string[]
}

const STOP_WORDS = new Set([
  "의", "를", "을", "에", "에서", "은", "는", "이", "가", "와", "과", "도", "로", "으로",
  "한", "하는", "된", "할", "수", "것", "및", "더", "그", "이런", "저", "the", "a", "an",
  "is", "are", "for", "and", "or", "in", "on", "to", "of", "with", "how", "what",
])

function analyzeTitlePatterns(titles: string[], links: string[]): TitlePattern | null {
  if (titles.length === 0) return null

  const avgLength = Math.round(titles.reduce((sum, t) => sum + t.length, 0) / titles.length)

  const wordCount = new Map<string, number>()
  for (const title of titles) {
    const words = title.replace(/[^가-힣a-zA-Z0-9\s]/g, "").split(/\s+/).filter(w => w.length >= 2)
    for (const word of words) {
      const lower = word.toLowerCase()
      if (!STOP_WORDS.has(lower)) {
        wordCount.set(lower, (wordCount.get(lower) || 0) + 1)
      }
    }
  }
  const topWords = [...wordCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)

  const typePatterns: [string, RegExp][] = [
    ["리스트형", /\d+가지|\d+개|\d+선|top\s?\d+|best\s?\d+|\d+종/i],
    ["가이드형", /방법|가이드|하는\s?법|시작|입문|guide|how to/i],
    ["후기형", /후기|리뷰|사용기|체험|review|경험/i],
    ["비교형", /비교|vs|차이|versus|대결/i],
    ["질문형", /\?|인가요|일까|할까|뭐가|왜/],
    ["정보형", /정리|총정리|알아보|핵심|요약|정보|설명/i],
  ]

  const typeCounts = new Map<string, number>()
  for (const title of titles) {
    let matched = false
    for (const [type, pattern] of typePatterns) {
      if (pattern.test(title)) {
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1)
        matched = true
        break
      }
    }
    if (!matched) {
      typeCounts.set("일반형", (typeCounts.get("일반형") || 0) + 1)
    }
  }
  const titleTypes = [...typeCounts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  return { avgLength, topWords, titleTypes, titles, links }
}

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
  pcCpc: number
  mobileCpc: number
  avgCpc: number
  estimatedRevenue: number
  titlePattern?: TitlePattern
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

  const [volumeData, blogResult, newsCount, cafeCount, webDocCount] = await Promise.all([
    getSearchVolume(keyword),
    getBlogSearchResult(keyword),
    getNewsCount(keyword),
    getCafeCount(keyword),
    getWebDocCount(keyword),
  ])

  if (!volumeData) return null

  const totalVolume = volumeData.pcVolume + volumeData.mobileVolume
  const blog = blogResult?.total ?? 0
  const news = newsCount ?? 0
  const cafe = cafeCount ?? 0
  const web = webDocCount ?? 0
  const totalCompetition = blog + news + cafe + web
  const ratio = blog > 0 ? Math.round((totalVolume / blog) * 100) / 100 : 0

  const { competitionGrade, competitionLabel } = calcCompetition(totalVolume, totalCompetition)
  const { profitGrade, profitLabel } = calcProfitGrade(totalVolume, competitionGrade, volumeData.avgClickCnt)

  const pcCpc = volumeData.pcCpc
  const mobileCpc = volumeData.mobileCpc
  const avgCpc = totalVolume > 0
    ? Math.round(pcCpc * (volumeData.pcVolume / totalVolume) + mobileCpc * (volumeData.mobileVolume / totalVolume))
    : 0
  const estimatedRevenue = Math.round(totalVolume * (volumeData.avgCtr / 100) * avgCpc * 0.05)

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
    pcCpc,
    mobileCpc,
    avgCpc,
    estimatedRevenue,
    titlePattern: blogResult?.posts ? analyzeTitlePatterns(blogResult.posts.map(p => p.title), blogResult.posts.map(p => p.link)) ?? undefined : undefined,
  }

  await setCache(keyword, result)
  return result
}
