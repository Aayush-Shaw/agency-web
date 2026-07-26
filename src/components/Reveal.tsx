"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

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
        // fromTo, never from: React Strict Mode invokes effects twice in dev, and
        // a second from() reads the already-hidden opacity as its END value, so
        // the element animates 0 -> 0 and never appears. Explicit endpoints are
        // immune to that. Duration/ease come from gsap.defaults().
        gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            stagger: stagger ? 0.12 : 0,
            scrollTrigger: { trigger: el, start, once: true },
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
