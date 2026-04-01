import type { MetadataRoute } from "next";
import { getServiceClient } from "@/lib/supabase";

const SITE_URL = "https://wealthpipe.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: { en: SITE_URL, ko: `${SITE_URL}/ko` },
      },
    },
    {
      url: `${SITE_URL}/ko`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: { en: SITE_URL, ko: `${SITE_URL}/ko` },
      },
    },
    {
      url: `${SITE_URL}/tools/keyword`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/keyword`,
          ko: `${SITE_URL}/ko/tools/keyword`,
        },
      },
    },
    {
      url: `${SITE_URL}/ko/tools/keyword`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/keyword`,
          ko: `${SITE_URL}/ko/tools/keyword`,
        },
      },
    },
    {
      url: `${SITE_URL}/tools/keyword/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/keyword/compare`,
          ko: `${SITE_URL}/ko/tools/keyword/compare`,
        },
      },
    },
    {
      url: `${SITE_URL}/ko/tools/keyword/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/keyword/compare`,
          ko: `${SITE_URL}/ko/tools/keyword/compare`,
        },
      },
    },
    {
      url: `${SITE_URL}/tools/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/news`,
          ko: `${SITE_URL}/ko/tools/news`,
        },
      },
    },
    {
      url: `${SITE_URL}/ko/tools/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/news`,
          ko: `${SITE_URL}/ko/tools/news`,
        },
      },
    },
    {
      url: `${SITE_URL}/tools/signals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/signals`,
          ko: `${SITE_URL}/ko/tools/signals`,
        },
      },
    },
    {
      url: `${SITE_URL}/ko/tools/signals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/signals`,
          ko: `${SITE_URL}/ko/tools/signals`,
        },
      },
    },
    {
      url: `${SITE_URL}/tools/ranking`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/ranking`,
          ko: `${SITE_URL}/ko/tools/ranking`,
        },
      },
    },
    {
      url: `${SITE_URL}/ko/tools/ranking`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/tools/ranking`,
          ko: `${SITE_URL}/ko/tools/ranking`,
        },
      },
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/blog`,
          ko: `${SITE_URL}/ko/blog`,
        },
      },
    },
    {
      url: `${SITE_URL}/ko/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE_URL}/blog`,
          ko: `${SITE_URL}/ko/blog`,
        },
      },
    },
  ];

  const supabase = getServiceClient();

  // 캐시된 키워드 퍼머링크 페이지 동적 추가
  let keywordRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabase
      .from("keyword_cache")
      .select("keyword, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (data) {
      keywordRoutes = data.flatMap((row) => {
        const encoded = encodeURIComponent(row.keyword);
        return [
          {
            url: `${SITE_URL}/tools/keyword/${encoded}`,
            lastModified: new Date(row.created_at),
            changeFrequency: "weekly" as const,
            priority: 0.6,
            alternates: {
              languages: {
                en: `${SITE_URL}/tools/keyword/${encoded}`,
                ko: `${SITE_URL}/ko/tools/keyword/${encoded}`,
              },
            },
          },
          {
            url: `${SITE_URL}/ko/tools/keyword/${encoded}`,
            lastModified: new Date(row.created_at),
            changeFrequency: "weekly" as const,
            priority: 0.5,
            alternates: {
              languages: {
                en: `${SITE_URL}/tools/keyword/${encoded}`,
                ko: `${SITE_URL}/ko/tools/keyword/${encoded}`,
              },
            },
          },
        ];
      });
    }
  } catch {
    // Supabase 연결 실패 시 정적 라우트만 반환
  }

  // 블로그 포스트 동적 추가
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, locale, updated_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(200);

    if (posts) {
      blogRoutes = posts.map((post) => {
        const prefix = post.locale === "ko" ? "/ko" : "";
        return {
          url: `${SITE_URL}${prefix}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.6,
          alternates: {
            languages: {
              en: `${SITE_URL}/blog/${post.slug}`,
              ko: `${SITE_URL}/ko/blog/${post.slug}`,
            },
          },
        };
      });
    }
  } catch {
    // Blog query failed, continue without blog routes
  }

  return [...staticRoutes, ...keywordRoutes, ...blogRoutes];
}
