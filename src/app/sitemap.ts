import type { MetadataRoute } from "next";

/**
 * Programmatic sitemap - currently a single-page site, so one entry. When
 * dedicated service pages are added (e.g. /services/ai-generated-video),
 * extend this array or switch to generateSitemaps() for scale.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://digibearorg.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
