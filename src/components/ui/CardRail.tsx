"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type RailItem = {
  /** Typed as ReactNode, which `string` satisfies — so `{ icon: "/x.svg" }`
      items still type-check, while the defaults in the sections keep the inline
      currentColor SVGs the rest of the site uses (an <img> can't follow the
      theme's accent tokens). */
  icon: ReactNode;
  heading: string;
  description: string;
  /** Both optional, and both rendered inline. The card is sized to hold the
      whole item — there is no disclosure here, so on portrait the card
      hugs its content rather than holding a ratio it cannot fill. A rail whose
      items carry neither (WhyUs) simply gets shorter cards, and `measure`
      below sizes the rail to whatever they came out as. */
  detail?: string;
  deliverables?: string[];
};

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

/** How long a flick keeps travelling after release, in ms of its own velocity.
    0 restores the old behaviour: let go and the rail snaps to whichever card is
    nearest, so a hard swipe and a nudge move exactly the same distance — which
    reads as the rail ignoring the gesture. At 160 a fast thumb crosses two or
    three cards and a slow one still lands on the next. */
const FLICK_MS = 160;

/** A trackpad gesture counts as horizontal when deltaX dominates. Defined once
    and read twice — the rail uses it to decide whether to move, the native
    listener uses it to decide whether to take the gesture off the browser. The
    two have to agree: disagree one way and a swipe navigates the page while the
    rail sits still, disagree the other and vertical scrolling gets trapped. */
const isHorizontal = (e: { deltaX: number; deltaY: number }) =>
  Math.abs(e.deltaX) > Math.abs(e.deltaY);

type CardRailProps = {
  items: RailItem[];
  /** Read out to screen readers as the carousel's name. */
  label: string;
  /** Arc curvature. 0 is a flat row; sign flips the arc. */
  bend?: number;
  /** Tailwind radius class (or any CSS length). */
  cardRadius?: string;
  scrollSpeed?: number;
  /** Settle rate: the fraction of the remaining distance covered per frame at
      60fps. Held to that meaning on any refresh rate — see the loop. Only the
      wheel, the arrow keys and the post-release snap use it; a drag is 1:1. */
  scrollEase?: number;
};

/**
 * The curved card rail, shared by Services and WhyUs.
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
 *
 * Everything that varies between the two sections is a prop or comes off the
 * items, and everything that doesn't is measured — so a rail of four short
 * cards and a rail of five tall ones need no separate tuning.
 */
export default function CardRail({
  items,
  label,
  // The reference's units, but a third of its default. Its cards are photos,
  // which read fine at the ~25° the outer ones pick up at bend={3}; ours are
  // paragraphs, and rotated body copy stops being readable well before that.
  bend = 1,
  cardRadius = "rounded-2xl",
  scrollSpeed = 2,
  // 0.08 took ~460ms to close 90% of the snap — fine as a background drift,
  // too slow as the answer to letting go of a card. 0.12 lands it in ~300ms.
  scrollEase = 0.12,
}: CardRailProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const scroll = useRef({ pos: 0, target: 0 });
  // `v` is rail px per ms, `t` the timestamp it was last sampled at — both only
  // exist to size the flick on release.
  const drag = useRef<{ x: number; from: number; v: number; t: number } | null>(null);
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
      // Heights follow content and so differ per item — the rail has to
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

    let last = 0;
    const tick = (now: number) => {
      const s = scroll.current;
      // Seconds since the previous frame. `last` is cleared when the loop parks
      // below, so a restart begins on the 1/60 fallback rather than measuring
      // against whenever it last stopped; the clamp covers a backgrounded tab.
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;

      if (drag.current) {
        // Under a finger the rail *is* the finger — no easing at all. Easing
        // here is what made the drag feel slow: `target` tracked the pointer
        // 1:1, but `pos` (the thing actually drawn) crawled after it at 8% of
        // the remaining gap per frame, which takes ~0.5s to close 90% of it.
        // Every pixel of that gap reads as the card lagging the thumb, and on
        // touch — where the finger is literally on the card — that is the whole
        // complaint. The lerp still runs for the wheel, the keys and the
        // post-release snap, which are the cases it was actually for.
        s.pos = s.target;
      } else {
        // Frame-rate independent form of `pos += (target - pos) * scrollEase`.
        // The naive version converges in a fixed number of *frames*, so the
        // same constant settles twice as fast on a 120Hz phone and half as fast
        // on one dropping to 30fps — the slowest devices got the slowest
        // easing, which is backwards and is why this felt worst on mobile.
        s.pos += (s.target - s.pos) * (1 - Math.pow(1 - scrollEase, dt * 60));
      }

      // Park the loop once it has arrived. The reference runs rAF for the life
      // of the page; these rails sit partway down a long one.
      if (Math.abs(s.target - s.pos) < 0.1 && !drag.current) {
        s.pos = s.target;
        raf.current = 0;
        last = 0;
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

  // A two-finger horizontal swipe on a trackpad is an overscroll as far as the
  // browser is concerned, and an overscroll sideways is back/forward navigation
  // — so swiping the rail walked you off the page. preventDefault() on the wheel
  // event is the fix, but it cannot live in the onWheel prop below: React
  // registers `wheel` once on the root container as a *passive* listener, and
  // preventDefault inside a passive listener is ignored (Chrome warns to the
  // console and carries on). Passive is the right default — it lets the browser
  // scroll without waiting on JS — so this claims the one gesture it must,
  // natively and non-passively, and leaves the rest alone.
  //
  // Deliberately not `overscroll-behavior-x` on <html>: that works, but it kills
  // the back-swipe for the whole site to fix one section.
  useEffect(() => {
    const vp = viewport.current;
    if (!vp) return;
    const claim = (e: WheelEvent) => {
      if (isHorizontal(e)) e.preventDefault();
    };
    vp.addEventListener("wheel", claim, { passive: false });
    return () => vp.removeEventListener("wheel", claim);
  }, []);

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
    /* Edge to edge: the arc's ends are meant to run off the viewport, so the
       section's own gutter is cancelled rather than cropping it.
       touch-pan-y keeps vertical page scroll native on a phone while
       claiming horizontal drags for the rail. */
    <div
      ref={viewport}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${label} Drag sideways, or use the Left and Right Arrow keys, to browse.`}
      // A real margin now, because the rail no longer carries dead headroom
      // to borrow it from: `measure` sizes it to the arc and pins the top of
      // it to the top of the centre card. The h-/min-h- pair is only the
      // pre-hydration fallback, overridden inline on the first measure.
      className="relative -mx-5 mt-4 h-[42svh] min-h-88 cursor-grab touch-pan-y overflow-hidden perspective-distant active:cursor-grabbing md:-mx-8"
      onWheel={(e) => {
        // Vertical wheel stays with the page. The reference binds it to the
        // rail, but it is a full-screen gallery — here the rail is one
        // section of a long scroll, so mapping deltaY to it means the cards
        // spin every time you scroll past. Only a deliberate horizontal
        // gesture (trackpad swipe, shift+wheel) drives it.
        if (!isHorizontal(e)) return;
        // 2% of a card per notch at the default speed — the reference's ratio
        // of scroll step to card pitch, in pixels instead of world units.
        scroll.current.target += Math.sign(e.deltaX) * scrollSpeed * 0.02 * geo.current.pitch;
        start.current();
        snapSoon();
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { x: e.clientX, from: scroll.current.target, v: 0, t: e.timeStamp };
        // Capture, so a drag that leaves the section still tracks — and so
        // release always lands on this element. No window listeners to leak.
        e.currentTarget.setPointerCapture(e.pointerId);
        clearTimeout(snapTimer.current);
        start.current();
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        // scrollSpeed 2 is 1:1 with the finger. The reference amplifies drag
        // ~2.7×, which on a touchscreen means the card outruns the thumb.
        const next = d.from + (d.x - e.clientX) * scrollSpeed * 0.5;
        // Velocity for the flick, smoothed: the last sample before release is
        // often the jitteriest one, and unsmoothed it decides the whole throw.
        const dt = e.timeStamp - d.t;
        if (dt > 0) {
          d.v = 0.7 * ((next - scroll.current.target) / dt) + 0.3 * d.v;
          d.t = e.timeStamp;
        }
        scroll.current.target = next;
        start.current();
      }}
      onPointerUp={() => {
        const d = drag.current;
        if (!d) return;
        drag.current = null;
        // Carry the throw *before* rounding, so the flick decides which card
        // it lands on rather than being flattened to the nearest one.
        scroll.current.target += d.v * FLICK_MS;
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
            // Width is set, height is whatever the item needs — no fixed
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
              // max-h-full clamps a very long item against the rail, and
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
  );
}
