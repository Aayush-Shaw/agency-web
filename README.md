<div align="center">

# 🐻 Digital Bear

**Design, Motion & AI Video Studio**

A single-page marketing site for a full-service digital studio — website design &
development, social media marketing, motion graphics, video editing, and
AI-generated avatars & video.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=black)](https://gsap.com)

</div>

---

## Overview

One page, thirteen sections, scroll-driven throughout. The visual language is warm
and editorial — cream and espresso, honey amber accents, film grain over a fixed
atmospheric backdrop — with long, low-travel GSAP transitions that read as
expensive rather than busy.

Light and dark themes ship as pure `prefers-color-scheme` CSS: no toggle, no JS,
no flash of the wrong theme.

## Tech stack

| Layer      | Choice                          | Why                                                     |
| ---------- | ------------------------------- | ------------------------------------------------------- |
| Framework  | Next.js 16 (App Router)         | Server Components, file-based routing, image pipeline    |
| UI         | React 19 + TypeScript 5         | Strict types across components and the API route         |
| Styling    | Tailwind CSS v4                 | CSS-first config; tokens defined in `globals.css`        |
| Motion     | GSAP 3 + ScrollTrigger          | Scroll-linked reveals, registered once client-side       |
| Scrolling  | Lenis                           | Smooth scroll, wired through `<SmoothScroll>`            |
| Typography | Space Grotesk (display) + Inter | Loaded via `next/font/google`, self-hosted, zero CLS     |
| Tooling    | ESLint 9 + Playwright           | `eslint-config-next`; Playwright for design-ref captures |

## Getting started

**Prerequisites** — Node.js `>=20.9.0` (Next 16 requirement) and npm.

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required to run the site — the contact endpoint is
provider-less by design (see [Contact API](#contact-api)).

### Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start the development server            |
| `npm run build` | Production build                        |
| `npm run start` | Serve the production build              |
| `npm run lint`  | Lint with ESLint + `eslint-config-next` |

## Project structure

```
src/
├── app/
│   ├── api/contact/route.ts   # POST handler — validation + honeypot
│   ├── globals.css            # Design tokens, base styles, utilities
│   ├── layout.tsx             # Fonts, metadata, viewport, atmosphere + grain
│   └── page.tsx               # Composes the thirteen page sections
├── components/                # One file per section, plus shared primitives
│   ├── Navbar · Hero · Manifesto · Services · Work · WhyUs · Process
│   ├── Pricing · Reviews · Trust · Faq · Cta · Footer
│   └── Eyebrow · Reveal · SmoothScroll     # shared: label, reveal, Lenis
└── lib/
    └── gsap.ts                # Single GSAP/ScrollTrigger registration point

public/
├── avatars/                   # Reviewer avatars (local SVG)
└── work/                      # Portfolio thumbnails (local SVG)

docs/
└── design-reference-notes.md  # Phase 1 research: measured motion from references
```

## Design system

All design tokens live in `src/app/globals.css` as CSS custom properties and are
exposed to Tailwind via `@theme inline`, so utilities like `bg-bg`, `text-text`
and `border-border` always resolve to the live theme value.

| Token                   | Light     | Dark      |
| ----------------------- | --------- | --------- |
| `--raw-bg`              | `#FBF3E7` | `#17120D` |
| `--raw-surface`         | `#F3E6D3` | `#1F1810` |
| `--raw-text`            | `#2B1D14` | `#F5ECDD` |
| `--raw-accent-primary`  | `#C9822E` | `#E8A33D` |

**Motion.** `src/lib/gsap.ts` registers GSAP plugins exactly once, client-only,
and sets the house defaults — `duration: 0.9`, `ease: "power3.out"`. Long duration
with short travel is the whole trick; the measurements behind it are in
[`docs/design-reference-notes.md`](docs/design-reference-notes.md).

**Images.** `dangerouslyAllowSVG` is enabled in `next.config.ts` because every
asset under `public/` is a first-party SVG. Serve remote SVG through this
pipeline and that assumption breaks — swap to raster or disable the flag first.

## Contact API

```http
POST /api/contact
Content-Type: application/json

{ "name": "Ada", "email": "ada@example.com", "message": "…", "website": "" }
```

| Field     | Rules                                            |
| --------- | ------------------------------------------------ |
| `name`    | 2–100 characters                                 |
| `email`   | valid format, ≤200 characters                    |
| `message` | 10–2000 characters                               |
| `website` | honeypot — must be empty; filled = silently ok'd |

Returns `200 { ok: true }` on success, `400 { error }` on malformed JSON or failed
validation.

> [!WARNING]
> The route validates and logs; it does **not** send mail yet. Before wiring an
> email provider, add per-IP rate limiting — the endpoint is public and
> unauthenticated, so the moment it sends mail it becomes a spam relay someone
> else pays for.

## Deployment

Deploys to [Vercel](https://vercel.com/new) with zero configuration — push the
repo, import it, done. Any Node 20.9+ host works too:

```bash
npm run build && npm run start
```

## License

Private and unlicensed. All rights reserved.
