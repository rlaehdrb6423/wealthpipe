import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-auth"
import { getServiceClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const service = getServiceClient()
    const { data, error } = await service
      .from("watchlist")
      .select("stock_code, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return Response.json({ error: "Failed to fetch watchlist" }, { status: 500 })
    }

    return Response.json({ watchlist: data || [] })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const { stockCode } = await request.json()

    if (!stockCode || typeof stockCode !== "string") {
      return Response.json({ error: "종목 코드가 필요합니다." }, { status: 400 })
    }

    const service = getServiceClient()
    const { error } = await service.from("watchlist").insert({
      user_id: user.id,
      stock_code: stockCode.slice(0, 20),
    })

    if (error?.code === "23505") {
      return Response.json({ error: "이미 관심 종목에 추가되어 있습니다." }, { status: 409 })
    }

    if (error) {
      return Response.json({ error: "추가 실패" }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const { stockCode } = await request.json()

    if (!stockCode) {
      return Response.json({ error: "종목 코드가 필요합니다." }, { status: 400 })
    }

    const service = getServiceClient()
    await service
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("stock_code", stockCode)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
