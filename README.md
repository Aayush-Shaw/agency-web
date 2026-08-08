<div align="center">

# 🐻 Digi Bear

**Design, Video & AI Studio**

A single-page marketing site for an all-in-one digital studio — website
development, graphic design & branding, video editing, AI avatars & video,
social media management, and digital marketing & ads.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=black)](https://gsap.com)

</div>

---

## Overview

One page, ten bands between a floating navbar and the footer, scroll-driven
throughout. The visual language is warm and editorial — maple red on parchment,
pine-tinted surfaces, film grain over a slowly breathing colour field — with
long, low-travel GSAP transitions that read as expensive rather than busy.

The site ships **one palette**. There is no light/dark toggle and no
`prefers-color-scheme` switch: every design token is a flat value, so there is
nothing to resolve at runtime and no flash of the wrong theme.

## I'm not a developer — where do I change things?

Everything a non-coder normally needs is in one of these six files. Change the
text, save, and the site updates.

| I want to change…                                | Open this file                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| The words in a band of the page                  | `src/components/sections/` — [one file per band](src/components/sections/README.md)      |
| The list of services and what each one says      | `src/components/sections/Services.tsx`                                                  |
| The questions the price estimator asks           | `src/lib/configurator.ts`                                                               |
| The prices and timelines the estimator quotes    | `src/lib/estimatePricing.ts`                                                            |
| The domain and the Instagram / Facebook / YouTube links | `src/lib/constants.ts`                                                            |
| The colours, fonts and spacing                   | `src/app/globals.css`                                                                   |

> [!IMPORTANT]
> **The service list lives in six places.** The cards, the estimator, the prices,
> and the four search-engine files all carry their own copy. Change a service
> name or price in one and change it in all of them, or Google and ChatGPT will
> describe the studio differently from the website. See
> [Keeping the service list in sync](#keeping-the-service-list-in-sync).

## Tech stack

| Layer      | Choice                            | Why                                                        |
| ---------- | --------------------------------- | ---------------------------------------------------------- |
| Framework  | Next.js 16 (App Router)           | Server Components, file-based routing, built-in SEO files   |
| UI         | React 19 + TypeScript 5           | Strict types across components, the API routes and the libs |
| Styling    | Tailwind CSS v4                   | CSS-first config; every token defined in `globals.css`      |
| Motion     | GSAP 3 + ScrollTrigger            | Scroll-linked reveals and pins, registered once client-side |
| Motion     | Motion (Framer Motion) 12         | Springs and pointer-driven effects, where GSAP is overkill  |
| Scrolling  | Lenis                             | Smooth scroll, wired through `<SmoothScroll>`               |
| Icons      | lucide-react                      | The handful of stock icons; brand marks are drawn inline    |
| Typography | Questrial (display) + Poppins (body) | Loaded via `next/font/google`, self-hosted, zero CLS     |
| Tooling    | ESLint 9                          | `eslint-config-next`; no test framework, no build plugins   |

## Getting started

**Prerequisites** — Node.js `>=20.9.0` (Next 16 requirement) and npm.

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required — the contact endpoint is provider-less by
design (see [Contact API](#contact-api)) and every image is a public URL.

### Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start the development server            |
| `npm run build` | Production build                        |
| `npm run start` | Serve the production build              |
| `npm run lint`  | Lint with ESLint + `eslint-config-next` |

There is no test suite. Changes are verified with `npx tsc --noEmit` (types) and
`npm run lint`.

## Project structure

Every folder holds one kind of thing:

```
src/
├── app/                        # The page itself - wiring, not content
│   ├── api/
│   │   ├── contact/route.ts    # Receives a submitted contact form
│   │   └── services/route.ts   # The service list as JSON, for AI agents
│   ├── llms.txt/route.ts       # A plain-text summary of the studio, for AI crawlers
│   ├── globals.css             # Colours, fonts, spacing - the whole look
│   ├── layout.tsx              # Wrapper around the page: fonts, tab title, SEO tags
│   ├── opengraph-image.tsx     # The preview card shown when the link is shared
│   ├── page.tsx                # The running order of the sections
│   ├── robots.ts               # Tells search engines and AI crawlers what to read
│   └── sitemap.ts              # The sitemap, generated at build
├── components/
│   ├── sections/               # One file per band of the page  ← start here
│   ├── seo/JsonLd.tsx          # Machine-readable facts for Google's rich results
│   └── ui/                     # Small parts reused across sections
└── lib/
    ├── configurator.ts         # The estimator's services and questions
    ├── constants.ts            # Domain and social links, used everywhere
    ├── estimatePricing.ts      # The estimator's prices and timelines
    ├── gsap.ts                 # Animation setup, configured once
    └── media.ts                # Where the placeholder photos and videos come from

public/
└── digibear-logo.svg           # Served as-is. The only local asset the site loads.
```

`sections/` and `ui/` each carry their own README listing every file in plain
English — [sections](src/components/sections/README.md) ·
[ui](src/components/ui/README.md).

**On photos and videos.** Nothing in the portfolio or the hero is a local file
yet. Every image is an Unsplash URL and every clip is a Pexels URL, built by
`src/lib/media.ts`. Swapping in the studio's real work means changing that file
and the lists in `Hero.tsx` and `Work.tsx` — the layouts already handle any
shape.

## Design system

All design tokens live in `src/app/globals.css` as CSS custom properties and are
exposed to Tailwind via `@theme inline`, so utilities like `bg-bg`, `text-text`
and `border-border` always resolve to the live value.

| Token                    | Value                              | Role                                  |
| ------------------------ | ---------------------------------- | ------------------------------------- |
| `--raw-bg`               | `#F3EEE5`                          | Parchment — the page ground           |
| `--raw-surface`          | 12% pine mixed into the parchment  | Cards and panels                      |
| `--raw-text`             | `#2D3748`                          | Slate ink — all body copy             |
| `--raw-accent-primary`   | `#8B1E2D`                          | Maple red — links, focus ring, stars  |
| `--raw-accent-secondary` | `#D08856`                          | Cinnamon — the gradient's light end   |
| `--mesh-0` … `--mesh-3`  | parchment, cinnamon, maple, pine   | The animated field's four colour stops |

The hero is the only scope that overrides these, and it carries its own flat
copy — see the "Hero stage" block in `globals.css`.

**Motion.** `src/lib/gsap.ts` registers GSAP plugins exactly once, client-only,
and sets the house defaults — `duration: 0.9`, `ease: "power3.out"`. Long
duration with short travel is the whole trick. Almost every animation is wrapped
in a `prefers-reduced-motion` check, so a visitor who has asked their system for
less movement gets a still page rather than a broken one. `Process.tsx` is the
deliberate exception — its scroll-driven arc is the only layout that section
has, and the branch was removed on request.

**Browser config.** `next.config.ts` does two things: it allows private LAN
origins so the dev server can be opened from a phone on the same Wi-Fi, and it
extends Next's `htmlLimitedBots` list with AI crawlers (GPTBot, ClaudeBot,
PerplexityBot and friends) so they receive complete `<head>` tags in the first
response instead of a streamed shell.

## Being found — by search engines and by AI

Six files exist purely so machines can describe the studio accurately. They are
the reason the service list is duplicated, and they are the ones people forget
to update.

| File                              | What reads it                                    |
| --------------------------------- | ------------------------------------------------ |
| `src/app/sitemap.ts`              | Search engines, as `/sitemap.xml`                |
| `src/app/robots.ts`               | Crawlers, as `/robots.txt` — AI bots are welcomed explicitly |
| `src/app/llms.txt/route.ts`       | AI crawlers wanting the facts without the HTML   |
| `src/app/api/services/route.ts`   | AI agents asking "who builds Next.js sites?"     |
| `src/components/seo/JsonLd.tsx`   | Google's rich results (Organization, Service, FAQ) |
| `src/app/opengraph-image.tsx`     | Slack, LinkedIn, iMessage link previews          |

### Keeping the service list in sync

The six services are spelled out separately in each file below, on purpose — the
cards carry drawn icons, the estimator carries questions, and the SEO files
carry prose a crawler can read. Importing one from another would couple a search
file to a rendered component. The cost is that adding, renaming or removing a
service is a **six-file edit**:

1. `src/components/sections/Services.tsx` — the card a visitor reads (and the
   "Six services…" heading, if the count changed)
2. `src/lib/configurator.ts` — the estimator's entry and its follow-up question
3. `src/lib/estimatePricing.ts` — that entry's prices; **the build fails until
   this matches**, which is the one piece of drift TypeScript catches for you
4. `src/app/api/services/route.ts` — the JSON catalog
5. `src/app/llms.txt/route.ts` — the plain-text summary
6. `src/components/seo/JsonLd.tsx` — the structured data

Then sweep the one-line descriptions in `layout.tsx`, `Footer.tsx`, `Hero.tsx`
and `opengraph-image.tsx`, which each name the services in passing.

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

Returns `200 { ok: true }` on success, `400 { error }` on malformed JSON or
failed validation, and `429` once an IP has sent more than 3 messages in 10
minutes.

> [!WARNING]
> The route validates, rate-limits and logs; it does **not** send mail yet. Drop
> your provider call where the `TODO` marks it. The rate limiter is an
> in-process counter, so it resets on every cold start and each serverless
> instance keeps its own — good enough to thin casual floods, not a determined
> one. Move it to a shared store (Upstash / Vercel KV) before this endpoint
> actually sends mail at volume.

## Deployment

Deploys to [Vercel](https://vercel.com/new) with zero configuration — push the
repo, import it, done. Any Node 20.9+ host works too:

```bash
npm run build && npm run start
```

The live domain is set in one place, `src/lib/constants.ts`. Every canonical
URL, the sitemap, `robots.txt`, the structured data and the share card read it
from there, so pointing the site at the real domain is a one-line change — the
production domain is already sitting in that file, commented out above the
current Vercel preview URL. Swap the two when the domain goes live.

## License

Private and unlicensed. All rights reserved.
