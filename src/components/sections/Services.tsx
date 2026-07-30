"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

export type ServiceItem = {
  /** Typed as ReactNode, which `string` satisfies — so `{ icon: "/x.svg" }`
      items still type-check, while the defaults below keep the inline
      currentColor SVGs the rest of the site uses (an <img> can't follow the
      theme's accent tokens). */
  icon: ReactNode;
  heading: string;
  description: string;
  /** Both optional, and both rendered inline. The card is sized to hold the
      whole service — there is no disclosure here, so on portrait the card
      hugs its content rather than holding a ratio it cannot fill. */
  detail?: string;
  deliverables?: string[];
};

// 24×24 stroke icons (currentColor) — no icon dependency.
const icon = (path: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const SERVICES: ServiceItem[] = [
  {
    heading: "Website Design & Development",
    description: "Fast, conversion-focused sites built to sell.",
    detail:
      "Design and build in one place — no handoff gaps. Accessible, SEO-ready, and fast on every device.",
    deliverables: ["UX & UI design", "Next.js build", "CMS & analytics", "Core Web Vitals"],
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="15" rx="2" />
        <path d="M3 8h18" />
        <path d="m9 12 2 2-2 2M15 12l-2 2 2 2" />
      </>
    ),
  },
  {
    heading: "Social Media Marketing",
    description: "Content and campaigns that grow real audiences.",
    detail:
      "Strategy, content calendars, and paid campaigns tuned to your market — measured by reach, engagement, and pipeline.",
    deliverables: ["Content strategy", "Post design", "Paid campaigns", "Monthly reporting"],
    icon: icon(
      <>
        <path d="M4 15a4 4 0 0 1 4-4h1V6a3 3 0 0 1 6 0v5h1a4 4 0 0 1 0 8H8a4 4 0 0 1-4-4Z" />
        <path d="m9 13 2 2 4-4" />
      </>
    ),
  },
  {
    heading: "Motion Graphics",
    description: "Animated brand systems that stop the scroll.",
    detail:
      "Logo animations, explainers, and social motion built from a consistent kit so your brand moves the same everywhere.",
    deliverables: ["Logo animation", "Explainers", "Social motion", "Lower-thirds kit"],
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    heading: "Video Editing",
    description: "Story-first edits, color, and sound that land.",
    detail:
      "Short-form and long-form editing with color grading, sound design, captions, and delivery specs for every platform.",
    deliverables: ["Short & long form", "Color grade", "Sound design", "Captions & delivery"],
    icon: icon(
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h4m10 0h4M3 15h4m10 0h4M8 5v14m8-14v14" />
      </>
    ),
  },
  {
    heading: "AI-Generated Avatars & Video",
    description: "Scale video production without a film crew.",
    detail:
      "Lifelike AI presenters and generated scenes for ads, explainers, and localization — produced in days, not weeks.",
    deliverables: ["AI presenters", "Script to video", "Localization", "Ad variations"],
    icon: icon(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20a7 7 0 0 1 14 0" />
        <path
          d="m19 3 .7 1.8L21.5 5.5l-1.8.7L19 8l-.7-1.8L16.5 5.5l1.8-.7z"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),
  },
];

/** Max degrees of hover tilt in each axis. */
const TILT = 9;
/** Card pitch as a multiple of card width — the reference's plane+padding gap. */
const PITCH = 1.18;
/** The reference's `bend` is the sag, in world units, of the card at the edge
    of the viewport — and half a 16:10 desktop viewport is ~13.25 of them
    (2·tan(22.5°)·20·1.6/2). Scaling the sag by half the container *width*
    rather than its height reproduces bend={3}'s ~25° edge tilt exactly on a
    desktop, and is the one place this departs from the reference on purpose:
    the arc spans the width, so pinning its depth to the height makes it savage
    on a portrait phone — R collapses and the outer cards pass 45°. Over there
    that never shows, because a WebGL gallery of photos is only ever seen wide. */
const REF_HALF_WIDTH = 13.25;

type ServicesProps = {
  items?: ServiceItem[];
  /** Arc curvature. 0 is a flat row; sign flips the arc. */
  bend?: number;
  /** Tailwind radius class (or any CSS length). */
  cardRadius?: string;
  scrollSpeed?: number;
  scrollEase?: number;
};

/**
 * Section 4 — services, on a curved rail.
 *
 * A CSS-3D port of React Bits' CircularGallery: same arc math, same lerped
 * easing, same snap — but the cards are real DOM, so the headings are text a
 * screen reader and a search engine can read rather than pixels baked into a
 * texture. That rules out the reference's WebGL entirely (and its `ogl`
 * dependency with it): every card is a positioned <div> the rAF loop writes one
 * `transform` to.
 *
 * Two nested boxes per card, and the split is load-bearing: the loop owns the
 * outer element's transform, the pointer owns the inner one's. One element
 * couldn't carry both — whichever wrote last would erase the other every frame.
 */
export default function Services({
  items = SERVICES,
  // The reference's units, but a third of its default. Its cards are photos,
  // which read fine at the ~25° the outer ones pick up at bend={3}; ours are
  // paragraphs, and rotated body copy stops being readable well before that.
  bend = 1,
  cardRadius = "rounded-3xl",
  scrollSpeed = 2,
  scrollEase = 0.08,
}: ServicesProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const scroll = useRef({ pos: 0, target: 0 });
  const drag = useRef<{ x: number; from: number } | null>(null);
  const raf = useRef(0);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Assigned by the effect so every handler drives the one live `tick`; the
  // handlers are rebuilt each render, the loop is not.
  const start = useRef<() => void>(() => {});
  // Measured in the effect below, read by the loop — never props, so the loop
  // can't hold a stale one.
  const geo = useRef({ pitch: 0, span: 0, half: 1, sag: 0, shift: 0 });

  // Gate for the tilt. Live (not a one-shot read) so plugging a mouse into a
  // tablet turns it on, same as the navbar watches its theme query.
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const vp = viewport.current;
    if (!vp) return;

    // Card size comes from CSS, so this only reads back what CSS decided —
    // which is why an orientation change needs nothing but a re-measure.
    //
    // The rail's own height is derived here rather than set in CSS. The arc
    // sags *downward*, so nearly all the room it needs is below the centre
    // card; a fixed height with the cards pinned at top-1/2 splits the slack
    // evenly and leaves the entire top half as dead space under the heading.
    // Sampling the same arc the layout draws is simpler than solving it — the
    // extremes are a rotated card's corners, and 40 steps across the half
    // width finds them to well under a pixel without any calculus.
    const measure = () => {
      const first = cards.current[0];
      if (!first) return;
      const w = first.offsetWidth;
      const half = vp.clientWidth / 2 || 1;
      const sag = (bend * half) / REF_HALF_WIDTH;
      // Heights follow content and so differ per service — the rail has to
      // clear the tallest one.
      const tall = Math.max(...cards.current.map((el) => el?.offsetHeight ?? 0));

      const B = Math.abs(sag);
      const R = B ? (half * half + B * B) / (2 * B) : 0;
      const dir = Math.sign(sag);
      let top = -tall / 2;
      let bottom = tall / 2;
      for (let s = 1; R && s <= 40; s++) {
        const ex = (half * s) / 40;
        const y = (R - Math.sqrt(R * R - ex * ex)) * dir;
        const rot = Math.asin(ex / R);
        // Half-height of the card's bounding box once rotateZ has turned it —
        // the corner reaches further than the edge did.
        const reach = (tall * Math.cos(rot) + w * Math.sin(rot)) / 2;
        top = Math.min(top, y - reach);
        bottom = Math.max(bottom, y + reach);
      }

      geo.current = {
        pitch: w * PITCH,
        span: w * PITCH * cards.current.length,
        half,
        sag,
        // Cards are anchored at top-1/2, which centres the *centre card*.
        // Shifting every card by this centres the arc as a whole instead, so
        // the height above is only what the centre card actually occupies.
        shift: -(top + bottom) / 2,
      };
      // Overrides the h-/min-h- classes, which stay as the pre-hydration
      // fallback so the section does not collapse before this first runs.
      vp.style.minHeight = "0px";
      vp.style.height = `${Math.ceil(bottom - top)}px`;
    };

    const layout = () => {
      const { pitch, span, half, sag, shift } = geo.current;
      if (!pitch) return;
      const B = Math.abs(sag);
      // Circle through the centre card and the one sagging by B at x = ±half.
      const R = B ? (half * half + B * B) / (2 * B) : 0;
      const dir = Math.sign(sag);

      cards.current.forEach((el, i) => {
        if (!el) return;
        // Wrap into [-span/2, span/2). The reference tracks a per-card `extra`
        // and the scroll direction to recycle cards off each edge; one modulo
        // does the same job and can't drift out of sync.
        let x = (((i * pitch - scroll.current.pos) % span) + span) % span;
        if (x > span / 2) x -= span;

        let y = shift;
        let z = 0;
        let rot = 0;
        if (R) {
          const ex = Math.min(Math.abs(x), half);
          const arc = R - Math.sqrt(R * R - ex * ex);
          // CSS y points down and rotateZ turns clockwise — both opposite to
          // the reference's GL frame, so both signs are flipped from it.
          y += arc * dir;
          rot = Math.sign(x) * ((Math.asin(ex / R) * 180) / Math.PI) * dir;
          // The reference has no depth: its arc is a flat plane bent in y under
          // a perspective camera. Here the same sag doubles as recession, which
          // is what makes an arc of DOM read as curved rather than as a row
          // sliding downhill.
          z = -arc;
        }
        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rot}deg)`;
      });
    };

    const tick = () => {
      const s = scroll.current;
      s.pos += (s.target - s.pos) * scrollEase;
      // Park the loop once it has arrived. The reference runs rAF for the life
      // of the page; this section sits two thirds of the way down a long one.
      if (Math.abs(s.target - s.pos) < 0.1 && !drag.current) {
        s.pos = s.target;
        raf.current = 0;
        layout();
        return;
      }
      layout();
      raf.current = requestAnimationFrame(tick);
    };
    start.current = () => {
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      layout();
    };
    measure();
    layout();
    window.addEventListener("resize", onResize);

    // A card's height is its text, and its text is not final at mount — a
    // webfont swapping in after hydration reflows it taller, and a rail
    // measured before that stays too short and clips the arc. Watching the
    // cards catches it, and every other late reflow, without guessing at
    // which. This cannot feed back: with no max-height on the card, its
    // height no longer depends on the rail height measure() writes.
    const ro = new ResizeObserver(onResize);
    cards.current.forEach((el) => el && ro.observe(el));

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(snapTimer.current);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [bend, scrollEase, items]);

  /** Land on a whole card, the way the reference's onCheck does. */
  const snap = () => {
    const { pitch } = geo.current;
    if (pitch) scroll.current.target = Math.round(scroll.current.target / pitch) * pitch;
    start.current();
  };
  const snapSoon = () => {
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(snap, 200);
  };

  return (
    <section id="services" className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>What we do</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-section font-bold tracking-tight">
            Five services, one <span className="text-gradient">creative team</span>.
          </h2>
        </Reveal>
      </div>

      {/* Edge to edge: the arc's ends are meant to run off the viewport, so the
          section's own gutter is cancelled rather than cropping it.
          touch-pan-y keeps vertical page scroll native on a phone while
          claiming horizontal drags for the rail. */}
      <div
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Services. Drag sideways, or use the Left and Right Arrow keys, to browse."
        // A real margin now, because the rail no longer carries dead headroom
        // to borrow it from: `measure` sizes it to the arc and pins the top of
        // it to the top of the centre card. The h-/min-h- pair is only the
        // pre-hydration fallback, overridden inline on the first measure.
        className="relative -mx-5 mt-10 h-[42svh] min-h-[22rem] cursor-grab touch-pan-y overflow-hidden [perspective:1200px] active:cursor-grabbing md:-mx-8 md:mt-14"
        onWheel={(e) => {
          // Vertical wheel stays with the page. The reference binds it to the
          // rail, but it is a full-screen gallery — here the rail is one
          // section of a long scroll, so mapping deltaY to it means the cards
          // spin every time you scroll past. Only a deliberate horizontal
          // gesture (trackpad swipe, shift+wheel) drives it.
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
          // 2% of a card per notch at the default speed — the reference's ratio
          // of scroll step to card pitch, in pixels instead of world units.
          scroll.current.target += Math.sign(e.deltaX) * scrollSpeed * 0.02 * geo.current.pitch;
          start.current();
          snapSoon();
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { x: e.clientX, from: scroll.current.target };
          // Capture, so a drag that leaves the section still tracks — and so
          // release always lands on this element. No window listeners to leak.
          e.currentTarget.setPointerCapture(e.pointerId);
          clearTimeout(snapTimer.current);
          start.current();
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          // scrollSpeed 2 is 1:1 with the finger. The reference amplifies drag
          // ~2.7×, which on a touchscreen means the card outruns the thumb.
          scroll.current.target =
            drag.current.from + (drag.current.x - e.clientX) * scrollSpeed * 0.5;
          start.current();
        }}
        onPointerUp={() => {
          if (!drag.current) return;
          drag.current = null;
          snap();
        }}
        onPointerCancel={() => {
          drag.current = null;
          snap();
        }}
        onKeyDown={(e) => {
          const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!dir || !geo.current.pitch) return;
          e.preventDefault();
          scroll.current.target =
            (Math.round(scroll.current.target / geo.current.pitch) + dir) * geo.current.pitch;
          start.current();
        }}
      >
        {/* Doubled, as the reference doubles its items: the rail is infinite,
            so there has to be enough of it to cover the widest viewport before
            the wrap comes round. The copies are hidden from the a11y tree. */}
        {items.concat(items).map((item, i) => {
          const n = i % items.length;
          return (
            <div
              key={`${item.heading}-${i}`}
              ref={(el) => {
                cards.current[i] = el;
                return () => {
                  cards.current[i] = null;
                };
              }}
              aria-hidden={i >= items.length}
              // Positioned from the centre; the loop's transform starts by
              // pulling back half its own size, so the arc math works in plain
              // offsets from the middle of the viewport.
              // Width is set, height is whatever the service needs — no fixed
              // ratio in either orientation. A ratio decides the height before
              // knowing the content, so it is always either short (9:16 gave a
              // ~360px box for ~460px of copy on a 390px phone, and the
              // overflow escaped out of the top — the icon floating above the
              // card) or tall (16:9 gave a 336px box for 272px of content, and
              // the slack had to be parked somewhere). Sizing to the content
              // has neither failure.
              //
              // Deliberately no max-height. The rail is measured *from* these
              // cards, so capping them against it is a cycle: on the first
              // measure the rail is still the CSS fallback, which clamped a
              // 363px card to 352px on a 320px phone, sized the rail from the
              // clamped figure, and then let the card grow back out past it.
              className="absolute top-1/2 left-1/2 h-auto w-[min(78vw,22rem)] will-change-transform landscape:w-[min(46vw,38rem)]"
              // Tilt is desktop-only by construction: on a coarse pointer no
              // handler is attached at all, so none of this runs.
              onMouseMove={
                fine
                  ? (e) => {
                      const el = e.currentTarget.firstElementChild as HTMLElement;
                      // offsetX/Y are in the card's own coordinates, so they
                      // stay correct under the rotateZ the arc applies. The
                      // content inside is pointer-events-none, which keeps this
                      // element the event target instead of the <h3>.
                      const { offsetX, offsetY } = e.nativeEvent;
                      const rx = (0.5 - offsetY / e.currentTarget.offsetHeight) * 2 * TILT;
                      const ry = (offsetX / e.currentTarget.offsetWidth - 0.5) * 2 * TILT;
                      el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
                    }
                  : undefined
              }
              onMouseLeave={
                fine
                  ? (e) => {
                      // Clearing the inline transform hands it back to the
                      // class transition, which eases it flat.
                      (e.currentTarget.firstElementChild as HTMLElement).style.transform = "";
                    }
                  : undefined
              }
            >
              <div
                // No justify-*: the card is the height of this content, so
                // there is no free space to distribute. It only reappears if
                // max-h-full clamps a very long service against the rail, and
                // the flex-start default is the right answer there too — the
                // pills go, never the icon and heading.
                className={`pointer-events-none flex h-full w-full flex-col gap-4 overflow-hidden border border-border bg-surface p-5 shadow-[0_28px_70px_-30px_var(--raw-glow)] transition-transform duration-200 ease-out select-none sm:p-7 ${
                  cardRadius.startsWith("rounded") ? cardRadius : ""
                }`}
                style={
                  cardRadius.startsWith("rounded") ? undefined : { borderRadius: cardRadius }
                }
              >
                <div>
                  {/* Icon and heading share one line, centred against each
                      other so the two read as a single title however many
                      lines the heading wraps to. The icon is a fixed square
                      and shrink-0 — as a flex item it would otherwise be
                      squashed narrower than its own SVG on a short heading. */}
                  <div className="flex items-center gap-3">
                    {/* Accent alternates honey/cinnamon down the list, keyed to
                        the item rather than the rendered index so a card and
                        its copy on the far side of the rail are never
                        different colours. */}
                    <span
                      className={`grid size-7 shrink-0 place-items-center ${
                        n % 2 === 0 ? "text-accent-primary" : "text-accent-secondary"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <h3 className="text-card font-semibold tracking-tight">{item.heading}</h3>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">{item.description}</p>
                </div>

                {item.detail && (
                  <p className="border-t border-border pt-4 text-xs leading-relaxed text-text-muted">
                    {item.detail}
                  </p>
                )}

                {item.deliverables && (
                  <ul className="flex flex-wrap gap-1.5">
                    {item.deliverables.map((d) => (
                      <li
                        key={d}
                        className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-text-muted"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
