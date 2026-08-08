import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private LAN ranges, so a new router-assigned IP doesn't break phone testing.
  allowedDevOrigins: ["10.*.*.*", "172.*.*.*", "192.168.*.*", "127.0.0.1"],

  // Ensure AI crawlers receive blocking (non-streamed) metadata so all <head>
  // tags are present in the initial HTML. The default list already covers
  // Googlebot, Bingbot, Twitterbot, and Slackbot — this extends it with
  // LLM-specific agents that need the same treatment.
  htmlLimitedBots:
    /Googlebot|Mediapartners-Google|AdsBot-Google|Google-PageRenderer|Bingbot|BingPreview|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|facebookexternalhit|Twitterbot|Slackbot|LinkedInBot|WhatsApp|TelegramBot|GPTBot|ChatGPT-User|ClaudeBot|anthropic-ai|Google-Extended|PerplexityBot|Bytespider|CCBot|Applebot|PetalBot/,
};

export default nextConfig;
