import type { MetadataRoute } from "next";

/**
 * Programmatic robots.txt - tells search engines and AI crawlers what they can
 * access. AI-specific agents (GPTBot, ClaudeBot, etc.) are explicitly allowed
 * so the site is visible in LLM-generated recommendations.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      // Explicitly welcome AI crawlers so we appear in LLM answers.
      // Without these, some CDN / WAF defaults may block them.
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "PerplexityBot",
          "Bytespider",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://digibearorg.com/sitemap.xml",
  };
}
