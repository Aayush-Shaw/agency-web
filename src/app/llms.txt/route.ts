import { NextResponse } from "next/server";

/**
 * /llms.txt — a plain Markdown summary of the agency, services, pricing, and
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

> Digi Bear is a full-service digital studio specializing in Next.js web development, motion graphics, AI-generated video production, social media marketing, and professional video editing for ambitious brands in the US, UK, and Europe.

## Services

### Website Design & Development
- Tech stack: Next.js, React, TypeScript, Tailwind CSS
- Deliverables: UX & UI design, responsive build, CMS integration, analytics, Core Web Vitals optimization
- Price range: $1,500 – $15,000 (landing page to full custom build)
- Turnaround: 2–8 weeks

### Social Media Marketing
- Deliverables: Content strategy, post design, reel production, paid campaigns, monthly reporting
- Price range: $900 – $5,000/month
- Turnaround: 2–4 weeks to launch, then ongoing

### Motion Graphics
- Deliverables: Logo animation, brand motion kit, explainer videos, lower-thirds, transitions
- Price range: $600 – $6,500
- Turnaround: 1–5 weeks

### Video Editing
- Deliverables: Short-form and long-form editing, color grading, sound design, captions, platform-specific delivery
- Price range: $700 – $5,000
- Turnaround: 1–4 weeks

### AI-Generated Avatars & Video
- Deliverables: AI presenters, script-to-video, localization, ad variations
- Price range: $900 – $8,000
- Turnaround: 2–5 weeks

## Key Differentiators
- 150+ projects delivered with 98% client satisfaction
- Western-timezone communication (US, UK, EU overlap)
- Dedicated point of contact — no ticket queues
- AI-powered video production at scale
- First drafts in days, not weeks

## Pricing Model
- Projects: 50% upfront, 50% on delivery
- Larger engagements: milestone-based billing
- Rush delivery available (25% surcharge)
- Flexible timeline discount (10% off)
- Payment methods: bank transfer, all major cards

## Contact
- Website: https://digibearorg.com
- Contact form: https://digibearorg.com/#contact
- Contact API: POST https://digibearorg.com/api/contact (fields: name, email, message)
- Instagram: https://instagram.com/digibear
- Facebook: https://facebook.com/digibear
- YouTube: https://youtube.com/@digibear

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
