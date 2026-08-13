import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

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
      // Google splits its AI fetching across several tokens - Google-Extended
      // alone only covers Gemini grounding/training, not the product bots that
      // fetch on demand, so all four are named.
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "GoogleOther",
          "Google-CloudVertexBot",
          "Google-NotebookLM",
          "PerplexityBot",
          "Bytespider",
          "CCBot",
        ],
        allow: "/",
        // A named group replaces the "*" group entirely, so /api/ has to be
        // repeated here or these bots would start crawling the API routes.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
