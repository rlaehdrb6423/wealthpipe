const WP_URL = process.env.WP_URL?.replace(/\/$/, "") || ""
const WP_USERNAME = process.env.WP_USERNAME || ""
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || ""

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString("base64")
}

async function wpFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${WP_URL}/wp-json/wp/v2${path}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`WP API ${res.status}: ${body}`)
  }
  return res.json()
}

async function getOrCreateTags(tagNames: string[]): Promise<number[]> {
  const ids: number[] = []
  for (const name of tagNames) {
    try {
      const existing = await wpFetch(`/tags?search=${encodeURIComponent(name)}`)
      if (existing.length > 0) {
        ids.push(existing[0].id)
        continue
      }
    } catch { /* ignore */ }

    try {
      const created = await wpFetch("/tags", {
        method: "POST",
        body: JSON.stringify({ name }),
      })
      ids.push(created.id)
    } catch { /* skip failed tag */ }
  }
  return ids
}

export async function publishToWordPress(post: {
  title: string
  content: string
  excerpt?: string
  tags?: string[]
}): Promise<{ id: number; url: string }> {
  if (!WP_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
    throw new Error("WordPress credentials not configured")
  }

  const tagIds = post.tags ? await getOrCreateTags(post.tags) : []

  const result = await wpFetch("/posts", {
    method: "POST",
    body: JSON.stringify({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      status: "publish",
      tags: tagIds,
      comment_status: "open",
    }),
  })

  return { id: result.id, url: result.link }
}
