import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://steniofaz55.eteolabs.com.br";

  return [
    {
      changeFrequency: "never",
      lastModified: new Date("2026-05-04T00:00:00-03:00"),
      priority: 0.1,
      url: siteUrl,
    },
  ];
}
