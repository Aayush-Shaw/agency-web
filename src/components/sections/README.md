# Page sections

One file per horizontal band of the website, top to bottom. To change what a
visitor reads or sees in a band, open the file with that name — the words are
plain text near the top of each one.

| Order | File            | What a visitor sees                                        |
| ----- | --------------- | ---------------------------------------------------------- |
| —     | `Navbar.tsx`    | Top menu bar, floats over everything                       |
| 1     | `Hero.tsx`      | Opening screen: big headline, main button, drifting media wall |
| 2     | `Manifesto.tsx` | Short statement of what the studio believes                |
| 3     | `Services.tsx`  | What we sell — the six services on a curved, draggable rail |
| 4     | `Work.tsx`      | Portfolio pieces, filtered by Website / Social / Video / AI Video |
| 5     | `WhyUs.tsx`     | Reasons to pick us over someone else                       |
| 6     | `Process.tsx`   | How a project runs, step by step                           |
| 7     | `Reviews.tsx`   | Client quotes and faces                                    |
| 8     | `Trust.tsx`     | Logos, numbers, credibility markers                        |
| 9     | `Faq.tsx`       | Frequently asked questions                                 |
| 10    | `Cta.tsx`       | Closing block: the step-by-step project estimator          |
| —     | `Footer.tsx`    | Bottom bar: links, socials, small print                    |

The order is set in [`src/app/page.tsx`](../../app/page.tsx) — move a line there
to move a band on the page.

## Pricing.tsx is parked, not deleted

`Pricing.tsx` exists and still works, but it is **not on the page**. To bring the
three-tier pricing block back, uncomment three things:

1. the `<Pricing />` line and its `import` in [`page.tsx`](../../app/page.tsx)
2. the `Pricing` entry in `Navbar.tsx`
3. the `Pricing` entry in `Footer.tsx`

Leave any of those out and the section either won't appear or won't be linked to.

## The estimator (Cta.tsx)

The closing block asks which services you want, one follow-up question each, and
a timeline — then quotes a price range. It reads all of that from two files, not
from the section:

- **questions and wording** → [`src/lib/configurator.ts`](../../lib/configurator.ts)
- **prices and timelines** → [`src/lib/estimatePricing.ts`](../../lib/estimatePricing.ts)

Change them there. `Cta.tsx` only draws what those two files say; it does no
arithmetic of its own.

The two are linked by TypeScript: add or rename a question option in
`configurator.ts` and the build fails until you give it a price in
`estimatePricing.ts`. That is deliberate — it is the one thing that cannot
silently drift.

## A note on the service list

The six services appear in `Services.tsx` here, and again in five other files
that exist for search engines and AI crawlers. Renaming one means editing all
six — the full checklist is in the [root README](../../../README.md#keeping-the-service-list-in-sync).
