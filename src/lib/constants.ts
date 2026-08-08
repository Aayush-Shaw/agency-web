/**
 * Global site constants — single source of truth for the domain, social links,
 * and any URL derived from them. Change these once and every page, API route,
 * sitemap, robots.txt, and structured-data block picks it up automatically.
 */

// export const SITE_URL = "https://digibearorg.com";
export const SITE_URL = "https://agency-web.vercel.app";

/** Bare hostname for display purposes (e.g. OG image watermark). */
// export const SITE_DOMAIN = "digibearorg.com";
export const SITE_DOMAIN = "agency-web.vercel.app";

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/digibear",
  facebook: "https://facebook.com/digibear",
  youtube: "https://youtube.com/@digibear",
} as const;
