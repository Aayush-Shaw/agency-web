# Shared UI pieces

These components are reused by multiple page sections. Change one here and all
of its callers receive the change.

## Layout, text, and motion

| File | Purpose |
| --- | --- |
| `Words.tsx` | Splits headlines into independently animated words |
| `Roll.tsx` | Hover label with a rolling duplicate |
| `Reveal.tsx` | Scroll entrance that fades and lifts content |
| `SmoothScroll.tsx` | Site-wide Lenis smooth scrolling |
| `ScrollBar.tsx` | Brand-colored scrollbar |
| `ScrollHint.tsx` | “Keep scrolling” pill |
| `useScrollFocus.ts` | Phone behavior that focuses the card near screen center |

## Pointer effects

| File | Purpose |
| --- | --- |
| `Magnetic.tsx` | Pulls buttons toward the pointer |
| `usePawRake.tsx` | Cursor-following bear paw highlight used by Reviews and FAQ |

## Larger shared pieces

| File | Purpose |
| --- | --- |
| `CardRail.tsx` | Curved draggable card rail used by Services and Why Us |
| `ContactDialog.tsx` | Contact form dialog opened by the estimator |
| `MeshGradient.tsx` | Animated color field behind the post-hero content |

## Parked

`Aurora.tsx` is the old hero glow and is not currently used. `MeshGradient.tsx`
replaced it; remove both the component and its commented switch in `Hero.tsx`
only when the old implementation is no longer needed.

## Shared constraints

Colors come from the tokens in [`src/app/globals.css`](../../app/globals.css).
`MeshGradient.tsx` and `Aurora.tsx` read literal hex values at runtime, so keep
their color tokens as plain hex rather than `color-mix()` expressions.

Animated components should preserve their reduced-motion behavior. The only
documented exception is `sections/Process.tsx`.
