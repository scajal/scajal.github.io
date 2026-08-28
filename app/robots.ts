import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Agents and answer engines are welcome here: this is a portfolio, and being
 * quotable is the point. The named agents are listed explicitly rather than
 * left to the wildcard because several of them (Google-Extended, Applebot-
 * Extended) are opt-out by convention and read silence as a refusal.
 */
const AGENTS = [
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AGENTS, allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
