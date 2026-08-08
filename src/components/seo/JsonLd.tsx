/**
 * JSON-LD structured data for the entire site.
 *
 * Renders three schema.org blocks as `<script type="application/ld+json">`:
 *   1. Organization - who Digi Bear is, social profiles, contact
 *   2. Service ×6 - one per service vertical with Offer pricing
 *   3. FAQPage - the five questions from the FAQ section
 *
 * Server component - no "use client". Runs at build/request time and outputs
 * static HTML that crawlers and AI agents can parse without executing JS.
 *
 * Pricing ranges are hardcoded from estimatePricing.ts rather than imported,
 * because the schema needs the absolute min/max across all tiers per service,
 * and importing the module would couple structured data to the estimator's
 * internal key format. If rates change, update both.
 */

import { SITE_URL, SOCIAL_LINKS } from "@/lib/constants";

const BASE_URL = SITE_URL;

/* ------------------------------------------------------------------ */
/*  Organization                                                       */
/* ------------------------------------------------------------------ */

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "Digi Bear",
  url: BASE_URL,
  logo: `${BASE_URL}/digibear-logo.svg`,
  description:
    "Digi Bear is an all-in-one digital studio covering Next.js web development, graphic design and branding, video editing, AI avatars and AI-generated video, social media management, and paid digital advertising for ambitious brands in the US, UK, and Europe.",
  foundingDate: "2024",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    url: `${BASE_URL}/#contact`,
    availableLanguage: ["English"],
  },
  sameAs: Object.values(SOCIAL_LINKS),
  areaServed: [
    { "@type": "Place", name: "United States" },
    { "@type": "Place", name: "United Kingdom" },
    { "@type": "Place", name: "Europe" },
  ],
  knowsAbout: [
    "Next.js Web Development",
    "React Server Components",
    "Graphic Design",
    "Brand Identity Design",
    "Video Editing",
    "AI Avatars",
    "AI-Generated Video",
    "Social Media Management",
    "Paid Advertising",
    "Core Web Vitals Optimization",
    "Generative AI for Marketing",
  ],
};

/* ------------------------------------------------------------------ */
/*  Services (×6) with Offer pricing                                   */
/* ------------------------------------------------------------------ */

const services = [
  {
    id: "website-development",
    name: "Website Development",
    description:
      "Fast, responsive, conversion-focused websites built with Next.js and React. Includes UX & UI design, CMS integration, analytics setup, SEO, and Core Web Vitals optimization - accessible and performant on every device.",
    serviceType: "Web Development",
    minPrice: 1500,
    maxPrice: 15000,
    turnaround: "2–8 weeks",
  },
  {
    id: "graphic-design-branding",
    name: "Graphic Design & Branding",
    description:
      "Brand identity, posters, ad creatives, and Instagram post design drawn from one consistent visual system, so everything a business publishes is instantly recognizable.",
    serviceType: "Graphic Design",
    minPrice: 800,
    maxPrice: 6000,
    turnaround: "1–4 weeks",
  },
  {
    id: "video-editing",
    name: "Video Editing",
    description:
      "Professional editing for Reels, promos, and short-form and long-form video, with color grading, sound design, captions, and delivery specs for every platform.",
    serviceType: "Video Production",
    minPrice: 700,
    maxPrice: 5000,
    turnaround: "1–4 weeks",
  },
  {
    id: "ai-avatars-video",
    name: "Cutting-Edge AI Solutions",
    description:
      "Custom AI avatars and high-quality AI-generated video for ads, explainers, and language versions. Scale video production without a film crew - produced in days, not weeks.",
    serviceType: "AI Video Production",
    minPrice: 900,
    maxPrice: 8000,
    turnaround: "2–5 weeks",
  },
  {
    id: "social-media-management",
    name: "Social Media Management",
    description:
      "End-to-end management of social media handles: content planning, scheduling, posting, community engagement, account growth, and monthly performance reporting.",
    serviceType: "Social Media Marketing",
    minPrice: 900,
    maxPrice: 5000,
    turnaround: "2–4 weeks to launch, ongoing monthly",
  },
  {
    id: "digital-marketing-ads",
    name: "Digital Marketing & Ads",
    description:
      "Targeted paid ad campaigns and marketing strategy built around the intended audience, then optimized against real numbers - clicks, leads, and sales.",
    serviceType: "Digital Marketing",
    minPrice: 800,
    maxPrice: 6500,
    turnaround: "1–3 weeks to launch, ongoing monthly",
  },
];

const serviceSchemas = services.map((s) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE_URL}/#service-${s.id}`,
  name: s.name,
  description: s.description,
  serviceType: s.serviceType,
  provider: { "@id": `${BASE_URL}/#organization` },
  url: `${BASE_URL}/#services`,
  areaServed: ["US", "GB", "EU"],
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: s.minPrice,
    highPrice: s.maxPrice,
    offerCount: 3,
    description: `Starting from $${s.minPrice}. Typical turnaround: ${s.turnaround}.`,
    url: `${BASE_URL}/#contact`,
  },
}));

/* ------------------------------------------------------------------ */
/*  FAQPage                                                            */
/* ------------------------------------------------------------------ */

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How fast is your turnaround?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on scope, but first drafts usually land in a few days. Most projects wrap in two to four weeks, and we agree on the timeline before we start so there are no surprises.",
      },
    },
    {
      "@type": "Question",
      name: "What's your revisions policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every project includes revision rounds, and the count is agreed in your scope before anything starts. We iterate until the work is right rather than nickel-and-diming each change.",
      },
    },
    {
      "@type": "Question",
      name: "How do you handle payment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bank transfer and all major cards. We bill 50% upfront to book the work and 50% on delivery. Larger engagements split into milestones instead.",
      },
    },
    {
      "@type": "Question",
      name: "How do you handle communication?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We work your hours across US, UK, and EU timezones. You get one dedicated point of contact, async updates as we go, and scheduled calls whenever you want a live review.",
      },
    },
    {
      "@type": "Question",
      name: "Who owns the final deliverables?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You do. On final payment you receive full ownership plus the source files - designs, project files, and footage. No lock-in, no licensing games.",
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/** Renders all JSON-LD blocks. Drop into layout.tsx inside <body>. */
export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      {serviceSchemas.map((schema) => (
        <script
          key={schema["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
