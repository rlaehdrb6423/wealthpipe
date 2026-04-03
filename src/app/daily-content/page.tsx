import { getServiceClient } from "@/lib/supabase"
import type { Metadata } from "next"
import CopyButton from "./CopyButton"

export const metadata: Metadata = {
  title: "Daily Content — WealthPipe",
  robots: "noindex, nofollow",
}

export const revalidate = 0

interface DailyContentRow {
  id: string
  keyword: string
  platform: string
  title: string | null
  content: string
  tags: string[]
  wp_post_id: number | null
  wp_post_url: string | null
  created_at: string
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  naver_blog: { label: "네이버 블로그", color: "#03c75a" },
  wordpress: { label: "워드프레스", color: "#21759b" },
  threads: { label: "Threads", color: "#000" },
  x: { label: "X", color: "#1da1f2" },
}

const ANGLE_LABELS: Record<string, string> = {
  meme: "밈/개그",
  info: "정보",
  mix: "밈+정보",
}

export default async function DailyContentPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const date = params.date || new Date().toISOString().split("T")[0]
  const supabase = getServiceClient()

  const { data: items } = await supabase
    .from("daily_content")
    .select("*")
    .gte("created_at", `${date}T00:00:00Z`)
    .lt("created_at", `${date}T23:59:59Z`)
    .order("created_at", { ascending: true })
    .returns<DailyContentRow[]>()

  const grouped: Record<string, DailyContentRow[]> = {}
  for (const item of items || []) {
    if (!grouped[item.platform]) grouped[item.platform] = []
    grouped[item.platform].push(item)
  }

  const keyword = items?.[0]?.keyword || "-"

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "24px 16px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Daily Content</h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
          {date} &middot; 키워드: {keyword}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {(() => {
            const d = new Date(date)
            const prev = new Date(d.getTime() - 86400000).toISOString().split("T")[0]
            const next = new Date(d.getTime() + 86400000).toISOString().split("T")[0]
            return (
              <>
                <a href={`/daily-content?date=${prev}`} style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>
                  &larr; 이전
                </a>
                <a href="/daily-content" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>
                  오늘
                </a>
                <a href={`/daily-content?date=${next}`} style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>
                  다음 &rarr;
                </a>
              </>
            )
          })()}
        </div>

        {!items || items.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>이 날짜에 생성된 콘텐츠가 없습니다.</p>
        ) : (
          Object.entries(PLATFORM_LABELS).map(([platform, { label, color }]) => {
            const platformItems = grouped[platform]
            if (!platformItems) return null
            return (
              <section key={platform} style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {label}
                  {platform === "wordpress" && platformItems[0]?.wp_post_url && (
                    <a
                      href={platformItems[0].wp_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#888", fontWeight: 400, textDecoration: "underline" }}
                    >
                      발행됨
                    </a>
                  )}
                </h2>

                {platformItems.map((item) => (
                  <ContentCard key={item.id} item={item} platform={platform} />
                ))}
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}

function ContentCard({ item, platform }: { item: DailyContentRow; platform: string }) {
  const isBlog = platform === "naver_blog" || platform === "wordpress"
  const angleLabel = !isBlog && item.title ? ANGLE_LABELS[item.title] || item.title : null

  return (
    <article
      style={{
        background: "#0a0a0a",
        border: "1px solid #1a1a1a",
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
      }}
    >
      {angleLabel && (
        <span style={{ fontSize: 11, color: "#aaa", background: "#1a1a1a", padding: "2px 8px", borderRadius: 4, marginBottom: 8, display: "inline-block" }}>
          {angleLabel}
        </span>
      )}

      {isBlog && item.title && (
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{item.title}</h3>
      )}

      {isBlog ? (
        <div
          style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8, maxHeight: 300, overflow: "auto" }}
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      ) : (
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {item.content}
        </p>
      )}

      {item.tags && item.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {item.tags.map((tag) => (
            <span key={tag} style={{ fontSize: 11, color: "#888", background: "#111", padding: "2px 8px", borderRadius: 4 }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <CopyButton text={item.title ? `${item.title}\n\n${item.content}` : item.content} />
    </article>
  )
}

