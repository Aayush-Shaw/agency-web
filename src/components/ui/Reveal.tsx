"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";

/**
 * Per-section signature moves. Each is only the *departure* state — the
 * arrival is always the same full reset below, so adding one is one line.
 *
 * `words` is the exception: it is a different shape rather than a different
 * departure, so it has no entry here and is handled by flipWords() below.
 */
const VARIANTS = {
  rise: {},
  scale: { scale: 0.88 },
  blur: { filter: "blur(14px)" },
  slide: { x: -48 },
} as const;

// Every property any variant can touch, returned to neutral.
const ARRIVE = { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" };

/**
 * The hero's headline move, on scroll: the heading's words tip up off their own
 * baselines one after another, and everything else in the block follows a beat
 * later. Same numbers as the hero timeline, so the page has one heading move
 * rather than two that nearly match.
 *
 * SplitText rather than the <Words> component these headings could have used:
 * they are not plain strings. Every one carries a nested `.text-gradient` span,
 * and a `text` prop cannot express that. Splitting in the DOM leaves the markup
 * the section actually wrote.
 *
 * Returns SplitText's undo, which matters more than usual here — the word spans
 * are DOM that React did not render and does not know how to reconcile.
 */
function flipWords(el: HTMLElement, start: string, y: number) {
  const heading = el.querySelector<HTMLElement>("h1, h2, h3");
  if (!heading) return;

  const split = new SplitText(heading, { type: "words" });

  // .text-gradient clips one background across its own text, and a *transformed*
  // child is painted outside that clip. Left alone, every word lifted out of a
  // gradient span would render with the inherited `color: transparent` and
  // nothing behind it — invisible, not just un-gradiented. Moving the class down
  // gives each word its own background box. The ramp restarts per word as a
  // result, which is the trade the hero already makes; see Words.tsx.
  for (const w of split.words) {
    if (w.parentElement?.closest(".text-gradient")) w.classList.add("text-gradient");
  }

  // transformPerspective is per word, never `perspective` on the heading: one
  // shared vanishing point at the heading's centre slides each word sideways in
  // proportion to its distance from that centre, which throws the outer words of
  // a long heading off their line. Per-word perspective pivots each about its
  // own box. Same reasoning as the hero — the comment there has the long version.
  // No `once: true` — see the note on the other scrollTrigger below.
  const tl = gsap.timeline({ scrollTrigger: { trigger: el, start } });
  tl.fromTo(
    split.words,
    { opacity: 0, yPercent: 120, rotateX: -75, transformPerspective: 800 },
    {
      opacity: 1,
      yPercent: 0,
      rotateX: 0,
      transformPerspective: 800,
      duration: 0.85,
      stagger: 0.09,
      transformOrigin: "50% 100%",
    }
  );

  // The eyebrow above and the paragraph below keep the ordinary rise, overlapped
  // so the block still arrives as one move.
  const rest = [...el.children].filter((c) => c !== heading);
  if (rest.length) {
    tl.fromTo(rest, { opacity: 0, y }, { ...ARRIVE, clearProps: "all" }, "-=0.6");
  }

  return () => split.revert();
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Render as a different element (e.g. "ul", "section"). Defaults to div. */
  as?: ElementType;
  /** Animate the direct children in sequence instead of the element itself. */
  stagger?: boolean;
  /** Vertical travel distance in px. */
  y?: number;
  /** ScrollTrigger start position. */
  start?: string;
  /** Which signature move this section enters with. */
  variant?: keyof typeof VARIANTS | "words";
};

/**
 * One reusable scroll-reveal wrapper used by every section.
 * Fades + slides content in as it enters the viewport, once.
 *
 * Content is visible by default (CSS); GSAP only hides-then-reveals when it
 * actually runs, so there's no flash of hidden content and reduced-motion /
 * no-JS users simply see the content in place. Cleanup is automatic via the
 * useGSAP scope — no leaked or duplicated ScrollTriggers on unmount.
 */
export default function Reveal({
  children,
  className,
  as: Tag = "div",
  stagger = false,
  y = 28,
  start = "top 85%",
  variant = "rise",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // matchMedia (rather than a one-off matchMedia().matches check) so the
      // reveal reverts live if the user flips their reduced-motion setting.
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Returned so matchMedia runs SplitText's undo when the context reverts
        // or the user turns reduced motion on.
        if (variant === "words") return flipWords(el, start, y);

        const targets = stagger ? (el.children as unknown as Element[]) : el;

        // Cards carry CSS hover transitions on transform/filter. Left alone,
        // the browser would try to *transition* toward every frame GSAP writes
        // and the reveal would arrive late and mushy. Suspend transitions for
        // the duration, hand them back for hover afterwards.
        gsap.set(targets, { transition: "none" });

        // fromTo, never from: React Strict Mode invokes effects twice in dev, and
        // a second from() reads the already-hidden opacity as its END value, so
        // the element animates 0 -> 0 and never appears. Explicit endpoints are
        // immune to that. Duration/ease come from gsap.defaults().
        gsap.fromTo(
          targets,
          { opacity: 0, y, ...VARIANTS[variant] },
          {
            ...ARRIVE,
            stagger: stagger ? 0.12 : 0,
            // Do NOT add `once: true` here. It reads like a free optimisation
            // and it costs the whole page: `once` makes a ScrollTrigger kill
            // itself the moment it fires, and landing straight on a deep anchor
            // (/#contact) fires a dozen of these at once — while Process's
            // pinned trigger is inside refresh(), walking the same global
            // trigger array. ScrollTrigger.js:1366 reads _triggers[i].end with
            // no guard, the array has shrunk under it, and the throw takes the
            // React tree down with it: a blank page, in production too.
            //
            // Nothing is lost by leaving it off. The default toggleActions,
            // "play none none none", already plays on the way in and never
            // reverses, so these still reveal exactly once.
            scrollTrigger: { trigger: el, start },
            // Hand the element back to CSS on arrival. Without this GSAP leaves
            // an inline `transform` behind, and an inline transform outranks
            // every `hover:-translate-y-*` class on these cards — the hover
            // lifts silently stop working the moment a card reveals. Every
            // arrival value equals the CSS default, so clearing is a no-op
            // visually and restores the transition suspended above.
            clearProps: "all",
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
