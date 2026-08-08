# Shared pieces

Small parts reused by many sections. Nothing here is a band of the page on its
own — edit one of these and it changes everywhere it's used at once.

## Layout and text

| File          | What it does                                                     |
| ------------- | ---------------------------------------------------------------- |
| `Eyebrow.tsx` | The small uppercase label with a claw mark, above a section heading |
| `Words.tsx`   | Splits a headline into words so they can animate in one by one    |
| `Roll.tsx`    | Hover a link and its label rolls up, an identical copy rides in below |

## Motion and scrolling

| File                | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `Reveal.tsx`        | Fades and lifts content in as you scroll to it — the site's default entrance |
| `SmoothScroll.tsx`  | Makes the whole page's scrolling smooth (mounted once, in `page.tsx`'s wrapper) |
| `ScrollBar.tsx`     | The brand-coloured scrollbar that replaces the browser's own       |
| `ScrollHint.tsx`    | The little "keep scrolling" pill; the caller decides where it sits |
| `useScrollFocus.ts` | On a phone, marks whichever card is crossing the middle of the screen, so scrolling reveals what hovering reveals on desktop |

## Pointer effects

| File             | What it does                                                          |
| ---------------- | --------------------------------------------------------------------- |
| `Magnetic.tsx`   | Makes a button drift toward the mouse cursor                           |
| `usePawRake.tsx` | The bear paw that lags behind the cursor and drags a light across the content (used by Reviews and FAQ) |

## Big pieces

| File                | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `CardRail.tsx`      | The curved, draggable row of cards — shared by Services and Why Us   |
| `ContactDialog.tsx` | The pop-up that takes your details at the end of the estimator       |
| `MeshGradient.tsx`  | The slow colour field breathing behind everything below the hero     |

## Parked

| File         | What it does                                                             |
| ------------ | ------------------------------------------------------------------------ |
| `Aurora.tsx` | The earlier animated glow for the hero. **Not in use** — `MeshGradient.tsx` replaced it. The code to switch back is commented out in `Hero.tsx`; delete both together if you're sure. |

---

**Colours.** Nothing here hard-codes a colour. Every part uses the tokens in
[`src/app/globals.css`](../../app/globals.css), so changing the palette there
changes all of these at once. The two WebGL pieces (`MeshGradient`, `Aurora`)
read their colours from the same tokens at runtime, which is why those specific
values must stay plain hex — a `color-mix()` there would not survive the trip.

**Reduced motion.** Every animated part here checks whether the visitor has
asked their system for less movement, and shows a still version if so. Keep that
check if you add one. (The one place in the codebase without it is
`sections/Process.tsx`, where it was removed on request.)
