import { NextRequest } from "next/server"
import { getServiceClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const adminKey = request.headers.get("x-admin-key") || ""
  if (adminKey !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug, title, description, content, tags, locale, published } = await request.json()

  if (!slug || !title || !content) {
    return Response.json({ error: "slug, title, content are required" }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("blog_posts")
    .upsert(
      {
        slug,
        title,
        description: description || "",
        content,
        tags: tags || [],
        locale: locale || "ko",
        published: published ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    )
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true, post: data })
}

export async function GET() {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, locale, published, created_at")
    .order("created_at", { ascending: false })

  return Response.json({ posts: data || [] })
}
