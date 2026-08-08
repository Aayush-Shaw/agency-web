/**
 * JSON-LD structured data for the entire site.
 *
 * Renders three schema.org blocks as `<script type="application/ld+json">`:
 *   1. Organization - who Digi Bear is, social profiles, contact
 *   2. Service ×5 - one per service vertical with Offer pricing
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

const BASE_URL = "https://digibearorg.com";

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
    "Digi Bear is a full-service digital studio specializing in Next.js web development, motion graphics, AI-generated video production, social media marketing, and professional video editing for ambitious brands in the US, UK, and Europe.",
  foundingDate: "2024",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    url: `${BASE_URL}/#contact`,
    availableLanguage: ["English"],
  },
  sameAs: [
    "https://instagram.com/digibear",
    "https://facebook.com/digibear",
    "https://youtube.com/@digibear",
  ],
  areaServed: [
    { "@type": "Place", name: "United States" },
    { "@type": "Place", name: "United Kingdom" },
    { "@type": "Place", name: "Europe" },
  ],
  knowsAbout: [
    "Next.js Web Development",
    "React Server Components",
    "AI-Generated Video",
    "Motion Graphics",
    "Social Media Marketing",
    "Video Editing",
    "Core Web Vitals Optimization",
    "Generative AI for Marketing",
  ],
};

/* ------------------------------------------------------------------ */
/*  Services (×5) with Offer pricing                                   */
/* ------------------------------------------------------------------ */

const services = [
  {
    id: "web-design-development",
    name: "Website Design & Development",
    description:
      "Fast, conversion-focused websites built with Next.js and React. Includes UX & UI design, CMS integration, analytics setup, and Core Web Vitals optimization. Accessible, SEO-ready, and performant on every device.",
    serviceType: "Web Development",
    minPrice: 1500,
    maxPrice: 15000,
    turnaround: "2–8 weeks",
  },
  {
    id: "social-media-marketing",
    name: "Social Media Marketing",
    description:
      "Strategy, content calendars, and paid campaigns tuned to your market. Includes post design, reel production, and monthly performance reporting measured by reach, engagement, and pipeline.",
    serviceType: "Digital Marketing",
    minPrice: 900,
    maxPrice: 5000,
    turnaround: "2–4 weeks to launch, ongoing monthly",
  },
  {
    id: "motion-graphics",
    name: "Motion Graphics",
    description:
      "Logo animations, explainer videos, and social motion built from a consistent brand kit. Includes titles, lower-thirds, and transitions so your brand moves the same everywhere.",
    serviceType: "Animation",
    minPrice: 600,
    maxPrice: 6500,
    turnaround: "1–5 weeks",
  },
  {
    id: "video-editing",
    name: "Video Editing",
    description:
      "Story-first editing for short-form and long-form content with professional color grading, sound design, captions, and delivery specs for every platform.",
    serviceType: "Video Production",
    minPrice: 700,
    maxPrice: 5000,
    turnaround: "1–4 weeks",
  },
  {
    id: "ai-generated-avatars-video",
    name: "AI-Generated Avatars & Video",
    description:
      "Lifelike AI presenters and generated scenes for ads, explainers, and localization. Scale video production without a film crew - produced in days, not weeks.",
    serviceType: "AI Video Production",
    minPrice: 900,
    maxPrice: 8000,
    turnaround: "2–5 weeks",
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
