import type { Metadata } from "next"
import Link from "next/link"
import { getServiceClient } from "@/lib/supabase"

const SITE_URL = "https://wealthpipe.net"

export const metadata: Metadata = {
  title: "블로그 — WealthPipe",
  description: "키워드 분석 팁, 블로그 수익화 전략, SEO 가이드를 확인하세요.",
  alternates: {
    canonical: `${SITE_URL}/ko/blog`,
    languages: { en: `${SITE_URL}/blog`, ko: `${SITE_URL}/ko/blog` },
  },
  openGraph: {
    title: "블로그 — WealthPipe",
    description: "키워드 분석 팁, 블로그 수익화 전략, SEO 가이드.",
    url: `${SITE_URL}/ko/blog`,
    locale: "ko_KR",
  },
}

export const revalidate = 3600

export default async function KoBlogPage() {
  const supabase = getServiceClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, description, tags, created_at")
    .eq("published", true)
    .eq("locale", "ko")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/ko" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>
            ← 홈
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 12, marginBottom: 8 }}>블로그</h1>
          <p style={{ color: "#888", fontSize: 14 }}>
            키워드 분석 팁, 블로그 수익화 전략, SEO 가이드.
          </p>
        </div>

        {!posts || posts.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>아직 글이 없습니다. 곧 업데이트됩니다!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/ko/blog/${post.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #1a1a1a",
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{post.title}</h2>
                  <p style={{ color: "#888", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                    {post.description}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#555", fontSize: 12 }}>
                      {new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    {post.tags?.map((tag: string) => (
                      <span key={tag} style={{ fontSize: 11, color: "#888", background: "#111", padding: "2px 8px", borderRadius: 4 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
