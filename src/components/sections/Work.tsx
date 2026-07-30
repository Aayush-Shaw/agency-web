"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

type Category = "Website" | "Social" | "Motion" | "AI Video";

const PROJECTS: { title: string; cat: Category; img: string }[] = [
  { title: "Northwind Coffee", cat: "Website", img: "/work/web-1.svg" },
  { title: "Lumen Finance", cat: "Website", img: "/work/web-2.svg" },
  { title: "Halo Skincare", cat: "Social", img: "/work/social-1.svg" },
  { title: "Volt Energy", cat: "Social", img: "/work/social-2.svg" },
  { title: "Apex Motors", cat: "Motion", img: "/work/motion-1.svg" },
  { title: "Nova Festival", cat: "Motion", img: "/work/motion-2.svg" },
  { title: "Aria · AI Presenter", cat: "AI Video", img: "/work/ai-1.svg" },
  { title: "Meridian Realty", cat: "AI Video", img: "/work/ai-2.svg" },
];

const TABS = ["All", "Website", "Social", "Motion", "AI Video"] as const;

/** Section 5 — filterable portfolio grid. */
export default function Work() {
  const [active, setActive] = useState<(typeof TABS)[number]>("All");
  const root = useRef<HTMLElement>(null);
  const shown =
    active === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === active);

  // The site's only parallax, on the one featured thumbnail. Codapress runs its
  // featured image at a measured ratio of -0.047 — about 5% of scroll distance.
  // Desktop only: on a phone this competes with native scroll for no gain.
  useGSAP(
    () => {
      // Filtering removes rows, so every section below this one just moved up.
      // ScrollTrigger caches start/end as document offsets and has no way to
      // know — without this, the Process line and the Trust counters keep
      // firing against positions that no longer exist until the next resize.
      ScrollTrigger.refresh();

      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          // scale 1.25 leaves 12.5% overflow top and bottom, so ±8% of travel
          // never exposes an edge. GSAP owns scale too — it writes the whole
          // transform property, so a Tailwind scale class would be clobbered.
          gsap.fromTo(
            ".work-parallax",
            { yPercent: -8, scale: 1.25 },
            {
              yPercent: 8,
              scale: 1.25,
              ease: "none",
              scrollTrigger: {
                trigger: ".work-parallax",
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        }
      );
    },
    // Filtering swaps which card is first, so the trigger has to be rebuilt —
    // otherwise it keeps pointing at an unmounted node.
    { scope: root, dependencies: [active], revertOnUpdate: true }
  );

  return (
    <section
      id="work"
      ref={root}
      className="bg-surface px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>Selected work</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-section font-bold tracking-tight">
            Work we&apos;re <span className="text-gradient">proud to ship</span>.
          </h2>
        </Reveal>

        {/* Category filter */}
        <div
          role="group"
          aria-label="Filter work by category"
          className="mt-10 flex flex-wrap gap-2"
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab}
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-pressed={active === tab}
              onClick={() => setActive(tab)}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
                active === tab
                  ? "border-transparent bg-linear-to-r from-accent-primary to-accent-secondary text-bg"
                  : "border-border text-text-muted hover:border-accent-primary hover:text-text"
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Mobile: a native snap-scroll rail with the next card peeking, which
            is how Codapress degrades its desktop arc carousel (measured
            scrollWidth 1093 vs clientWidth 390). From sm: up, the grid.
            CSS scroll-snap only — no carousel library, no JS. */}
        <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {/* `layout` is the one thing GSAP can't do without the paid Flip
              plugin: surviving cards measure their old and new grid slots and
              glide between them when the filter changes, instead of snapping. */}
          {shown.map((project, i) => (
            <motion.figure
              key={project.title}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                layout: { type: "spring", stiffness: 260, damping: 30 },
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl border border-border sm:w-auto sm:shrink"
            >
              <div className="relative aspect-3/2 overflow-hidden">
                {/* Exactly covers the frame. The featured card's parallax gets
                    its headroom from a GSAP-applied scale, not a percentage
                    height — percentages against an aspect-ratio parent resolve
                    to zero here. */}
                <div
                  className={`absolute inset-0 ${
                    i === 0 ? "work-parallax" : ""
                  }`}
                >
                  <Image
                    src={project.img}
                    alt={`${project.title} — ${project.cat} project`}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-black/70 to-transparent p-4 pt-10">
                <span className="font-display font-semibold text-white">
                  {project.title}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  {project.cat}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
