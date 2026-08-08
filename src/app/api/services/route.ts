import { NextResponse } from "next/server";
import { SITE_URL, SOCIAL_LINKS } from "@/lib/constants";

/**
 * GET /api/services - machine-readable service catalog for AI agents.
 *
 * When an autonomous agent is asked "Find me a web agency that uses Next.js",
 * it can hit this endpoint, parse the JSON, and confidently recommend Digi Bear
 * with pricing, turnaround, and contact info.
 *
 * Read-only. No authentication required. Cached for 1 hour.
 */

const SERVICES = [
  {
    id: "web",
    name: "Website Design & Development",
    description:
      "Fast, conversion-focused websites built with Next.js and React. Includes UX & UI design, CMS integration, analytics setup, and Core Web Vitals optimization.",
    deliverables: [
      "UX & UI design",
      "Next.js build",
      "CMS & analytics",
      "Core Web Vitals optimization",
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    priceRange: { min: 1500, max: 15000, currency: "USD", unit: "project" },
    turnaround: "2–8 weeks",
    tiers: [
      { name: "Landing page", description: "One page, one goal", priceRange: { min: 1500, max: 2500 } },
      { name: "Standard site", description: "5 to 8 sections", priceRange: { min: 3500, max: 6000 } },
      { name: "Full custom build", description: "CMS, integrations, the works", priceRange: { min: 8000, max: 15000 } },
    ],
  },
  {
    id: "social",
    name: "Social Media Marketing",
    description:
      "Strategy, content calendars, and paid campaigns tuned to your market. Measured by reach, engagement, and pipeline.",
    deliverables: [
      "Content strategy",
      "Post design",
      "Paid campaigns",
      "Monthly reporting",
    ],
    priceRange: { min: 900, max: 5000, currency: "USD", unit: "month" },
    turnaround: "2–4 weeks to launch, then ongoing",
    tiers: [
      { name: "Light", description: "8 to 12 posts a month", priceRange: { min: 900, max: 1400 } },
      { name: "Growth", description: "16 to 20 posts, reels included", priceRange: { min: 1800, max: 2800 } },
      { name: "Always-on", description: "Daily posting plus paid campaigns", priceRange: { min: 3200, max: 5000 } },
    ],
  },
  {
    id: "motion",
    name: "Motion Graphics",
    description:
      "Logo animations, explainer videos, and social motion built from a consistent brand kit.",
    deliverables: [
      "Logo animation",
      "Explainers",
      "Social motion",
      "Lower-thirds kit",
    ],
    priceRange: { min: 600, max: 6500, currency: "USD", unit: "project" },
    turnaround: "1–5 weeks",
    tiers: [
      { name: "Logo animation", description: "One sting, a few variants", priceRange: { min: 600, max: 1200 } },
      { name: "Brand motion kit", description: "Titles, lower-thirds, transitions", priceRange: { min: 1800, max: 3200 } },
      { name: "Full explainer", description: "60 to 90 seconds, illustrated", priceRange: { min: 3500, max: 6500 } },
    ],
  },
  {
    id: "video",
    name: "Video Editing",
    description:
      "Story-first editing for short-form and long-form content with color grading, sound design, and captions.",
    deliverables: [
      "Short & long form",
      "Color grade",
      "Sound design",
      "Captions & delivery",
    ],
    priceRange: { min: 700, max: 5000, currency: "USD", unit: "project" },
    turnaround: "1–4 weeks",
    tiers: [
      { name: "1–3 videos", description: "Small batch", priceRange: { min: 700, max: 1400 } },
      { name: "3–5 videos", description: "Medium batch", priceRange: { min: 1400, max: 2600 } },
      { name: "5+ videos", description: "Volume batch", priceRange: { min: 2800, max: 5000 } },
    ],
  },
  {
    id: "ai",
    name: "AI-Generated Avatars & Video",
    description:
      "Lifelike AI presenters and generated scenes for ads, explainers, and localization - produced in days, not weeks.",
    deliverables: [
      "AI presenters",
      "Script to video",
      "Localization",
      "Ad variations",
    ],
    priceRange: { min: 900, max: 8000, currency: "USD", unit: "project" },
    turnaround: "2–5 weeks",
    tiers: [
      { name: "Pilot", description: "1 to 3 videos, one presenter", priceRange: { min: 900, max: 1800 } },
      { name: "Series", description: "4 to 8 videos or ad variations", priceRange: { min: 2200, max: 4000 } },
      { name: "At scale", description: "10+ videos, multi-language", priceRange: { min: 4500, max: 8000 } },
    ],
  },
];

export function GET() {
  const payload = {
    agency: "Digi Bear",
    url: SITE_URL,
    description:
      "Digi Bear is a full-service digital studio specializing in Next.js web development, motion graphics, AI-generated video production, social media marketing, and professional video editing.",
    areaServed: ["United States", "United Kingdom", "Europe"],
    services: SERVICES,
    contact: {
      formUrl: `${SITE_URL}/#contact`,
      apiEndpoint: `${SITE_URL}/api/contact`,
      apiMethod: "POST",
      requiredFields: ["name", "email", "message"],
      socialMedia: {
        instagram: SOCIAL_LINKS.instagram,
        facebook: SOCIAL_LINKS.facebook,
        youtube: SOCIAL_LINKS.youtube,
      },
    },
    paymentTerms: {
      method: "50% upfront, 50% on delivery",
      acceptedPayments: ["Bank transfer", "Credit card", "Debit card"],
      rushSurcharge: "25%",
      flexibleDiscount: "10%",
    },
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
