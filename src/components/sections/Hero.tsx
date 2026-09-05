"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { gridVideo, posterVideo } from "@/lib/media";
// import Aurora from "@/components/ui/Aurora"; // with the backdrop below
import Magnetic from "@/components/ui/Magnetic";
import MeshGradient from "@/components/ui/MeshGradient";
import Roll from "@/components/ui/Roll";
import ScrollHint from "@/components/ui/ScrollHint";
import Words from "@/components/ui/Words";

/* ============================================================
   Media wall - tunables.

   Everything about the wall's geometry and pace is one of these six values.
   Changing TILT re-solves the cover size on its own (see COVER_W/COVER_H);
   adding a fifth array to COLUMNS re-splits the width and gets a direction
   for free. Nothing else needs touching.
   ============================================================ */

/** Rotation of the whole block, in degrees. 0 = upright columns. */
const TILT = 15;
/** Column travel, px per second. Higher = faster drift. */
const SCROLL_SPEED = 30;
/** Gutter between columns, and between tiles inside a column. */
const GAP = "0.75rem";
const HERO_COLUMN_PLAYBACK_MS = 3000;
/** Where the wall's left edge sits at md+, as a share of the content band
    (--bw, set on the wall itself) rather than of the viewport - that is the
    whole cap: past 72rem the band stops growing and so does the wall. Below md
    it starts at the band's left edge and takes the whole width. Under the text
    column's 50% either way, which is the overlap. */
const WALL_LEFT = "calc(var(--bw) * 0.45)";
/** Cover margin over the exact minimum - sub-pixel rounding at the rotated
    block's corners, nothing more. Every pixel of slack is width the outermost
    columns spend outside the window, so this stays as close to 1 as it can. */
const COVER_SLACK = 1.03;

/* A rigid block rotated by θ has to be *bigger* than the box it covers, and
   how much bigger depends on θ. Take the wall's window (W × H) into the
   block's own rotated frame: its axis-aligned bounding box there measures

       W·|cos θ| + H·|sin θ|   wide
       W·|sin θ| + H·|cos θ|   tall

   and those are exactly the block's minimum dimensions - any smaller and a
   corner of the window pokes out past a rotated edge. At 45° both collapse to
   the familiar (W + H) / √2.

   W is --wall-w, the window's real width, and *not* 100vw. Using the viewport
   as a free over-estimate is what buried the first and last columns: the
   surplus width is split evenly onto the two ends of the block, so at 34vw
   with a 45° tilt the outer columns spent ~90% of themselves outside the
   window. Solved against the window itself, the only surplus left is the
   H·sin θ term the rotation genuinely needs, and all four columns land inside.

   H is 100svh because the section is exactly that tall (h-svh below). svh,
   not dvh or vh: a height that moves as mobile chrome collapses would resize
   the block mid-scroll. */
const RAD = (TILT * Math.PI) / 180;
const COS = Math.abs(Math.cos(RAD));
const SIN = Math.abs(Math.sin(RAD));
const COVER_W = `calc((var(--wall-w) * ${COS} + 100svh * ${SIN}) * ${COVER_SLACK})`;
const COVER_H = `calc((var(--wall-w) * ${SIN} + 100svh * ${COS}) * ${COVER_SLACK})`;

/**
 * One tile in the wall.
 *
 * `span` is the tile's height as a fraction of the block's height, which is
 * what makes the columns masonry-ish rather than a grid of equal cells - and,
 * more importantly, what makes every height known at first layout. The loop
 * below measures the track the moment it mounts; if these were image-driven
 * heights it would be measuring a pile of unloaded <img>s.
 *
 * Per column the spans must sum to **at least 1** - one copy of the list has
 * to be tall enough to fill the column on its own, or the seamless wrap below
 * shows a gap. They sum to ~1.35 here, so there is room to swap tiles in and
 * out without doing the arithmetic again.
 *
 */
type Tile = { src: string; span: number; image?: true; poster?: string };

const vid = (filename: string, span: number): Tile => ({
  src: gridVideo(filename),
  poster: posterVideo(filename),
  span,
});
const img = (src: string, span: number): Tile => ({ src, span, image: true });

/* One array per column, left to right. Odd columns scroll up, even ones down
   - see the loop. */
const COLUMNS: Tile[][] = [
  [
    vid("BRONCO-1-MAY.mp4", 0.22),
    img("/work/Auto-loan-calculator.webp", 0.16),
    vid("bronco_AI.mp4", 0.26),
    vid("citc_AI.mp4", 0.36),
    vid("digibear-promo_AI.mp4", 0.46),
  ],
  [
    vid("rapter.mp4", 0.24),
    img("/work/AutoNorth-Motors.webp", 0.16),
    vid("mustang-walkarround_AI.mp4", 0.36),
    vid("jujco_AI.mp4", 0.36),
    vid("2026-VAI_AI.mp4", 0.3),
    vid("BRONCO-1-MAY.mp4", 0.26),
    vid("boutique-2.mp4", 0.35),
  ],
  [
    img("/work/indian-grill.webp", 0.16),
    vid("digibear-promo_AI.mp4", 0.46),
    vid("raptor-R.mp4", 0.36),
    vid("rapter.mp4", 0.22),
    vid("raptor-black.mp4", 0.3),
    vid("boutique-3.mp4", 0.35),
  ],
  [
    vid("mustang-walkarround_AI.mp4", 0.22),
    vid("2026-VAI_AI.mp4", 0.3),
    vid("BRONCO-1-MAY.mp4", 0.26),
    img("/work/earls.webp", 0.16),
    vid("digibear-promo_AI.mp4", 0.46),
  ],
];

/* The wall is decoration - the whole region is aria-hidden, so the tiles carry
   no alt text by design and there is nothing here for a screen reader to wade
   through. */
function Tiles({ items }: { items: Tile[] }) {
  return items.map((item, i) => (
    <div
      key={i}
      // shrink-0: without it the flex column squeezes the tiles back down to
      // fit and every span above becomes a suggestion.
      // marginBottom rather than a `gap` on the track - see the loop for why
      // the two are not interchangeable here.
      className="relative shrink-0 overflow-hidden rounded-xl"
      style={{ height: `calc(var(--cover-h) * ${item.span})`, marginBottom: GAP }}
    >
      {item.image ? (
        <Image
          src={item.src}
          alt=""
          fill
          sizes="(min-width: 768px) 20vw, 30vw"
          className="object-cover"
        />
      ) : (
        <video
          data-src={item.src}
          data-poster-src={item.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  ));
}

/* The wall doesn't sit *under* an overlay any more, it fades out itself.
   A wash of the bg token over the top was what made the left edge read as a
   cut: however soft the overlay's own fade, the wall underneath still stopped
   dead on a straight vertical line, and a translucent panel over a hard edge
   is still a hard edge. Masking the wall means there is no edge to hide -
   opacity runs to zero before the boundary, and what shows through is the
   aurora backdrop rather than a tinted copy of it.

   Two masks, so two elements: mask-image takes a list, but combining the
   layers needs mask-composite, whose keywords still differ between the
   standard property and WebKit's. Nesting composes them for free.

   Vertical: transparent through the navbar's band, so the bar is never over
   moving media - the reason the old blur strip existed, minus the strip.
   Horizontal: transparent at the wall's own left edge, full by --fx. 45% of a
   55vw window lands the ramp's end around 70vw, well clear of the text. Below
   md the text is full-width, so the ramp runs nearly the whole way and the
   wall reads as a faint texture on the right rather than a backdrop. */
const WALL_FADE_TOP =
  "linear-gradient(to bottom, transparent 0, transparent 10svh, #000 32svh)";
const WALL_FADE_LEFT =
  "linear-gradient(to right, transparent 0, #000 var(--fx))";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // The page's one real timeline: each beat overlaps the one before it, so the
  // hero arrives as a single move rather than three separate fades. Durations
  // come from gsap.defaults() (0.9s power3.out) - the timing measured off the
  // reference sites.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // fromTo, not from - see the note in Reveal.tsx.
        const tl = gsap.timeline({ delay: 0.15 });

        tl
          // Words tip up off their baseline, pivoting at the bottom edge rather
          // than spinning around their middle.
          //
          // transformPerspective (per word), NOT `perspective` on the h1: a
          // parent perspective gives every word one shared vanishing point at
          // the h1's centre, so the further a word sits from that centre the
          // more its projection slides sideways as it rotates. On a three-line
          // headline that threw the first word of the last line clear off the
          // left edge, where the section's overflow-hidden clipped it. Per-word
          // perspective pivots each word about its own box - no lateral drift.
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
            }
          )
          .fromTo(".hero-sub", { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, "-=0.6")
          .fromTo(
            ".hero-cta",
            { opacity: 0, y: 24 },
            // clearProps for the same reason as Reveal: the button's CSS
            // hover:scale is dead while GSAP's inline transform sits on it.
            // transform only, not "all": the pre-hide in globals.css leaves
            // .hero-cta at opacity 0, so clearing the inline opacity too would
            // hand the button straight back to that rule and hide it.
            { opacity: 1, y: 0, clearProps: "transform" },
            "-=0.7"
          );

        // The wall. Each track holds two copies of its column, and one full
        // cycle slides it by exactly one copy - at which point copy two is
        // sitting where copy one started and the tween can restart with
        // nothing to see. yPercent (not y) is what keeps that true through a
        // resize: the tiles are sized in viewport units, so the travel has to
        // stay a proportion of the track rather than a pixel count.
        //
        // -50% is one copy only because the tiles carry their gutter as
        // margin-bottom instead of the track carrying it as `gap`. With `gap`
        // there is one fewer gutter than tiles (n−1, not n), the two copies
        // are no longer the same height, and the wrap lands half a gutter out
        // - a visible twitch once a cycle.
        //
        // Duration from a measured height so every column drifts at the same
        // px/sec whatever its tiles add up to. offsetHeight is honest here
        // even on the first frame: every tile's height is a calc, so nothing
        // waits on an image to load.
        gsap.utils
          .toArray<HTMLElement>(".hero-track", root.current)
          .forEach((track, i) => {
            const copy = track.offsetHeight / 2;
            const down = i % 2 === 1;
            gsap.fromTo(
              track,
              { yPercent: down ? -50 : 0 },
              {
                yPercent: down ? 0 : -50,
                duration: copy / SCROLL_SPEED,
                ease: "none",
                repeat: -1,
              }
            );
          });
      });
      // useGSAP reverts this context on unmount: every tween above, the
      // matchMedia itself, and the inline transforms they left behind.
    },
    { scope: root }
  );

  // One boolean, published as a DOM attribute rather than React state, for the
  // same reason the theme is: the two things that need it - the navbar's
  // borrowed dark palette and the WebGL backdrop's off switch - are both pure
  // CSS in globals.css, and neither is in this component's tree.
  //
  // scrollY >= the hero's own height is the moment the opaque stack above has
  // covered it completely. offsetHeight, not getBoundingClientRect: sticky
  // pins the visual box at the top but leaves the flow box (and so the height)
  // honest. Read per event, off an already-clean layout - the same passive
  // listener shape the navbar uses.
  //
  // data-overflows is the safety valve, and it has to be measured rather than
  // guessed at a breakpoint: a hero taller than the viewport can't be pinned
  // at top:0, because a sticky element never scrolls and so never reveals what
  // starts below the fold. globals.css unpins it. Also on resize, since that
  // is the one thing that changes the answer without a scroll.
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const videos = Array.from(
      el.querySelectorAll<HTMLVideoElement>(".hero-wall video")
    );
    const near = new Set<HTMLVideoElement>();
    const visible = new Set<HTMLVideoElement>();
    const columnForVideo = new Map<HTMLVideoElement, HTMLElement>();
    const currentByColumn = new Map<HTMLElement, HTMLVideoElement | null>();
    const columns = new Set<HTMLElement>();
    videos.forEach((video) => {
      const column = video.closest<HTMLElement>("[data-hero-column]");
      if (!column) return;
      columnForVideo.set(video, column);
      columns.add(column);
      currentByColumn.set(column, null);
    });
    let past = false;
    let playbackQueued = false;

    const pauseVideo = (video: HTMLVideoElement, reset = false) => {
      video.pause();
      if (reset) {
        try { video.currentTime = 0; } catch { /* ignore */ }
      }
    };

    const showPoster = (video: HTMLVideoElement) => {
      if (!video.hasAttribute("poster") && video.dataset.posterSrc) {
        video.poster = video.dataset.posterSrc;
      }
    };

    const loadVideo = (video: HTMLVideoElement) => {
      showPoster(video);
      if (!video.hasAttribute("src") && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }
    };

    const unloadVideo = (video: HTMLVideoElement, reset = false) => {
      pauseVideo(video, reset);
      if (video.hasAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
    };

    const syncSource = (video: HTMLVideoElement) => {
      if (past || !near.has(video)) {
        unloadVideo(video);
        return;
      }

      showPoster(video);
      const column = columnForVideo.get(video);
      if (!column || currentByColumn.get(column) !== video) unloadVideo(video);
    };

    const playable = (column: HTMLElement) =>
      [...visible].filter(
        (video) => near.has(video) && columnForVideo.get(video) === column,
      );

    const start = (column: HTMLElement, video: HTMLVideoElement) => {
      currentByColumn.set(column, video);
      loadVideo(video);
      void video.play().catch(() => {});
    };

    const ensureColumnPlayback = (column: HTMLElement) => {
      if (past || document.hidden) return;

      const current = currentByColumn.get(column);
      const candidates = playable(column);
      if (current && candidates.includes(current)) return;
      if (current) unloadVideo(current, true);
      currentByColumn.set(column, null);
      if (candidates[0]) start(column, candidates[0]);
    };

    const advanceColumnPlayback = (column: HTMLElement) => {
      if (past || document.hidden) return;

      const current = currentByColumn.get(column);
      const candidates = playable(column);
      if (candidates.length === 0) {
        if (current) unloadVideo(current, true);
        currentByColumn.set(column, null);
        return;
      }

      const currentIndex = current ? candidates.indexOf(current) : -1;
      if (current) unloadVideo(current, true);
      start(column, candidates[(currentIndex + 1) % candidates.length]);
    };

    const ensureAllColumnPlayback = () => {
      columns.forEach(ensureColumnPlayback);
    };

    const scheduleEnsureAllColumnPlayback = () => {
      if (playbackQueued) return;
      playbackQueued = true;
      queueMicrotask(() => {
        playbackQueued = false;
        ensureAllColumnPlayback();
      });
    };
    let nearObserver: IntersectionObserver | null = null;
    let visibleObserver: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      nearObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) near.add(video);
            else near.delete(video);
            syncSource(video);
          });
          scheduleEnsureAllColumnPlayback();
        },
        { root: el, rootMargin: "200px" },
      );
      visibleObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) visible.add(video);
            else visible.delete(video);
            syncSource(video);
          });
          scheduleEnsureAllColumnPlayback();
        },
        { root: el },
      );
      videos.forEach((video) => {
        nearObserver?.observe(video);
        visibleObserver?.observe(video);
      });
    } else {
      // Older browsers still get the poster-first carousel; without viewport
      // observation, keep one video active in each visible wall column.
      videos.forEach((video) => {
        near.add(video);
        visible.add(video);
        showPoster(video);
      });
      scheduleEnsureAllColumnPlayback();
    }

    const intervalId = window.setInterval(() => {
      columns.forEach(advanceColumnPlayback);
    }, HERO_COLUMN_PLAYBACK_MS);
    const onVisibilityChange = () => {
      if (document.hidden) {
        videos.forEach((video) => unloadVideo(video));
        columns.forEach((column) => currentByColumn.set(column, null));
      } else {
        scheduleEnsureAllColumnPlayback();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const sync = () => {
      const height = el.offsetHeight;
      const nextPast = window.scrollY >= height;
      document.documentElement.toggleAttribute(
        "data-past-hero",
        nextPast
      );
      el.toggleAttribute("data-overflows", height > window.innerHeight);
      if (nextPast !== past) {
        past = nextPast;
        videos.forEach(syncSource);
        if (past) {
          columns.forEach((column) => currentByColumn.set(column, null));
        } else {
          scheduleEnsureAllColumnPlayback();
        }
      }
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      nearObserver?.disconnect();
      visibleObserver?.disconnect();
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      videos.forEach((video) => unloadVideo(video));
      document.documentElement.removeAttribute("data-past-hero");
    };
  }, []);

  // h-svh, not min-h-svh: the hero and the navbar over it are one screenful,
  // seen without scrolling. A minimum let the content set the height, and on a
  // short laptop it set it taller than the viewport - which is what
  // #top[data-overflows] in globals.css exists to rescue (it unpins the hero so
  // the buttons stay reachable). An exact height plus type that is sized
  // against svh means the content fits instead of being rescued, and the
  // rescue rule now only fires if something here grows past its budget.
  //
  // Every vertical step below - the padding, the gaps, the type, the button -
  // is a clamp with an svh term, so the whole stack shrinks with the viewport
  // rather than falling off the bottom of it. The vw terms are the width
  // guards; min() takes whichever is tighter.
  //
  // svh, not dvh: dvh tracks the mobile browser chrome collapsing on scroll,
  // which would resize the hero mid-scroll - and the hero's height is a live
  // input to three other things (Aurora re-syncs its drawing buffer on resize,
  // the wall's cover size is solved against it, and the data-past-hero
  // threshold above is measured off offsetHeight). svh is the one that holds
  // still, and it is the height that is visible with the mobile chrome *open*
  // - so the hero fits the first paint, not just the scrolled state.
  //
  // The section itself stays full-bleed, and the aurora with it - a backdrop
  // that stops short of the edges is just a panel. The 72rem cap the navbar
  // uses is applied to the two pieces of *content* instead: the text column
  // takes it as a max-width, the wall as --bw. Both are min()s against the
  // viewport, so below 72rem neither does anything and the hero is the layout
  // it was; above it, the headline and the media stop drifting apart and stay
  // in the same band as the bar above them.
  //
  // sticky top-0 with <main> as the containing block: the hero pins on the
  // first pixel of scroll and the rest of the page - one opaque z-10 stack in
  // page.tsx - travels up over it. Nothing here is scroll-driven, so there is
  // no scrub to fight native scroll on a phone; the whole effect is two
  // z-indexes.
  //
  // theme-dark swapped the section onto the site's one other palette - the dark
  // espresso stage. Off with the aurora backdrop: the stage existed to be the
  // ground that backdrop cleared to, and without it the hero just takes the
  // page palette, same as every section below. Put `theme-dark ` back at the
  // head of the className to restore it, and uncomment the navbar half of the
  // selector in globals.css with it - the bar borrows this palette while the
  // hero is under it, so the two go back together or the bar is light ink on a
  // light hero.
  return (
    <section
      id="top"
      ref={root}
      className="sticky top-0 z-0 flex h-svh items-center overflow-hidden px-5 pt-[clamp(3.5rem,11svh,6rem)] pb-[clamp(1.25rem,3svh,2rem)] md:px-8"
    >
      {/* Hero-only backdrop. It clears to the bg token (opaque), which under
          theme-dark is the stage's own ground - so this is the hero's whole
          background rather than a layer over the page's. It is what fills the
          strip to the left of the wall. Content sits above it; globals.css
          drops it entirely once the page is past the hero, which is what stops
          its render loop. */}
      {/* The same field the rest of the page runs (MeshGradient), on a second
          mount: page.tsx puts its own inside the post-hero sheet, which is
          opaque and z-10, so that instance physically cannot reach up here.
          Two mounts is the only way one field covers both, and it costs a
          second WebGL context - both pause through the same
          IntersectionObserver, so only one is ever drawing.

          Same field, same stops, no per-instance palette: this is the page's
          mesh continued up over the hero, which is the whole point.

          .mesh-bg brings its own sticky/100vh/z-index:-1; inside this absolute
          z-0 box that resolves to "fills the hero, behind nothing else", so
          there is no CSS to add. And the display:none rule below still applies
          to .hero-backdrop, which is what kills the render loop past the hero -
          same switch Aurora used.

          The Aurora original is kept below. */}
      <div
        aria-hidden
        className="hero-backdrop pointer-events-none absolute inset-0 z-0"
      >
        <MeshGradient />
      </div>

      {/* <div
        aria-hidden
        className="hero-backdrop pointer-events-none absolute inset-0 z-0"
      >
        <Aurora
          colorStops={["#6fa8dc", "#223057", "#8b5cf6"]}
          blend={0.5}
          amplitude={1.5}
          speed={0.8}
        />
      </div> */}

      {/* The wall's window: full height, hard against the *band's* right edge,
          and starting --wl into it so it runs on under the text.
          overflow-hidden is what turns the oversized rotated block into a clean
          rectangle, and --wall-w (this box's real width) is what the cover
          maths above is solved against. --wl is the one responsive value;
          everything else derives.

          Sized in px rather than by max-width + mx-auto because --wall-w has to
          come out a length: it feeds COVER_H, and a percentage in a height
          calc resolves against the height. --gut is that same centring done
          arithmetically, which leaves the width available as a number. */}
      <div
        aria-hidden
        className="hero-wall pointer-events-none absolute inset-y-0 z-1 overflow-hidden [--wl:0px] md:[--wl:var(--wall-left)]"
        style={
          {
            // Same cap as the text band below (and every other section's
            // mx-auto max-w-[1600px]) - they have to match or the wall stops
            // short of the band's right edge.
            "--bw": "min(100vw, 1600px)",
            // 100% here, 100vw above, and the difference is the scrollbar.
            // --bw has to be a length (it feeds COVER_H), so it takes the vw;
            // --gut only ever positions, so it takes the percentage - which
            // resolves against the section's padding box, the same width
            // mx-auto centres the text band in. With 100vw on both, the wall
            // landed half a scrollbar right of the text and finished short of
            // it. Below the cap --gut goes to zero (or slightly negative, into
            // the section's own overflow-hidden) and the wall is edge-to-edge
            // exactly as before.
            "--gut": "calc((100% - var(--bw)) / 2)",
            "--wall-left": WALL_LEFT,
            "--wall-w": "calc(var(--bw) - var(--wl))",
            left: "calc(var(--gut) + var(--wl))",
            right: "var(--gut)",
            maskImage: WALL_FADE_TOP,
            WebkitMaskImage: WALL_FADE_TOP,
          } as CSSProperties
        }
      >
        {/* Second mask layer - see WALL_FADE_LEFT for why it is a nested
            element and not a second entry in the list above. */}
        {/* Below md the text column is the full width, so there is no clear
            side for the wall to be on and the horizontal ramp alone can't buy
            enough contrast - it only reaches 45% of the way across before the
            first glyph. The opacity is the phone's answer instead: the wall
            stays a texture behind the type rather than a picture under it.
            Cheaper than a scrim too, and it keeps the "no overlay" rule. */}
        <div
          className="absolute inset-0 opacity-40 [--fx:100%] md:opacity-100 md:[--fx:45%]"
          style={{ maskImage: WALL_FADE_LEFT, WebkitMaskImage: WALL_FADE_LEFT }}
        >
          {/* The rigid block: one rotation for all four columns, pinned by its
              own centre to the window's centre so the cover maths above is
              symmetric. --cover-h is the unit every tile height is a fraction
              of. */}
          <div
            className="hero-wall-block absolute top-1/2 left-1/2 flex"
            style={{
              width: COVER_W,
              height: COVER_H,
              gap: GAP,
              transform: `translate(-50%, -50%) rotate(${TILT}deg)`,
              "--cover-h": COVER_H,
            } as CSSProperties}
          >
            {COLUMNS.map((items, i) => (
              // flex-1 is what makes the columns equal-width for any COLUMNS
              // length; overflow-hidden keeps each track's spill off its
              // neighbours' rows.
              <div
                key={i}
                data-hero-column={i}
                className="relative flex-1 overflow-hidden"
              >
                <div className="hero-track flex flex-col will-change-transform">
                  {/* Two copies, which is the whole trick: the tween only ever
                      has to travel the length of one. */}
                  <Tiles items={items} />
                  <Tiles items={items} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two boxes, and they are not interchangeable. The outer one is the
          72rem band, centred - so on a 4K screen the headline sits over the
          navbar rather than a third of a screen to its left. The inner one is
          the half of that band the text gets.

          The split has to be a width on a child, not padding on the band: a
          percentage padding resolves against the *containing block*, which
          here is the section's content box, not the 72rem the band settled at.
          At 4K that is pr:50% of 3776px on an 1152px box - the text column
          collapses to nothing.

          50% of the band against the wall's 55%, so they still overlap by 5%
          and the wall's fade has already taken it to nothing by the time it
          reaches any glyph. No scrim - see WALL_FADE_LEFT. */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <div className="md:w-1/2">
          {/* Not --text-display. That token is solved against the viewport
            alone, which is the right answer for a headline that owns the full
            width and the wrong one here twice over: in a 50vw column it asks
            for more width than there is between md and ~1300px, and in a hero
            that must fit one screen it ignores height entirely.

            min(vw, svh) takes whichever constraint is tighter, so the same
            declaration answers both - 6.2vw is the width budget for the
            longest line, 10svh is three lines plus the rest of the stack
            inside the viewport.

            The 4.75rem ceiling is the band cap paying for itself, not taste.
            Past 72rem the column stops at 576px however wide the screen gets,
            and the nowrap line below needs 7.22× the font size - so anything
            over ~4.98rem overflows into the section's overflow-hidden and is
            silently trimmed. 76px is that limit with enough slack to survive a
            font swap. The floor is still the old ladder's 40px.

            No text-balance: the first line is nowrap and the balancer would be
            reasoning about a line it cannot break. */}
          <h1 className="text-[clamp(2.5rem,min(6.2vw,11svh),4.75rem)] font-extrabold leading-[1.05] tracking-tight">
            {/* One line, always. The break used to be a hard <br> after this
              phrase, which is the same thing said less strictly: nowrap keeps
              it together and lets the *next* line break wherever the column
              width wants it. The size clamp above is what stops nowrap turning
              into overflow - measured, the phrase sets 7.22× its own font
              size, so below the band cap it needs 7.22 × 6.2vw = 45vw of the
              50% the column has, and above it 549px of 576. Re-measure that
              ratio if the wording or the font changes - it overflows
              silently. */}
            <span className="whitespace-nowrap">
              <Words className="hero-word" text="We make brands" />
            </span>
            <br />
            {/* Boxed per word so the tail joins the same stagger as everything
              above it, rather than fading in as one block. The cost is that
              `.text-gradient` clips its own background per box, so the
              honey→cinnamon ramp restarts on each of these three words instead
              of running once across the phrase. Per-word boxes are small
              enough to still wrap normally; it was boxing the *whole* phrase
              that used to cost the headline a line. The period rides inside
              the last box but outside the gradient span, so it stays
              text-coloured.

              iOS glass alternative - commented directly below; swap it back in
              and comment the gradient trio. `.text-glass` is still in
              globals.css and this is still the live pair of options. Each
              glyph becomes a cut-out onto whatever is behind them, so unlike
              the gradient it doesn't restart per box; the period goes inside
              the glass because left solid against it, it reads as a stray
              white square.

              It came out when the wall went in, not by taste: the filter is
              tuned (brightness 5.4) against a smooth aurora, and over
              photographs it reads as blown-out cut-outs. Put it back if the
              wall ever comes out, or if you re-tune the brightness for it.
*/}
            {/* <span className="hero-word text-glass inline-block">
              impossible
            </span>{" "}
            <span className="hero-word text-glass inline-block">to</span>{" "}
            <span className="hero-word text-glass inline-block">ignore.</span> */}
            <span className="hero-word text-gradient inline-block">
              impossible
            </span>{" "}
            <span className="hero-word text-gradient inline-block">to</span>{" "}
            <span className="hero-word inline-block">
              <span className="text-gradient">ignore.</span>
            </span>
          </h1>

          {/* The service list moved down here when the headline lost it - the
            headline now carries the promise and this carries the proof. */}
          <p className="hero-sub mt-[clamp(0.75rem,2.8svh,1.75rem)] max-w-xl text-balance text-[clamp(0.95rem,min(1.35vw,2.05svh),1.2rem)] leading-relaxed text-text-muted">
            A full-service digital studio for ambitious teams. From website development and AI avatar videos to social media management, ad campaigns, and design, we deliver premium work with rapid turnarounds.
          </p>

          {/* Magnetic owns transform on the wrapper; GSAP's entrance owns it on
            the anchor inside. Two elements, so neither clobbers the other. */}
          {/* Content-width, never full-bleed - a button that spans the column
              reads as a form field, and on a phone the column is the screen. */}
          <div className="mt-[clamp(1rem,3.8svh,2.25rem)] flex">
            <Magnetic>
              {/* Two surfaces, not one: the label pill and the icon disc each
                  carry their own background, radius and glow, and they sit flush
                  so the seam between them is the only thing separating them.
                  The <a> keeps the height (as --cta-h, which is also the disc's
                  width - that is what makes it a circle rather than an oval),
                  the text colour the arrows inherit, and the hover scale, so
                  both halves still move as one control.

                  items-stretch, not items-center: the two spans take the anchor's
                  full height on their own, which is what keeps their radii
                  identical without repeating the clamp. */}
              <a
                href="#contact"
                className="hero-cta group inline-flex h-(--cta-h) items-stretch text-[clamp(0.875rem,1.9svh,1rem)] font-semibold text-bg transition-transform [--cta-h:clamp(2.75rem,6.5svh,3.25rem)] hover:scale-[1.03]"
              >
                <span className="grid place-items-center rounded-full brand-gradient px-7">
                  {/* The label rolls up while the arrow beside it flies out
                      diagonally - same swap, and they run on the same hover. */}
                  <Roll>Elevate Your Brand</Roll>
                </span>

                <span className="grid w-(--cta-h) shrink-0 place-items-center rounded-full brand-gradient">
                  {/* Two arrows on a belt: on hover the seated one flies out
                    and its twin - parked one trip down-left, outside the clip -
                    takes the slot. Same duration, no delay, or it reads as two
                    animations rather than one.

                    The clip stays its own 20px box inside the disc rather than
                    becoming the disc: the trip below is sized against it, so a
                    clip the width of the button would let the flying arrow park
                    in plain sight halfway to the edge.

                    Two things are load-bearing and neither is obvious. The 20px
                    clip has to clear the glyph's *drawn* ink (~15.3px once
                    turned 45°, not its 16px box) while the 24px trip has to
                    exceed clip + ink, or the flying arrow parks a sliver on the
                    edge - so resize the icon and re-measure both. And rotate-45
                    only composes with the translates because Tailwind v4 emits
                    them as separate `rotate`/`translate` properties, applied
                    translate → rotate; as one `transform` the arrows would fly
                    off at 90° to themselves. */}
                  <span className="relative h-5 w-5 overflow-hidden">
                    <ArrowUp
                      strokeWidth={2.2}
                      className="absolute inset-0 m-auto h-4 w-4 rotate-45 transition-transform duration-300 group-hover:translate-x-6 group-hover:-translate-y-6"
                    />
                    <ArrowUp
                      strokeWidth={2.2}
                      className="absolute inset-0 m-auto h-4 w-4 -translate-x-6 translate-y-6 rotate-45 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0"
                    />
                  </span>
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Absolute, so it contributes no height. Every vertical step in this
          section is a clamp solved to make the content fit h-svh exactly, and
          an in-flow pill at the bottom would be the one thing growing past that
          budget - straight into the #top[data-overflows] rescue this layout
          exists to avoid needing.

          short:hidden is the collision guard rather than a height guess. The
          stack is centred, so the room under it is whatever h-svh has spare,
          and on a viewport short enough for that to run out this would land on
          the CTA. `short` is already the breakpoint that means exactly "no
          vertical room to spare" (see globals.css), so it is the honest test.
          md:hidden because the ask was phones; together they leave it on the
          tall narrow screens that have both the room and the need. */}
      <ScrollHint
        href="#manifesto"
        className="absolute bottom-[clamp(1rem,3.5svh,2rem)] left-1/2 z-20 -translate-x-1/2 bg-bg/40 backdrop-blur-sm md:hidden short:hidden"
      />
    </section>
  );
}
