import { NextRequest } from "next/server"
import { getSearchTrend } from "@/lib/naver-api"

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json()

    if (!keyword?.trim()) {
      return Response.json({ error: "키워드를 입력해주세요." }, { status: 400 })
    }

    const trend = await getSearchTrend(keyword.trim())

    if (!trend) {
      return Response.json({ error: "트렌드 데이터가 없습니다." }, { status: 404 })
    }

    return Response.json({ keyword: keyword.trim(), trend })
  } catch {
    return Response.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
