"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Wraps the page in Lenis smooth (inertia) scrolling and keeps GSAP
 * ScrollTrigger in sync with it.
 *
 * - Native scroll is left untouched on touch devices (no scroll-jacking on
 *   mobile) and fully bypassed when the user prefers reduced motion.
 * - The Lenis raf loop is driven by GSAP's ticker so both stay on one clock.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // Leave phones/tablets on native scrolling — smoothing touch fights the OS.
      syncTouch: false,
    });

    // Drive Lenis from GSAP's ticker and update ScrollTrigger on every scroll.
    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  // One switch for every Framer animation on the site: "user" makes them all
  // honour prefers-reduced-motion, so no component has to remember to.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
