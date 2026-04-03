import { NextRequest } from "next/server"
import { getBlogRank } from "@/lib/naver-api"

export async function POST(request: NextRequest) {
  try {
    const { keyword, blogUrl } = await request.json()

    if (!keyword?.trim() || !blogUrl?.trim()) {
      return Response.json({ error: "키워드와 블로그 URL을 입력해주세요." }, { status: 400 })
    }

    if (keyword.length > 50) {
      return Response.json({ error: "키워드는 50자 이내로 입력해주세요." }, { status: 400 })
    }

    if (blogUrl.length > 300) {
      return Response.json({ error: "URL이 너무 깁니다." }, { status: 400 })
    }

    const result = await getBlogRank(keyword.trim(), blogUrl.trim())

    return Response.json(result)
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
