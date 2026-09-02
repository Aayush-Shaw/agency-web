/**
 * Global site constants — single source of truth for the domain, social links,
 * and any URL derived from them. Change these once and every page, API route,
 * sitemap, robots.txt, and structured-data block picks it up automatically.
 */

export const SITE_URL = "https://www.digibearca.com";
// export const SITE_URL = "https://agency-web.vercel.app";

/** Bare hostname for display purposes (e.g. OG image watermark). */
export const SITE_DOMAIN = "digibearca.com";
// export const SITE_DOMAIN = "agency-web.vercel.app";

export const SOCIAL_LINKS = {
  website: SITE_URL,
  instagram: "https://instagram.com/digibearca",
  // facebook: "https://www.facebook.com/profile.php?id=61593288788864",
  facebook: "https://www.facebook.com/profile.php?id=61593873216929",
  youtube: "https://www.youtube.com/@digibearca",
  tiktok: "https://www.tiktok.com/@digibearca",
} as const;
