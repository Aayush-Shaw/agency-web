# Digi Bear

Design, video, and AI studio website built as a single-page Next.js marketing site.
The page presents five services in the interactive estimator and six services in
the machine-readable SEO/API catalog, including video editing.

## Quick start

Requirements: Node.js `>=20.9.0` and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

There is no `npm test` script. Before submitting changes, run `npm run lint`,
`npx tsc --noEmit`, and `npm run build` when the change affects the app or build.

## Edit the site

| Change | File |
| --- | --- |
| Page copy or section layout | `src/components/sections/*.tsx` |
| Services shown in the estimator | `src/lib/configurator.ts` and `src/components/sections/Services.tsx` |
| Estimator prices and timelines | `src/lib/estimatePricing.ts` |
| Site URL and social links | `src/lib/constants.ts` |
| Colors, typography, and spacing | `src/app/globals.css` |
| Portfolio media | `src/lib/media.ts`, `Hero.tsx`, and `Work.tsx` |

`src/components/sections/README.md` and `src/components/ui/README.md` describe
their directories in plain English.

## Project structure

```text
src/
├── app/                    # Routes, metadata, SEO files, and global styles
├── components/
│   ├── sections/           # Page bands, in page order
│   ├── seo/                # JSON-LD structured data
│   └── ui/                 # Reusable UI, motion, and pointer effects
└── lib/                    # Config, pricing, constants, animation, and media

public/
├── digibear-logo.svg
├── work/                   # Local portfolio images
└── vid/                    # Local grid, popup, and poster media
```

The page order is defined in `src/app/page.tsx`. `Pricing.tsx` is intentionally
parked; the re-enable checklist is in the sections README.

## Stack and design notes

- Next.js 16 App Router with React 19 and TypeScript 5
- Tailwind CSS 4, with tokens defined in `src/app/globals.css`
- GSAP + ScrollTrigger for scroll-linked motion
- Motion for springs and pointer-driven effects
- Lenis for smooth scrolling
- Questrial for display type and Poppins for body copy
- Lucide React for utility icons; brand marks are inline SVG

The site uses one light palette. Most animated UI respects
`prefers-reduced-motion`; `Process.tsx` is the documented exception because its
scroll-driven arc is part of the section layout.

## SEO and AI-readable content

Keep these files aligned when a service, price, URL, or public claim changes:

| File | Output |
| --- | --- |
| `src/app/sitemap.ts` | `/sitemap.xml` |
| `src/app/robots.ts` | `/robots.txt` |
| `src/app/llms.txt/route.ts` | `/llms.txt` |
| `src/app/api/services/route.ts` | JSON service catalog |
| `src/components/seo/JsonLd.tsx` | Organization, Service, and FAQ schema |
| `src/app/opengraph-image.tsx` | Link-preview image |

The estimator currently has five selectable services. The API, `llms.txt`, and
JSON-LD catalog six, because video editing is represented there even though it
is not currently selectable in the estimator. Adding or removing a service
requires checking all six files above plus the estimator files.

## Contact API

```http
POST /api/contact
Content-Type: application/json

{"name":"Ada","email":"ada@example.com","message":"Hello Digi Bear","website":""}
```

`name` is 2–100 characters, `email` is at most 200 characters, and `message` is
10–2,000 characters. The hidden `website` field is a honeypot. The endpoint
allows three requests per IP in ten minutes and returns `429` after that.

Valid submissions are sent through EmailJS. Production deployments need:
`EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and
`EMAILJS_PRIVATE_KEY`. The rate limiter is intentionally in-process; use a
shared store or edge rate limiting before handling meaningful traffic.

## Deployment

The app can deploy to Vercel without additional configuration:

```bash
npm run build && npm run start
```

Set the production URL once in `src/lib/constants.ts`; metadata, sitemap,
robots, structured data, and API responses use it.

## License

Private and unlicensed. All rights reserved.
