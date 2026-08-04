"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { imageUrl, videoUrl } from "@/lib/media";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

type Category = "Website" | "Social" | "Motion" | "AI Video";

type Project = {
  title: string;
  cat: Category;
  src: string;
  video?: boolean;
  /** Width ÷ height. Every tile is the row's full height, so this is the only
      thing that decides how wide it is — each tile sizes itself. A reel is just
      an aspect below 1 (0.5625 is 9:16); it needs no special case now the row
      is one tall band rather than two short ones. */
  aspect: number;
};

/* Same media as the hero's wall — see lib/media.ts. Aspects are the crop each
   tile is *asked* for, not a measurement, so the rail's width is known at first
   layout and nothing reflows when an image finally decodes. */
const PROJECTS: Project[] = [
  { title: "Northwind Coffee", cat: "Website", src: imageUrl("photo-1497366754035-f200968a6e72"), aspect: 1.5 },
  { title: "Lumen Finance", cat: "Website", src: imageUrl("photo-1460925895917-afdab827c52f"), aspect: 1.9 },
  { title: "Cedar & Co", cat: "Website", src: imageUrl("photo-1517245386807-bb43f82c33c4"), aspect: 1.15 },
  { title: "Atlas Analytics", cat: "Website", src: imageUrl("photo-1504384308090-c894fdcc538d"), aspect: 1.5 },

  { title: "Halo Skincare", cat: "Social", src: imageUrl("photo-1522202176988-66273c2fd55f"), aspect: 0.8 },
  { title: "Volt Energy", cat: "Social", src: videoUrl("3129576"), video: true, aspect: 0.5625 },
  { title: "Bloom Botanics", cat: "Social", src: imageUrl("photo-1551434678-e076c223a692"), aspect: 1.6 },
  { title: "Kite Athletics", cat: "Social", src: imageUrl("photo-1542744173-8e7e53415bb0"), aspect: 1 },

  { title: "Apex Motors", cat: "Motion", src: videoUrl("2278095"), video: true, aspect: 2.2 },
  { title: "Nova Festival", cat: "Motion", src: imageUrl("photo-1531482615713-2afd69097998"), aspect: 1.3 },
  { title: "Pulse Records", cat: "Motion", src: videoUrl("6774633"), video: true, aspect: 0.5625 },
  { title: "Vantage Studios", cat: "Motion", src: imageUrl("photo-1600880292203-757bb62b4baf"), aspect: 1.75 },

  { title: "Aria · AI Presenter", cat: "AI Video", src: videoUrl("5192157"), video: true, aspect: 1.78 },
  { title: "Meridian Realty", cat: "AI Video", src: imageUrl("photo-1454165804606-c3d57bc86b40"), aspect: 1.45 },
  { title: "Solstice Travel", cat: "AI Video", src: imageUrl("photo-1499750310107-5fef28a66643"), aspect: 2.1 },
  { title: "Orbit Robotics", cat: "AI Video", src: imageUrl("photo-1553877522-43269d4ea984"), aspect: 0.9 },
];

const TABS = ["All", "Website", "Social", "Motion", "AI Video"] as const;

/** Copies of the list on the rail. Three, not two: the middle one is what you
    see, and the outer two are the runway the wrap jumps between. Two copies
    cannot do it — scrollLeft has no negative side, so there would be nothing to
    the left of the start to scroll onto. */
const COPIES = 3;

/** Minimum tiles in one copy. A four-item filter would otherwise leave a copy
    far narrower than the viewport and the seam would land on screen, so short
    categories repeat until there is enough to hide it. Half what the two-row
    version needed: one tall row makes every tile about twice as wide, so the
    same number of tiles covers twice the rail. */
const MIN_TILES = 8;

/** Row height and gutter. Every tile width is derived from these two and the
    tile's own aspect, so the rail re-solves itself on a resize with no JS.
    --row is one band roughly as tall as the old two rows plus their gutter
    combined, which is where the extra size in each tile comes from.

    The 52vw term is the phone case and it is doing real work: height alone put a
    landscape tile at ~380px on a 375px-wide screen, so one tile filled the
    display edge to edge and nothing hinted the rail scrolled at all. Capping the
    height by a fraction of the *width* leaves the next tile peeking. min() takes
    whichever constraint bites first, so desktop is still driven by svh and keeps
    the full size. Same shape as the hero headline's min(vw, svh). */
const RAIL_VARS = {
  "--row": "clamp(10rem, min(30svh, 52vw), 20rem)",
  "--gap": "0.75rem",
  /* The fade at each end is exactly the section's own horizontal padding, so
     the rail reads as running *under* the page's margin rather than being
     clipped by it. Overridden to 2rem at md, where the section is px-8. */
  "--fade": "1.25rem",
} as CSSProperties;

const FADE =
  "linear-gradient(to right, transparent 0, #000 var(--fade), #000 calc(100% - var(--fade)), transparent 100%)";

/**
 * Section 5 — the work rail.
 *
 * One tall row on a horizontal track that never ends, scrolled by hand. It is a
 * real scroll container rather than a transform the page drives: native scroll
 * brings touch momentum, trackpad gestures, the scrollbar and keyboard support
 * with it, none of which a custom drag gets for free — and it is what makes
 * this feel right on a phone. The only JS is the wrap.
 */
export default function Work() {
  const [active, setActive] = useState<(typeof TABS)[number]>("All");
  const rail = useRef<HTMLDivElement>(null);

  const shown =
    active === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === active);
  // Repeat the filtered set up to MIN_TILES, then COPIES of that on the rail.
  // Empty guard so `reps` can never be Infinity.
  const reps = shown.length ? Math.ceil(MIN_TILES / shown.length) : 0;
  const filled = Array.from({ length: reps }, () => shown).flat();

  // The infinite part. Park the scroll one copy in, then push it back by a copy
  // whenever it strays a half copy from there — the content at the new offset is
  // identical, so there is nothing to see.
  //
  // ponytail: assigning scrollLeft mid-fling cancels iOS momentum, so a very
  // long flick stops at the seam instead of coasting through it. Living with it
  // — the alternative is driving a transform by hand and re-implementing
  // momentum, which is what native scroll was chosen to avoid.
  useEffect(() => {
    const el = rail.current;
    if (!el?.firstElementChild) return;

    const copyWidth = () => {
      const first = el.firstElementChild as HTMLElement;
      return (
        first.getBoundingClientRect().width +
        parseFloat(getComputedStyle(first).marginRight)
      );
    };

    let w = copyWidth();
    el.scrollLeft = w;

    const onScroll = () => {
      if (!w) return;
      if (el.scrollLeft < w * 0.5) el.scrollLeft += w;
      else if (el.scrollLeft > w * 1.5) el.scrollLeft -= w;
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    // Tile widths are svh-derived, so a resize (or an orientation flip) changes
    // the copy width and the thresholds above with it.
    const ro = new ResizeObserver(() => {
      const next = copyWidth();
      if (!next || next === w) return;
      el.scrollLeft = (el.scrollLeft / w) * next;
      w = next;
    });
    ro.observe(el);

    // Muted + playsInline, so no gesture is needed. Kept as an attribute-free
    // play() for the same reason as the hero: autoPlay would also run these
    // under prefers-reduced-motion.
    el.querySelectorAll("video").forEach((v) => void v.play().catch(() => {}));

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
    // Filtering changes how many tiles are on the rail, and so the copy width
    // every threshold above is measured against.
  }, [active]);

  // Click-and-drag, mouse only. Touch already has native panning and would
  // fight this; a wheel mouse has neither, and without it a desktop visitor
  // with no trackpad cannot move the rail at all.
  const grab = useRef<{ x: number; left: number } | null>(null);

  const tiles = (copy: number) =>
    filled.map((p, i) => (
      <figure
        key={`${copy}-${p.title}-${i}`}
        // The whole layout, in one line: height comes from the row, width from
        // the aspect. A minimum rather than a fixed width because it is what the
        // `max-content` columns below measure — see the note on the media.
        style={{ minWidth: `calc(var(--row) * ${p.aspect})` }}
        // A real squircle, not a rounded rectangle: border-radius alone draws a
        // circular arc, and `corner-shape` is what bends it into the continuous
        // superellipse corner. The radius is the smaller half of the pair — a
        // squircle at a given radius already reads tighter than a circular corner
        // at the same number, because it hugs the corner point instead of cutting
        // across it. Browsers without `corner-shape` (Safari, Firefox) ignore the
        // line and keep the plain 8px arc, which is the shape this had before.
        className="group relative overflow-hidden rounded-xl border border-border bg-surface [corner-shape:squircle]"
      >
        {/* Absolutely positioned, and that is load-bearing rather than tidy: the
            columns are `max-content`, and an in-flow <img> or <video> offers its
            *intrinsic* width to that measurement. A 640px video made its reel
            column 500px instead of the 159px the aspect asks for, and every
            image would have done the same the moment it decoded — a rail that
            silently relaid itself as the network came in. Out of flow, nothing
            contributes but the min-width above. */}
        {p.video ? (
          <video
            src={p.src}
            muted
            loop
            playsInline
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          // Plain <img>, not next/image, for the same reason as the hero wall:
          // these are remote placeholder URLs and next/image would need each
          // host in images.remotePatterns. Swap both sections together when the
          // real assets land.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.src}
            alt={`${p.title} — ${p.cat} project`}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* A bar across the foot of the tile, not a floating pill. Hover only,
            and it stays in the DOM at opacity 0 so a screen reader still gets
            the title. The blur is what keeps it readable over media of any
            brightness — a flat scrim either washes out a dark photo or vanishes
            on a light one. */}
        {/* flex-wrap, and no truncation on the title: the tag drops to a second
            line only when the two genuinely do not fit, rather than the title
            being cut short to keep them on one. */}
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 bg-black/35 px-3 py-2 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
          <span className="font-display text-sm font-semibold text-white">
            {p.title}
          </span>
          {/* The tag only earns its space on "All". Under a category filter it
              would repeat the tab you already pressed on every single tile. */}
          {active === "All" && (
            <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
              {p.cat}
            </span>
          )}
        </figcaption>
      </figure>
    ));

  return (
    <section id="work" className="bg-transparent px-5 pt-24 md:px-8 md:pt-35 pb-10">
      <div className="mx-auto max-w-[1600px]">
        <Reveal variant="words">
          <Eyebrow>Selected work</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-section font-bold tracking-tight">
            Work we&apos;re <span className="text-gradient">proud to ship</span>.
          </h2>
        </Reveal>

        {/* Category filter */}
        <div
          role="group"
          aria-label="Filter work by category"
          className="mt-4 flex flex-wrap gap-2"
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
      </div>

      {/* Edge to edge — the negative margin cancels the section's own padding so
          the rail runs the full viewport width, and the mask then fades it out
          across exactly that padding at each end. Masking rather than laying a
          scrim over it: a translucent panel on top of a hard edge is still a
          hard edge, and what shows through here is the section's background
          rather than a tinted copy of it. Same reasoning as the hero wall.

          overscroll-x-contain stops a swipe that reaches the end of the rail
          from chaining out to the page and becoming a back/forward navigation —
          the same trap the services carousel has to preventDefault its way out
          of, except this one is a real scroll container so the CSS covers it. */}
      <div
        ref={rail}
        aria-label="Selected work, scroll sideways to browse"
        className="-mx-5 mt-4 flex cursor-grab overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none active:cursor-grabbing md:-mx-8 md:[--fade:2rem] [&::-webkit-scrollbar]:hidden"
        style={{ ...RAIL_VARS, maskImage: FADE, WebkitMaskImage: FADE }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          grab.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!grab.current) return;
          e.currentTarget.scrollLeft = grab.current.left - (e.clientX - grab.current.x);
        }}
        onPointerUp={() => {
          grab.current = null;
        }}
        onPointerCancel={() => {
          grab.current = null;
        }}
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <div
            key={copy}
            // The gutter as margin-right, never a `gap` on the flex row: the
            // wrap moves by exactly one copy, and it can only know that distance
            // if the gutter travels with the copy rather than sitting between
            // copies as a separate quantity.
            //
            // An explicit row height, not one of Tailwind's `grid-rows-*` — those
            // are `minmax(0, 1fr)`, which sizes the row from its content. With
            // tile widths derived from the row height that closes a loop: wider
            // tiles make a taller row makes wider tiles, and the rail settles
            // several times taller than it should be.
            aria-hidden={copy !== 1}
            style={{ marginRight: "var(--gap)" }}
            className="grid shrink-0 grid-flow-col gap-(--gap) auto-cols-max grid-rows-(--row)"
          >
            {tiles(copy)}
          </div>
        ))}
      </div>
    </section>
  );
}
