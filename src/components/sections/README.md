# Page sections

One file per horizontal strip of the website, top to bottom. To change what a
visitor reads or sees in a band of the page, open the file with that name.

| Order | File               | What a visitor sees                              |
| ----- | ------------------ | ------------------------------------------------ |
| —     | `Navbar.tsx`       | Top menu bar, floats over everything              |
| 1     | `Hero.tsx`         | Opening screen: big headline + main button        |
| 2     | `Manifesto.tsx`    | Short statement of what the studio believes       |
| 3     | `Services.tsx`     | What we sell — web, social, motion, video, AI     |
| 4     | `Work.tsx`         | Portfolio pieces                                  |
| 5     | `WhyUs.tsx`        | Reasons to pick us over someone else              |
| 6     | `Process.tsx`      | How a project runs, step by step                  |
| 7     | `Pricing.tsx`      | Packages and prices                               |
| 8     | `Reviews.tsx`      | Client quotes and faces                           |
| 9     | `Trust.tsx`        | Logos, numbers, credibility markers               |
| 10    | `Faq.tsx`          | Frequently asked questions                        |
| 11    | `Cta.tsx`          | Closing block: the step-by-step project estimator  |
| —     | `Footer.tsx`       | Bottom bar: links, contact, small print           |

The order is set in [`src/app/page.tsx`](../../app/page.tsx) — move a line there
to move a section on the page.

The estimator in `Cta.tsx` reads its questions from
[`src/lib/configurator.ts`](../../lib/configurator.ts) and its prices from
[`src/lib/estimatePricing.ts`](../../lib/estimatePricing.ts). Change the
wording or the numbers there, not in the section.
