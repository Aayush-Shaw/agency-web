"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Eyebrow from "@/components/Eyebrow";
import Magnetic from "@/components/Magnetic";
import Words from "@/components/Words";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // The page's one real timeline: each beat overlaps the one before it, so the
  // hero arrives as a single move rather than five separate fades. Durations
  // come from gsap.defaults() (0.9s power3.out) — the timing measured off the
  // reference sites.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // fromTo, not from — see the note in Reveal.tsx.
        const tl = gsap.timeline({ delay: 0.15 });

        tl.fromTo(".hero-eyebrow", { opacity: 0, y: 18 }, { opacity: 1, y: 0 })
          // Words tip up off their baseline, pivoting at the bottom edge rather
          // than spinning around their middle.
          //
          // transformPerspective (per word), NOT `perspective` on the h1: a
          // parent perspective gives every word one shared vanishing point at
          // the h1's centre, so the further a word sits from that centre the
          // more its projection slides sideways as it rotates. On a three-line
          // headline that threw the first word of the last line clear off the
          // left edge, where the section's overflow-hidden clipped it. Per-word
          // perspective pivots each word about its own box — no lateral drift.
          //
          // stagger vs duration is what makes this read as one-by-one rather
          // than one wave: at the old 0.045/1.1 every word was already moving
          // within 0.45s, so they arrived as a block. The gap is now a real
          // fraction of the travel, and each word clearly follows the last.
          .fromTo(
            ".hero-word",
            { opacity: 0, yPercent: 120, rotateX: -75, transformPerspective: 800 },
            {
              opacity: 1,
              yPercent: 0,
              rotateX: 0,
              transformPerspective: 800,
              duration: 0.85,
              stagger: 0.09,
              transformOrigin: "50% 100%",
            },
            "-=0.55"
          )
          .fromTo(".hero-sub", { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, "-=0.6")
          .fromTo(
            ".hero-cta",
            { opacity: 0, y: 24 },
            // clearProps for the same reason as Reveal: the buttons' CSS
            // hover:scale is dead while GSAP's inline transform sits on them.
            // transform only, not "all": the pre-hide in globals.css leaves
            // .hero-cta at opacity 0, so clearing the inline opacity too would
            // hand the buttons straight back to that rule and hide them.
            { opacity: 1, y: 0, stagger: 0.1, clearProps: "transform" },
            "-=0.7"
          )
          .fromTo(".hero-cue", { opacity: 0 }, { opacity: 1 }, "-=0.5");
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
        <Eyebrow className="hero-eyebrow">
          Digital Studio · US / UK / EU brands
        </Eyebrow>

        <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <Words
            className="hero-word"
            text="Design, motion & AI video that makes brands"
          />
          {/* Boxed per word so the tail joins the same stagger as everything
              above it, rather than fading in as one block. The cost is that
              `.text-gradient` clips its own background per box, so the
              honey→cinnamon ramp now restarts on each of these three words
              instead of running once across the phrase. Per-word boxes are
              small enough to still wrap normally; it was boxing the *whole*
              phrase that used to cost the headline a line. The period rides
              inside the last box but outside the gradient span, so it stays
              text-coloured exactly as before. */}
          <span className="hero-word text-gradient inline-block">
            impossible
          </span>{" "}
          <span className="hero-word text-gradient inline-block">to</span>{" "}
          <span className="hero-word inline-block">
            <span className="text-gradient">ignore</span>.
          </span>
        </h1>

        <p className="hero-sub mt-7 max-w-xl text-lg leading-relaxed text-text-muted md:text-xl">
          Digital Bear is a full-service studio crafting websites, social
          content, motion graphics, and AI-generated video for ambitious teams —
          premium work, fast turnarounds, on your timezone.
        </p>

        {/* Magnetic owns transform on the wrapper; GSAP's entrance owns it on
            the anchor inside. Two elements, so neither clobbers the other. */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Magnetic className="w-full sm:w-auto">
            <a
              href="#contact"
              className="hero-cta glow inline-flex h-13 w-full items-center justify-center rounded-full bg-linear-to-r from-accent-primary to-accent-secondary px-7 text-base font-semibold text-bg transition-transform hover:scale-[1.03]"
            >
              Start a project
            </a>
          </Magnetic>
          <Magnetic className="w-full sm:w-auto">
            <a
              href="#work"
              className="hero-cta inline-flex h-13 w-full items-center justify-center rounded-full border border-border px-7 text-base font-semibold text-text transition-colors hover:border-accent-primary hover:text-accent-primary"
            >
              See our work
            </a>
          </Magnetic>
        </div>
      </div>

      {/* Scroll-down indicator — desktop only. On mobile the hero already
          overflows the viewport (measured 867px vs 844px on a 390×844 screen),
          so the cut-off content is the affordance and this would sit off-screen. */}
      <a
        href="#services"
        aria-label="Scroll to content"
        className="hero-cue absolute inset-x-0 bottom-24 mx-auto hidden w-fit flex-col items-center gap-2 text-text-muted md:flex md:bottom-8"
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
