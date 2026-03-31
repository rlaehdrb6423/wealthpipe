import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getServiceClient } from "@/lib/supabase"

const SITE_URL = "https://wealthpipe.net"

type Props = {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Not Found" }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${SITE_URL}/ko/blog/${slug}`,
      languages: {
        en: `${SITE_URL}/blog/${slug}`,
        ko: `${SITE_URL}/ko/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/ko/blog/${slug}`,
      locale: "ko_KR",
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
  }
}

export const revalidate = 3600

export default async function KoBlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/ko/blog/${slug}`,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "WealthPipe" },
    publisher: { "@type": "Organization", name: "WealthPipe", url: SITE_URL },
    inLanguage: "ko",
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        <Link href="/ko/blog" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>
          ← 블로그
        </Link>

        <article style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>{post.title}</h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center", color: "#666", fontSize: 13 }}>
              <span>{new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
              {post.tags?.map((tag: string) => (
                <span key={tag} style={{ background: "#111", padding: "2px 8px", borderRadius: 4, fontSize: 11, color: "#888" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{ fontSize: 15, lineHeight: 2.0, color: "#ccc", textAlign: "center" }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* 키워드 분석기 CTA */}
        <div style={{
          marginTop: 48,
          padding: 24,
          background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
          border: "1px solid #222",
          borderRadius: 12,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            무료 키워드 분석기 사용해보기
          </p>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
            검색량, 경쟁도, AI 블로그 글 구조 추천까지 한 번에.
          </p>
          <Link
            href="/ko/tools/keyword"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#fff",
              color: "#000",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            키워드 분석하기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
