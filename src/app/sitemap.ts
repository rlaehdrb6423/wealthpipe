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
  ];

  // 캐시된 키워드 퍼머링크 페이지 동적 추가
  let keywordRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = getServiceClient();
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

  return [...staticRoutes, ...keywordRoutes];
}
