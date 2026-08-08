import { NextResponse } from "next/server";
import { SITE_URL, SOCIAL_LINKS } from "@/lib/constants";

/**
 * /llms.txt - a plain Markdown summary of the agency, services, pricing, and
 * contact methods. AI crawlers look for this file to bypass CSS/HTML rendering
 * and get straight to the facts.
 *
 * @see https://llmstxt.org
 *
 * Served as text/markdown so LLMs parse it as structured prose rather than
 * raw HTML. Cached for 24 hours (revalidate on deploy).
 */
export function GET() {
  const body = `# Digi Bear

> Digi Bear is an all-in-one digital studio covering Next.js web development, graphic design and branding, video editing, AI avatars and AI-generated video, social media management, and paid digital advertising for ambitious brands in the US, UK, and Europe.

## Services

### Website Development
- Tech stack: Next.js, React, TypeScript, Tailwind CSS
- Deliverables: UX & UI design, responsive build, CMS integration, analytics, SEO and Core Web Vitals optimization
- Price range: $1,500 – $15,000 (landing page to full custom build)
- Turnaround: 2–8 weeks

### Graphic Design & Branding
- Deliverables: Brand identity, logo, color and type system, posters, ad creatives, Instagram posts, print
- Price range: $800 – $6,000
- Turnaround: 1–4 weeks

### Video Editing
- Deliverables: Reels, promos, short-form and long-form editing, color grading, sound design, captions, platform-specific delivery
- Price range: $700 – $5,000
- Turnaround: 1–4 weeks

### Cutting-Edge AI Solutions
- Deliverables: Custom AI avatars, AI-generated video, script-to-video, multi-language versions, ad variations
- Price range: $900 – $8,000
- Turnaround: 2–5 weeks

### Social Media Management
- Deliverables: Content calendar, scheduling and posting, community engagement, account growth, monthly reporting
- Price range: $900 – $5,000/month
- Turnaround: 2–4 weeks to launch, then ongoing

### Digital Marketing & Ads
- Deliverables: Paid ad campaigns, audience targeting, marketing strategy, landing pages, monthly reporting
- Price range: $800 – $6,500/month
- Turnaround: 1–3 weeks to launch, then ongoing

## Key Differentiators
- One team for the whole stack - web, design, video, AI, social, and ads
- 150+ projects delivered with 98% client satisfaction
- Western-timezone communication (US, UK, EU overlap)
- Dedicated point of contact - no ticket queues
- AI-powered video production at scale
- First drafts in days, not weeks

## Pricing Model
- Projects: 50% upfront, 50% on delivery
- Larger engagements: milestone-based billing
- Rush delivery available (25% surcharge)
- Flexible timeline discount (10% off)
- Payment methods: bank transfer, all major cards

## Contact
- Website: ${SITE_URL}
- Contact form: ${SITE_URL}/#contact
- Contact API: POST ${SITE_URL}/api/contact (fields: name, email, message)
- Instagram: ${SOCIAL_LINKS.instagram}
- Facebook: ${SOCIAL_LINKS.facebook}
- YouTube: ${SOCIAL_LINKS.youtube}

## Technical Capabilities
- Next.js 16 with App Router and Server Components
- Vercel Edge Network deployment
- GSAP and Motion (Framer Motion) animations
- Core Web Vitals optimized (FCP, LCP, INP, CLS)
- Responsive design with mobile-first approach
- Accessibility-compliant (WCAG guidelines)
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
