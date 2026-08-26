"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { gridVideo, popupVideo, posterVideo } from "@/lib/media";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

type Category = "Website" | "Social" | "Video" | "AI Video";

type Project = {
  title: string;
  cat: Category;
  src: string;
  posterSrc?: string;
  popupSrc?: string;
  video?: boolean;
  /** Live site. Video projects open their local popup source instead. */
  href?: string;
  /** Width ÷ height. The only thing that decides a tile's size: it is given the
      height of the band it sits in and this multiplies it out to a width.
      Below 1 (0.5625 is 9:16) means portrait, and that is also the switch for
      which band it gets - see TALL below. */
  aspect: number;
};

const videoProject = (filename: string, aspect: number): Project => ({
  title: filename
    .replace(/_AI(?=\.[^.]+$)|\.[^.]+$/g, "")
    .replaceAll("-", " "),
  cat: /_AI(?=\.[^.]+$)/.test(filename) ? "AI Video" : "Video",
  src: gridVideo(filename),
  posterSrc: posterVideo(filename),
  popupSrc: popupVideo(filename),
  video: true,
  aspect,
});

/* Video aspects are measured display width ÷ height from each MP4 track. */
const PROJECTS: Project[] = [
  { title: "AutoNorth Motors", cat: "Website", src: "/work/autonorth-motors.jpg", href: "https://autonorth-motors.vercel.app/", aspect: 1.6 },
  { title: "Indian Grill", cat: "Website", src: "/work/indian-grill.jpg", href: "https://indiangrill.vercel.app/", aspect: 1.6 },
  { title: "JUJCO Heating & Cooling", cat: "Website", src: "/work/jujco-hvac.jpg", href: "https://digibearca.github.io/JUJCO-HVAC-website/", aspect: 1.6 },
  { title: "Earls", cat: "Website", src: "/work/earls.jpg", href: "https://services0987.github.io/earls/", aspect: 1.6 },
  videoProject("2026-VAI_AI.mp4", 0.5625),
  videoProject("bronco_AI.mp4", 0.5625),
  videoProject("BRONCO-1-MAY.mp4", 0.5625),
  videoProject("bronco-amritpal_AI.mp4", 0.5625),
  videoProject("bronco-edit_AI.mp4", 1.7792),
  videoProject("bronco-edit1_AI.mp4", 0.5625),
  videoProject("bronco-walkarround_AI.mp4", 0.5625),
  videoProject("cars-cinema_AI.mp4", 1.7778),
  videoProject("digibear-info_AI.mp4", 0.5625),
  videoProject("digibear-promo_AI.mp4", 0.5696),
  videoProject("dodge-helcat.mp4", 0.5625),
  videoProject("language_AI.mp4", 0.5699),
  videoProject("mountain_AI.mp4", 0.5625),
  videoProject("mustang-dealship.mp4", 0.5625),
  videoProject("mustang-edit_AI.mp4", 1.7792),
  videoProject("MUSTANG-MACH.mp4", 0.5625),
  videoProject("mustang-walkarround_AI.mp4", 0.5625),
  videoProject("rapter.mp4", 0.5625),
  videoProject("raptor-black.mp4", 0.5625),
  videoProject("raptor-R.mp4", 0.5625),
  videoProject("REAL-ESTATE_AI.mp4", 1.7778),
  videoProject("Video-97762_AI.mp4", 0.5625),
];

const TABS = ["All", "Website", "Social", "Video", "AI Video"] as const;

/** Copies of the list on the rail. Three, not two: the middle one is what you
    see, and the outer two are the runway the wrap jumps between. Two copies
    cannot do it - scrollLeft has no negative side, so there would be nothing to
    the left of the start to scroll onto. */
const COPIES = 3;

/** Minimum tiles in one copy. A four-item filter would otherwise leave a copy
    far narrower than the viewport and the seam would land on screen, so short
    categories repeat until there is enough to hide it. Two rows means each tile
    is about half as wide as the single-row rail's were, so it takes twice as
    many of them to cover the same runway. */
const MIN_TILES = 16;

/** Height of ONE row, plus the gutter. Every tile size is derived from these two
    and the tile's own aspect, so the rail re-solves itself on a resize with no
    JS. The band as a whole is twice --row plus one --gap.

    The 33vw term is the phone case and it is doing real work: height alone put a
    landscape tile wide enough to fill a 375px screen edge to edge, and nothing
    hinted the rail scrolled at all. Capping the height by a fraction of the
    *width* leaves the next tile peeking. min() takes whichever constraint bites
    first, so desktop is still driven by svh and keeps the full size. Same shape
    as the hero headline's min(vw, svh). */
const RAIL_VARS = {
  "--row": "clamp(7.5rem, min(19svh, 33vw), 12.5rem)",
  "--gap": "0.75rem",
  /* A portrait tile is both rows tall, so it spans the gutter between them too -
     that gutter is interior to the tile, not around it. */
  "--tall": "calc(var(--row) * 2 + var(--gap))",
  /* The fade at each end is exactly the section's own horizontal padding, so
     the rail reads as running *under* the page's margin rather than being
     clipped by it. Overridden to 2rem at md, where the section is px-8. */
  "--fade": "1.25rem",
} as CSSProperties;

const FADE =
  "linear-gradient(to right, transparent 0, #000 var(--fade), #000 calc(100% - var(--fade)), transparent 100%)";

/** Portrait, i.e. the tile that takes both rows. The one rule the two-row layout
    turns on: taller than it is wide gets the full band, everything else gets one
    row and whatever width its aspect asks for. */
const TALL = (aspect: number) => aspect < 1;

/** Drift speed, px per second. Slow enough to read as ambience rather than a
    carousel that is running away from you. */
const DRIFT = 26;

/** How long the drift stays out of the way after a wheel or a flick. A touch
    fling keeps scrolling long after the finger is gone, and writing scrollLeft
    into that momentum kills it - so the drift waits rather than fighting. */
const YIELD_MS = 1100;

/** How far a press may travel and still count as a click on a tile's link.
    A mouse wobbles a pixel or two on the way down, so it cannot be zero. */
const DRAG_SLOP = 4;

/**
 * Section 5 - the work rail.
 *
 * Two rows on a horizontal track that never ends: portrait media takes the full
 * band, landscape media takes one row at whatever width its aspect asks for.
 * The rail drifts left on its own, stops under the pointer, and can be swiped or
 * dragged at any time.
 *
 * It is a real scroll container rather than a transform the page drives: native
 * scroll brings touch momentum, trackpad gestures, the scrollbar and keyboard
 * support with it, none of which a custom drag gets for free - and it is what
 * makes this feel right on a phone. The drift is then just a few px of
 * scrollLeft per frame, so it shares one coordinate with the user's own scroll
 * instead of being a second, competing position.
 */
export default function Work() {
  const [active, setActive] = useState<(typeof TABS)[number]>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (selected && !modal.current?.open) modal.current?.showModal();
  }, [selected]);

  // Drift gates. Refs, not state: both are written from pointer handlers on
  // every move and read inside a rAF loop - a re-render for either would be a
  // render per frame that changes nothing on screen.
  const held = useRef(false); // pointer is over the rail, or dragging it
  const yieldUntil = useRef(0); // momentum/wheel still settling

  const shown =
    active === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === active);
  // Repeat the filtered set up to MIN_TILES, then COPIES of that on the rail.
  // Empty guard so `reps` can never be Infinity.
  const reps = shown.length ? Math.ceil(MIN_TILES / shown.length) : 0;
  const filled = Array.from({ length: reps }, () => shown).flat();

  // The infinite part. Park the scroll one copy in, then push it back by a copy
  // whenever it strays a half copy from there - the content at the new offset is
  // identical, so there is nothing to see.
  //
  // ponytail: assigning scrollLeft mid-fling cancels iOS momentum, so a very
  // long flick stops at the seam instead of coasting through it. Living with it
  // - the alternative is driving a transform by hand and re-implementing
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

    // A wheel or trackpad gesture gets the same grace period a flick does. It
    // is not on the pointer handlers because a wheel mouse never sends one.
    const yieldNow = () => {
      yieldUntil.current = performance.now() + YIELD_MS;
    };
    el.addEventListener("wheel", yieldNow, { passive: true });

    // The drift. Written as a scroll position we own and re-read rather than a
    // blind `+=`: the browser may round scrollLeft to a whole pixel, and at this
    // speed that is most of a frame's movement - accumulating in a float and
    // assigning it is what keeps a sub-pixel step from being rounded away to
    // nothing. Anything that moves the rail out from under us (the wrap above, a
    // drag, momentum) shows up as a gap wider than that rounding, and we take
    // its position as the new truth instead of yanking it back.
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;

    // Writing scrollLeft is a layout write, and doing it every frame for a rail
    // sitting three screens below the fold would be paid for by whatever *is* on
    // screen. The entry slide gets this for free as well: the rail is translated
    // out past the page's overflow clip until it lands, so it reads as off
    // screen and the drift picks up exactly where the entry sets it down.
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
    });
    io.observe(el);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // Clamped: a backgrounded tab or a long frame would otherwise hand us a
      // gap of seconds and teleport the rail on the frame it resumes.
      const dt = Math.min(now - last, 50);
      last = now;

      if (
        !onScreen ||
        modal.current?.open ||
        held.current ||
        now < yieldUntil.current
      )
        return;
      if (Math.abs(el.scrollLeft - pos) > 1) pos = el.scrollLeft;
      pos += (DRIFT * dt) / 1000;
      el.scrollLeft = pos;
    };
    if (!reduced) raf = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", yieldNow);
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // Filtering changes how many tiles are on the rail, and so the copy width
    // every threshold above is measured against.
  }, [active, reduced]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    const videos = Array.from(el.querySelectorAll<HTMLVideoElement>("video"));
    const near = new Set<HTMLVideoElement>();
    const visible = new Set<HTMLVideoElement>();
    const syncVideo = (video: HTMLVideoElement) => {
      if (selected || !near.has(video)) {
        video.pause();
        if (video.hasAttribute("src")) {
          video.removeAttribute("src");
          video.load();
        }
        return;
      }

      if (!video.hasAttribute("src") && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }
      if (visible.has(video)) void video.play().catch(() => {});
      else video.pause();
    };
    const nearObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) near.add(video);
          else near.delete(video);
          syncVideo(video);
        });
      },
      { root: el, rootMargin: "0px 300px" }
    );
    const visibleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) visible.add(video);
          else visible.delete(video);
          syncVideo(video);
        });
      },
      { root: el }
    );
    videos.forEach((video) => {
      nearObserver.observe(video);
      visibleObserver.observe(video);
    });

    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
    };
  }, [active, selected]);

  // Click-and-drag, mouse only. Touch already has native panning and would
  // fight this; a wheel mouse has neither, and without it a desktop visitor
  // with no trackpad cannot move the rail at all.
  const grab = useRef<{ x: number; left: number } | null>(null);
  // Whether the current press has travelled far enough to be a scroll. Without
  // it, dragging the rail by a linked tile and letting go navigates: the click
  // that follows pointerup lands on the tile the finger started on.
  const dragged = useRef(false);

  const tiles = (copy: number) =>
    filled.map((p, i) => (
      <figure
        key={`${copy}-${p.title}-${i}`}
        // The whole layout, in two lines: a portrait tile is handed the full
        // band and a landscape one a single row, and its own aspect multiplies
        // that height out to a width. So a reel stands the full height of the
        // rail and a 16:9 runs its true width - nothing is cropped to a
        // uniform box.
        //
        // A minimum rather than a fixed width because it is what the
        // `max-content` columns below measure - see the note on the media. It is
        // also why the two tiles stacked in one column always agree on a width:
        // the column takes the wider of the pair and the other grows into it,
        // which only ever gives a tile *more* room than its aspect asked for.
        style={{
          minWidth: `calc(var(${TALL(p.aspect) ? "--tall" : "--row"}) * ${p.aspect})`,
        }}
        // A real squircle, not a rounded rectangle: border-radius alone draws a
        // circular arc, and `corner-shape` is what bends it into the continuous
        // superellipse corner. The radius is the smaller half of the pair - a
        // squircle at a given radius already reads tighter than a circular corner
        // at the same number, because it hugs the corner point instead of cutting
        // across it. Browsers without `corner-shape` (Safari, Firefox) ignore the
        // line and keep the plain 8px arc, which is the shape this had before.
        className={`group relative overflow-hidden rounded-xl border border-border bg-surface [corner-shape:squircle] ${
          TALL(p.aspect) ? "row-span-2" : ""
        }`}
      >
        {/* Absolutely positioned, and that is load-bearing rather than tidy: the
            columns are `max-content`, and an in-flow <img> or <video> offers its
            *intrinsic* width to that measurement. A 640px video made its reel
            column 500px instead of the 159px the aspect asks for, and every
            image would have done the same the moment it decoded - a rail that
            silently relaid itself as the network came in. Out of flow, nothing
            contributes but the min-width above. */}
        {p.video ? (
          <video
            data-src={p.src}
            poster={p.posterSrc}
            muted
            loop
            playsInline
            preload="none"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          // Plain <img>, not next/image, for the same reason as the hero wall:
          // the placeholder tiles are remote URLs and next/image would need
          // every host in images.remotePatterns. The real work is local and
          // could take next/image today, but not while one list feeds both.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.src}
            alt={`${p.title} - ${p.cat} project`}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* A bar across the foot of the tile, not a floating pill. Hover only,
            and it stays in the DOM at opacity 0 so a screen reader still gets
            the title. The blur is what keeps it readable over media of any
            brightness - a flat scrim either washes out a dark photo or vanishes
            on a light one. */}
        {/* flex-wrap, and no truncation on the title: the tag drops to a second
            line only when the two genuinely do not fit, rather than the title
            being cut short to keep them on one. */}
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 bg-bg/10 px-3 py-2 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="font-display text-sm font-semibold text-white">
            {p.title}
          </span>
          {/* The tag only earns its space on "All". Under a category filter it
              would repeat the tab you already pressed on every single tile. */}
          {active === "All" && (
            <span className="shrink-0 rounded-full bg-bg/20 border border-white/10 px-2 py-0.5 text-xs font-medium text-white">
              {p.cat}
            </span>
          )}
        </figcaption>

        {/* The link is a bare overlay rather than a wrapper around the media,
            so the tile's layout - which is entirely min-width and row-span on
            the <figure> - does not have to be re-hung on an <a>. Last in the
            DOM puts it over the caption without needing a z-index.

            tabIndex on the outer copies: they are aria-hidden runway, and a
            focusable element inside aria-hidden is exactly the mismatch screen
            readers choke on. Only the middle copy is reachable by keyboard. */}
        {p.href && (
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={copy === 1 ? undefined : -1}
            aria-label={`${p.title} - open the live site in a new tab`}
            className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-primary"
          />
        )}
        {p.popupSrc && (
          <button
            type="button"
            tabIndex={copy === 1 ? undefined : -1}
            aria-label={`${p.title} - play video`}
            onClick={() => {
              if (!dragged.current) setSelected(p);
            }}
            className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-primary"
          />
        )}
      </figure>
    ));

  return (
    <section id="work" className="px-5 pt-24 md:px-8 md:pt-35 pb-10">
      <div className="mx-auto max-w-[1600px]">
        <Reveal variant="words">
          <Eyebrow>Selected projects</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-section font-bold tracking-tight">
            Project we&apos;re <span className="text-gradient">proud to ship.</span>
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
                  ? "border-transparent brand-gradient text-bg"
                  : "border-border text-text-muted hover:border-accent-primary hover:text-text"
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Edge to edge - the negative margin cancels the section's own padding so
          the rail runs the full viewport width, and the mask then fades it out
          across exactly that padding at each end. Masking rather than laying a
          scrim over it: a translucent panel on top of a hard edge is still a
          hard edge, and what shows through here is the section's background
          rather than a tinted copy of it. Same reasoning as the hero wall.

          overscroll-x-contain stops a swipe that reaches the end of the rail
          from chaining out to the page and becoming a back/forward navigation -
          the same trap the services carousel has to preventDefault its way out
          of, except this one is a real scroll container so the CSS covers it.

          Three elements rather than one because of the entry. The move is a
          full-width slide in from the right, which puts the rail entirely
          outside the page's overflow-x-clip until it arrives - and an
          IntersectionObserver watching a clipped-out element never fires, so a
          `whileInView` on the thing that moves would wait forever for itself.
          The outer element stays put and owns the trigger, the middle one
          travels, and the scroll container is left untransformed underneath.
          MotionConfig's reducedMotion="user" (SmoothScroll.tsx) drops the
          transform on its own, leaving the fade. */}
      <motion.div
        initial="out"
        whileInView="in"
        viewport={{ once: true, amount: 0.3 }}
        className="-mx-5 mt-4 md:-mx-8"
      >
        <motion.div
          variants={{ out: { x: "100%", opacity: 0 }, in: { x: 0, opacity: 1 } }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            ref={rail}
            aria-label="Selected work, scroll sideways to browse"
            className="flex cursor-grab overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none active:cursor-grabbing md:[--fade:2rem] [&::-webkit-scrollbar]:hidden"
            style={{ ...RAIL_VARS, maskImage: FADE, WebkitMaskImage: FADE }}
            // Hover holds the drift still so you can actually look at a tile -
            // and on touch the same two handlers fire around a swipe, so a
            // finger on the rail stops it for free.
            onPointerEnter={() => {
              held.current = true;
            }}
            onPointerLeave={() => {
              held.current = false;
            }}
            // Cleared on the way down, never on the way up: the click fires
            // after pointerup, so it has to still be able to read this.
            onPointerDown={(e) => {
              held.current = true;
              dragged.current = false;
              if (e.pointerType !== "mouse" || e.button !== 0) return;
              grab.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
            }}
            onPointerMove={(e) => {
              if (!grab.current) return;
              const dx = e.clientX - grab.current.x;
              if (Math.abs(dx) > DRAG_SLOP) {
                dragged.current = true;
                if (!e.currentTarget.hasPointerCapture(e.pointerId))
                  e.currentTarget.setPointerCapture(e.pointerId);
              }
              e.currentTarget.scrollLeft = grab.current.left - dx;
            }}
            // Capture, so it runs before the click reaches the tile's link.
            // Touch is not covered and does not need to be - a browser already
            // withholds the click after a swipe that scrolled.
            onClickCapture={(e) => {
              if (dragged.current) e.preventDefault();
            }}
            // A finger that lifts is gone - there is no hover to keep holding
            // the rail, so releasing has to clear it. A mouse gets it back
            // immediately from the pointerenter it is still inside of.
            onPointerUp={(e) => {
              grab.current = null;
              held.current = e.pointerType === "mouse";
              yieldUntil.current = performance.now() + YIELD_MS;
            }}
            onPointerCancel={() => {
              grab.current = null;
              held.current = false;
            }}
          >
            {Array.from({ length: COPIES }, (_, copy) => (
              <div
                key={copy}
                // The gutter as margin-right, never a `gap` on the flex row: the
                // wrap moves by exactly one copy, and it can only know that
                // distance if the gutter travels with the copy rather than
                // sitting between copies as a separate quantity.
                //
                // Explicit row heights, not one of Tailwind's `grid-rows-*` -
                // those are `minmax(0, 1fr)`, which sizes rows from their
                // content. With tile widths derived from the row height that
                // closes a loop: wider tiles make a taller row makes wider
                // tiles, and the rail settles several times taller than it
                // should be.
                //
                // `dense` is what the two-row layout needs and the one-row
                // version did not: a portrait tile that comes up while a column
                // is half full cannot fit there, and plain column flow would
                // leave that half column empty for the rest of the rail. Dense
                // backfills it with the next tile that does fit. It reorders
                // tiles relative to the DOM, which is free here - the rail is a
                // wall of work, not a ranked list.
                aria-hidden={copy !== 1}
                style={{ marginRight: "var(--gap)" }}
                className="grid shrink-0 grid-flow-col-dense gap-(--gap) auto-cols-max grid-rows-[repeat(2,var(--row))]"
              >
                {tiles(copy)}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <dialog
        ref={modal}
        aria-label={selected ? `${selected.title} video` : "Video preview"}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-none max-w-none overflow-visible bg-transparent p-0 backdrop:bg-black/85"
      >
        {selected?.popupSrc && (
          <div className="relative">
            <video
              key={selected.popupSrc}
              src={selected.popupSrc}
              autoPlay
              muted
              playsInline
              controls
              className="max-h-[calc(100svh-2rem)] max-w-[calc(100vw-2rem)] rounded-xl bg-black object-contain"
            />
            <button
              type="button"
              aria-label="Close video"
              onClick={() => modal.current?.close()}
              className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-black/70 text-2xl leading-none text-white backdrop-blur-sm transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}
