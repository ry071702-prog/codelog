// 検索エンジンにページ一覧を伝える sitemap（/sitemap.xml）。

import type { MetadataRoute } from "next";
import { lessons } from "@/lib/lessons";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/glossary`, priority: 0.8 },
    { url: `${siteUrl}/settings`, priority: 0.3 },
    ...lessons.map((l) => ({
      url: `${siteUrl}/lessons/${l.id}`,
      priority: 0.6,
    })),
  ];
}
