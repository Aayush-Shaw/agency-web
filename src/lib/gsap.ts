"use client";

// Single registration point for GSAP + plugins so ScrollTrigger and
// useGSAP are registered exactly once, on the client only (never during SSR).
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

  // One place for timing. Measured from the reference sites: Rockstar's dominant
  // transition is 1s ease-out (50 uses), Codapress reveals at 0.9s ease.
  // Long duration + short travel is what reads as expensive.
  gsap.defaults({ duration: 0.9, ease: "power3.out" });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
