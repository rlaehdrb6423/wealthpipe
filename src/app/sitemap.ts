import type { MetadataRoute } from "next";

const SITE_URL = "https://wealthpipe.net";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
  ];
}
