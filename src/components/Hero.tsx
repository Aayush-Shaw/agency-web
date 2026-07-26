"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Eyebrow from "@/components/Eyebrow";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // Staggered entrance on load. Duration/ease come from gsap.defaults()
  // (0.9s power3.out) — the timing measured off the reference sites.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // fromTo, not from — see the note in Reveal.tsx.
        gsap.fromTo(
          ".hero-rise",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, stagger: 0.12, delay: 0.1 }
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-5 pt-24 pb-28 md:px-8 md:pb-20"
    >
      {/* Backdrop lives in the root layout (.atmosphere) — fixed, ratio 0,
          shared by every section rather than owned by the hero. */}

      <div className="mx-auto w-full max-w-6xl">
        <Eyebrow className="hero-rise">
          Digital Studio · US / UK / EU brands
        </Eyebrow>

        <h1 className="hero-rise mt-6 max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          Design, motion &amp; AI video that makes brands{" "}
          <span className="text-gradient">impossible to ignore</span>.
        </h1>

        <p className="hero-rise mt-7 max-w-xl text-lg leading-relaxed text-text-muted md:text-xl">
          Digital Bear is a full-service studio crafting websites, social
          content, motion graphics, and AI-generated video for ambitious teams —
          premium work, fast turnarounds, on your timezone.
        </p>

        <div className="hero-rise mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href="#contact"
            className="glow inline-flex h-13 items-center justify-center rounded-full bg-linear-to-r from-accent-primary to-accent-secondary px-7 text-base font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            Start a project
          </a>
          <a
            href="#work"
            className="inline-flex h-13 items-center justify-center rounded-full border border-border px-7 text-base font-semibold text-text transition-colors hover:border-accent-primary hover:text-accent-primary"
          >
            See our work
          </a>
        </div>
      </div>

      {/* Scroll-down indicator — desktop only. On mobile the hero already
          overflows the viewport (measured 867px vs 844px on a 390×844 screen),
          so the cut-off content is the affordance and this would sit off-screen. */}
      <a
        href="#services"
        aria-label="Scroll to content"
        className="absolute inset-x-0 bottom-24 mx-auto hidden w-fit flex-col items-center gap-2 text-text-muted md:flex md:bottom-8"
      >
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.25em]">
          Scroll
        </span>
        <span className="flex h-9 w-6 justify-center rounded-full border border-border pt-1.5">
          <span className="animate-scroll-cue h-1.5 w-1.5 rounded-full bg-accent-primary" />
        </span>
      </a>
    </section>
  );
}
