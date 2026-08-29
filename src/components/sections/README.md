# Page sections

Each file is one horizontal band of the page. The render order is set in
[`src/app/page.tsx`](../../app/page.tsx).

| Order | File | Purpose |
| --- | --- | --- |
| — | `Navbar.tsx` | Floating top navigation |
| 1 | `Hero.tsx` | Opening headline, CTA, and media wall |
| 2 | `Manifesto.tsx` | Studio statement |
| 3 | `Services.tsx` | Five selectable services on a draggable rail |
| 4 | `Work.tsx` | Portfolio filtered by Website, Social, Video, and AI Video |
| 5 | `WhyUs.tsx` | Reasons to choose the studio |
| 6 | `Process.tsx` | Project steps and scroll-driven arc |
| 7 | `Reviews.tsx` | Client quotes and portraits |
| 8 | `Trust.tsx` | Logos, metrics, and credibility markers |
| 9 | `Faq.tsx` | Frequently asked questions |
| 10 | `Cta.tsx` | Project estimator and contact CTA |
| — | `Footer.tsx` | Links, socials, and small print |

## Parked pricing section

`Pricing.tsx` is complete but is not rendered. To restore it, enable the import
and `<Pricing />` in `page.tsx`, then enable its `Pricing` links in `Navbar.tsx`
and `Footer.tsx`.

## Estimator

`Cta.tsx` renders the estimator; it does not own the questions or arithmetic.

- Questions and labels: [`src/lib/configurator.ts`](../../lib/configurator.ts)
- Prices and timelines: [`src/lib/estimatePricing.ts`](../../lib/estimatePricing.ts)

TypeScript derives the pricing keys from the configurator, so changing an option
without adding its rate causes the build to fail.

## Service catalog note

`Services.tsx` and the estimator expose five services. The API, `llms.txt`, and
JSON-LD SEO data also include video editing, for a six-service machine-readable
catalog. Check the root [README](../../../README.md#seo-and-ai-readable-content)
before changing any service name, description, or price.
