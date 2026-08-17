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
    name: "Website Development",
    description:
      "Fast, responsive, conversion-focused websites built with Next.js and React. Designed and built in one place, optimized for search and for speed on every device.",
    deliverables: [
      "UX & UI design",
      "Next.js build",
      "Mobile responsive",
      "SEO & Core Web Vitals",
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
    id: "design",
    name: "Graphic Design & Branding",
    description:
      "Posters, ad creatives, and Instagram posts drawn from one consistent brand identity, so everything a business publishes is instantly recognizable.",
    deliverables: [
      "Brand identity",
      "Ad creatives",
      "Social posts",
      "Posters & print",
    ],
    priceRange: { min: 800, max: 6000, currency: "USD", unit: "project" },
    turnaround: "1–4 weeks",
    tiers: [
      { name: "Brand identity", description: "Logo, colors, type, guidelines", priceRange: { min: 800, max: 1600 } },
      { name: "Creative batch", description: "Posters, ads, social posts", priceRange: { min: 1200, max: 2400 } },
      { name: "Full brand system", description: "Identity plus a creative library", priceRange: { min: 3000, max: 6000 } },
    ],
  },
  {
    id: "video",
    name: "Video Editing",
    description:
      "Professional editing for Reels, promos, and short-form social video, with color grading, sound design, captions, and platform-specific delivery.",
    deliverables: [
      "Reels & shorts",
      "Promos",
      "Color & sound",
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
    name: "Cutting-Edge AI Solutions",
    description:
      "Custom AI avatars and high-quality AI-generated video for ads, explainers, and language versions - produced in days, without a film crew.",
    deliverables: [
      "Custom AI avatars",
      "Script to video",
      "Multi-language",
      "Ad variations",
    ],
    priceRange: { min: 900, max: 8000, currency: "USD", unit: "project" },
    turnaround: "2–5 weeks",
    tiers: [
      { name: "Pilot", description: "1 to 3 videos, one avatar", priceRange: { min: 900, max: 1800 } },
      { name: "Series", description: "4 to 8 videos or ad variations", priceRange: { min: 2200, max: 4000 } },
      { name: "At scale", description: "10+ videos, multi-language", priceRange: { min: 4500, max: 8000 } },
    ],
  },
  {
    id: "social",
    name: "Social Media Management",
    description:
      "End-to-end management of social media handles: content planning, scheduling, posting, community engagement, and account growth.",
    deliverables: [
      "Content calendar",
      "Scheduling & posting",
      "Community replies",
      "Growth reporting",
    ],
    priceRange: { min: 900, max: 5000, currency: "USD", unit: "month" },
    turnaround: "2–4 weeks to launch, then ongoing",
    tiers: [
      { name: "Light", description: "8 to 12 posts a month", priceRange: { min: 900, max: 1400 } },
      { name: "Growth", description: "16 to 20 posts, reels included", priceRange: { min: 1800, max: 2800 } },
      { name: "Always-on", description: "Daily posting plus community management", priceRange: { min: 3200, max: 5000 } },
    ],
  },
  {
    id: "ads",
    name: "Digital Marketing & Ads",
    description:
      "Targeted paid ad campaigns and marketing strategy built around the intended audience, then optimized against real numbers - clicks, leads, and sales.",
    deliverables: [
      "Ad campaigns",
      "Audience targeting",
      "Landing pages",
      "Monthly reporting",
    ],
    priceRange: { min: 800, max: 6500, currency: "USD", unit: "month" },
    turnaround: "1–3 weeks to launch, then ongoing",
    tiers: [
      { name: "One campaign", description: "A single channel, one goal", priceRange: { min: 800, max: 1500 } },
      { name: "Multi-channel", description: "Meta, Google, and beyond", priceRange: { min: 1800, max: 3500 } },
      { name: "Fully managed", description: "Strategy, creative, monthly tuning", priceRange: { min: 3500, max: 6500 } },
    ],
  },
];

export function GET() {
  const payload = {
    agency: "Digi Bear",
    url: SITE_URL,
    description:
      "Digi Bear is an all-in-one digital studio: Next.js web development, graphic design and branding, video editing, AI avatars and AI-generated video, social media management, and paid digital advertising.",
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
        tiktok: SOCIAL_LINKS.tiktok,
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
