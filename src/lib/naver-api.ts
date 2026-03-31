import crypto from "crypto"

// ===== 네이버 검색광고 API (검색량 조회) =====

function generateSignature(timestamp: number, method: string, uri: string): string {
  const message = `${timestamp}.${method}.${uri}`
  const hmac = crypto.createHmac("sha256", process.env.NAVER_AD_SECRET_KEY!)
  hmac.update(message)
  return hmac.digest("base64")
}

function parseVolume(val: number | string): number {
  if (typeof val === "string") {
    if (val === "< 10") return 5
    return parseInt(val, 10) || 0
  }
  return val || 0
}

export interface KeywordVolume {
  keyword: string
  pcVolume: number
  mobileVolume: number
  relatedKeywords: string[]
  compIdx: string
  avgClickCnt: number
  avgCtr: number
  pcCpc: number
  mobileCpc: number
}

export async function getSearchVolume(keyword: string): Promise<KeywordVolume | null> {
  const timestamp = Date.now()
  const method = "GET"
  const uri = "/keywordstool"
  const signature = generateSignature(timestamp, method, uri)
  const cleanKeyword = keyword.replace(/\s+/g, "")

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(
      `https://api.naver.com/keywordstool?hintKeywords=${encodeURIComponent(cleanKeyword)}&showDetail=1`,
      {
        method: "GET",
        headers: {
          "X-Timestamp": timestamp.toString(),
          "X-API-KEY": process.env.NAVER_AD_API_KEY!,
          "X-Customer": process.env.NAVER_AD_CUSTOMER_ID!,
          "X-Signature": signature,
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!response.ok) return null

    const data = await response.json()
    const items = data.keywordList || []
    if (items.length === 0) return null

    const main = items[0]
    return {
      keyword: main.relKeyword,
      pcVolume: parseVolume(main.monthlyPcQcCnt),
      mobileVolume: parseVolume(main.monthlyMobileQcCnt),
      relatedKeywords: items.slice(1, 21).map((item: { relKeyword: string }) => item.relKeyword),
      compIdx: main.compIdx || "정보없음",
      avgClickCnt: (main.monthlyAvePcClkCnt || 0) + (main.monthlyAveMobileClkCnt || 0),
      avgCtr: Math.round(((main.monthlyAvePcCtr || 0) + (main.monthlyAveMobileCtr || 0)) / 2 * 100) / 100,
      pcCpc: main.monthlyAvePcCpc || 0,
      mobileCpc: main.monthlyAveMobileCpc || 0,
    }
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

// ===== 네이버 검색 API (문서수 조회) =====

async function naverSearchCount(
  query: string,
  type: "blog" | "news" | "cafearticle" | "webkr"
): Promise<number | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/${type}?query=${encodeURIComponent(query)}&display=1`,
      {
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text()
      console.error(`네이버 검색 API(${type}) 에러: status=${response.status}, body=${text}`)
      return null
    }
    const data = await response.json()
    return data.total
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(`네이버 검색 API(${type}) 예외:`, error)
    return null
  }
}

export interface BlogPost {
  title: string
  link: string
  bloggername: string
  postdate: string
}

export interface BlogSearchResult {
  total: number
  posts: BlogPost[]
}

export async function getBlogSearchResult(keyword: string): Promise<BlogSearchResult | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/blog?query=${encodeURIComponent(keyword)}&display=10&sort=sim`,
      {
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!response.ok) return null
    const data = await response.json()
    return {
      total: data.total,
      posts: (data.items || []).map((item: { title: string; link: string; bloggername: string; postdate: string }) => ({
        title: item.title.replace(/<[^>]*>/g, ""),
        link: item.link,
        bloggername: item.bloggername,
        postdate: item.postdate,
      })),
    }
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

export async function getBlogDocCount(keyword: string): Promise<number | null> {
  const result = await getBlogSearchResult(keyword)
  return result ? result.total : null
}

export async function getNewsCount(keyword: string): Promise<number | null> {
  return naverSearchCount(keyword, "news")
}

export async function getCafeCount(keyword: string): Promise<number | null> {
  return naverSearchCount(keyword, "cafearticle")
}

export async function getWebDocCount(keyword: string): Promise<number | null> {
  return naverSearchCount(keyword, "webkr")
}
