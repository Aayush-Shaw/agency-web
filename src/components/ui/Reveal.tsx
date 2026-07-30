"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Per-section signature moves. Each is only the *departure* state — the
 * arrival is always the same full reset below, so adding one is one line.
 */
const VARIANTS = {
  rise: {},
  scale: { scale: 0.88 },
  blur: { filter: "blur(14px)" },
  slide: { x: -48 },
} as const;

// Every property any variant can touch, returned to neutral.
const ARRIVE = { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" };

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
  variant?: keyof typeof VARIANTS;
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
            scrollTrigger: { trigger: el, start, once: true },
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
