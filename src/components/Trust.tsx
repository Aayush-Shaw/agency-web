"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STATS = [
  { value: 150, suffix: "+", label: "Projects delivered" },
  { value: 98, suffix: "%", label: "Client satisfaction" },
  { value: 40, suffix: "+", label: "Brands served" },
  { value: 24, suffix: "h", label: "Avg. response time" },
];

/** Section 10 — trust strip with numbers that count up on scroll. */
export default function Trust() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Numbers render at their final value by default (no-JS / reduced motion
      // safe). Only reset-and-count when motion is allowed.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
        const target = Number(el.dataset.value);
        const counter = { v: 0 };
        el.textContent = "0";
        gsap.to(counter, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v));
          },
        });
      });

      gsap.from(".stat-card", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.12,
        clearProps: "all",
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section className="px-5 py-20 md:px-8 md:py-24">
      <div
        ref={root}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="stat-card lift rounded-2xl border border-border bg-surface p-6 text-center"
          >
            <div className="font-display text-4xl font-bold tracking-tight text-gradient md:text-5xl">
              <span className="stat-num" data-value={stat.value}>
                {stat.value}
              </span>
              {stat.suffix}
            </div>
            <div className="mt-2 text-sm text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
