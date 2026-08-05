"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { faceUrl } from "@/lib/media";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import usePawRake from "@/components/ui/usePawRake";
import useScrollFocus from "@/components/ui/useScrollFocus";

/* `when` is the field that turns marketing copy into a record. A quote with a
   name under it is a claim; a quote with a name, a face, a platform and a date
   is something a reader can picture being written. That is the whole argument
   for this card's order too — see the figcaption note below. */
const REVIEWS = [
  {
    quote:
      "Digi Bear rebuilt our site and it paid for itself in a month. Sharp design, and they actually hit every deadline.",
    name: "Sarah Whitmore",
    company: "Northwind Coffee, US",
    face: "photo-1494790108377-be9c29b29330",
    when: "3 weeks ago",
    rating: 5,
  },
  {
    quote:
      "The AI video work is a different level. We localized a campaign into four languages in under a week — unheard of for us.",
    name: "James Callahan",
    company: "Lumen Finance, UK",
    face: "photo-1507003211169-0a1dd7228f2d",
    when: "last month",
    rating: 5,
  },
  {
    quote:
      "Working across timezones is usually painful. With them it felt like they were down the hall. Same-day replies, every time.",
    name: "Elena Fischer",
    company: "Halo Skincare, DE",
    face: "photo-1438761681033-6461ffad8d80",
    when: "2 months ago",
    rating: 5,
  },
  {
    quote:
      "Motion graphics that finally match our brand. The team took rough notes and turned them into something we're proud of.",
    name: "Marcus Bell",
    company: "Apex Motors, US",
    face: "photo-1500648767791-00dcc994a43e",
    when: "3 months ago",
    rating: 5,
  },
  {
    quote:
      "Our social finally looks like it belongs to the same brand as the site. Six weeks in, and I've stopped writing captions at midnight.",
    name: "Priya Raman",
    company: "Bower & Co, UK",
    face: "photo-1534528741775-53994a69daeb",
    when: "5 weeks ago",
    rating: 5,
  },
  {
    quote:
      "They cut nine months of shoot footage into a launch film and three ad variants. Two rounds of notes and it was done.",
    name: "Tomás Herrera",
    company: "Vessel Outdoor, ES",
    face: "photo-1506794778202-cad84cf45f1d",
    when: "6 months ago",
    rating: 5,
  },
];

/** How many of the six a phone gets. Six in one column is a long scroll past
    the same card six times; four is the point where the reader has enough and
    the section still ends. The rest are hidden in CSS rather than sliced in JS
    — a slice would need the viewport width at render, which the server does not
    have, and would cost a hydration mismatch to guess at. */
const PHONE_LIMIT = 4;

/* Google's own mark in its own four colours — the one saturated thing in a
   section built from honey and cinnamon, which is exactly why it reads as a
   badge from somewhere else rather than another house graphic. It is drawn
   rather than imported for the reason the footer's socials are: Lucide v1
   dropped its brand icons.

   Not a link. There is no review page to send anyone to yet, and a badge that
   looks clickable and isn't is worse than one that doesn't. */
const GoogleG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 24 24"
        className={`review-star h-4 w-4 ${i < rating ? "text-accent-primary" : "text-border"}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.6 5.4 21l1.4-6.9L1.6 9.3l7-.8z" />
      </svg>
    ))}
  </div>
);

/** Seconds between card arrivals. Also the length of one card's star sweep. */
const CARD_STAGGER = 0.12;
/** Five stars per card, so a card's row fills in exactly as the next one lands
    rather than the whole grid's stars running as one detached wave. */
const STAR_STAGGER = CARD_STAGGER / 5;

/* Loose enough to trail the pointer a little, tight enough not to wobble after
   it stops. The paw in Faq.tsx is deliberately looser — that one is a dragged
   object, this is a card being leaned on. */
const TILT = { stiffness: 170, damping: 20, mass: 0.7 };
/** Degrees at the card's edge. Past ~6 the text starts to visibly keystone. */
const MAX_TILT = 4;

/**
 * One review.
 *
 * Two elements, and they are not interchangeable: the outer div is GSAP's (the
 * scroll entrance) and the motion.figure inside is Framer's (the pointer tilt).
 * Both write `transform`, so sharing one node means whichever ran last wins and
 * the other silently stops working. Same split — and the same reason — as the
 * hero's CTA, where Magnetic owns the wrapper and the entrance owns the anchor.
 */
function ReviewCard({
  review,
  className = "",
}: {
  review: (typeof REVIEWS)[number];
  /** Extra classes for the outer (GSAP-owned) box — the phone cut-off uses it. */
  className?: string;
}) {
  const box = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // Per card, not per grid: the handlers below are the card's, so the paw is
  // measured against this card and clipped to its shape. Raking the grid
  // instead put it across the gutters too.
  const paw = usePawRake();

  const rotateX = useSpring(0, TILT);
  const rotateY = useSpring(0, TILT);
  const lift = useSpring(0, TILT);

  // The glass and the paw's clip box are two elements that have to occupy the
  // same plane, so they take one transform between them. Anything less and the
  // rake slips out from under the card as it tilts — 4deg across a 400px card
  // walks its corners ~14px, and the 6px lift opens a strip along the bottom.
  const plane = { rotateX, rotateY, y: lift, transformPerspective: 900 };

  return (
    // group/card, named, because two groups are nested here: this one carries
    // the touch focus state (useScrollFocus sets data-focus on it) and the
    // figure inside carries the mouse one. The glow has to hang off this outer
    // box — it lives in the clip layer, which is the figure's sibling, not its
    // child, and so cannot see a group on the figure.
    <div className={`review-card group/card relative ${className}`}>
      {/* The paw rakes *behind* the glass, not inside it. backdrop-filter only
          blurs what is painted behind an element — never its own descendants —
          so a paw parented to the card would composite on top of the finished
          frost and stay sharp. As a sibling underneath, it is part of the
          backdrop the card samples, and the blur lands on it.

          Its own box rather than the card's: this clips the rake to the card's
          shape (rounded-2xl, squircled to match — see globals.css) without
          being an ancestor of the figure, which is free to tilt and lift past
          these edges. inset-0 of an unpadded wrapper is exactly the card. */}
      <motion.div
        aria-hidden="true"
        style={plane}
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      >
        {paw.layers}
        {/* Behind the glass with the paw, so it is frosted the same way. This
            is the whole of the touch treatment's light — the claw needs an x/y
            the scroll cannot give it, so it stays a mouse reward. */}
        <span className="focus-glow" aria-hidden="true" />
      </motion.div>

      <motion.figure
        ref={box}
        style={plane}
        onPointerMove={(event) => {
          // One handler drives both, and that is the point: the paw measures
          // itself against this same box, so it rakes inside the card and
          // nowhere else.
          paw.track(event);
          // Fine pointers only, for the reason Magnetic.tsx and the FAQ's paw
          // both give: on touch this would tilt the card under the finger
          // that is trying to read it.
          if (reduced || event.pointerType !== "mouse" || !box.current) return;
          const b = box.current.getBoundingClientRect();
          rotateY.set(
            ((event.clientX - b.left) / b.width - 0.5) * 2 * MAX_TILT,
          );
          rotateX.set(
            ((event.clientY - b.top) / b.height - 0.5) * -2 * MAX_TILT,
          );
          lift.set(-6);
        }}
        onPointerLeave={() => {
          paw.stop();
          rotateX.set(0);
          rotateY.set(0);
          lift.set(0);
        }}
        // z-10 so the glass sits over the paw layer behind it — that ordering
        // is what makes the card's backdrop-filter sample the rake at all.
        className="group relative z-10 flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg/20 p-6 backdrop-blur-sm md:p-7"
      >
        {/* The card's top hairline lights up left-to-right. Verbatim the
            mechanic on the FAQ's rows — same origin, same 500ms, same curve —
            so the two sections answer a hover the same way. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-accent-primary to-accent-secondary transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-x-100 group-data-[focus]/card:scale-x-100"
        />

        {/* <figcaption> first, not last, and that is the redesign. A review is
            read attribution-first — you decide whether to care about the words
            by looking at who wrote them — so the face, the name and the source
            come before the quote, which is also the order Google's own reviews
            are laid out in. A figcaption is allowed to be the figure's first
            child precisely for this. */}
        <figcaption className="flex items-center gap-3.5">
          {/* A bare img element, not next/image, for the same reason as the
              hero wall and the work rail: these are remote URLs, and
              next/image would need each host added to images.remotePatterns in
              next.config.ts. Swap all three together when the real assets
              land. (Tag name spelled out rather than written as markup — in a
              comment it scans as a real tag with no src.) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faceUrl(review.face)}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
            className="size-12 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold leading-tight">
              {review.name}
            </div>
            <div className="mt-0.5 truncate text-sm text-text-muted">
              {review.company}
            </div>
          </div>
          {/* Grey until the card is engaged with, then its own colours — the
              sourcing verifies itself when you lean in. Held at grayscale at
              rest so four brand colours aren't shouting from every card in a
              section that otherwise has two. */}
          <GoogleG className="size-5 shrink-0 opacity-60 grayscale transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:opacity-100 group-hover:grayscale-0 group-data-[focus]/card:opacity-100 group-data-[focus]/card:grayscale-0" />
        </figcaption>

        <div className="mt-4 flex items-center gap-2.5">
          <Stars rating={review.rating} />
          <span className="text-xs text-text-muted">{review.when}</span>
        </div>

        <blockquote className="mt-4 flex-1 text-lg leading-relaxed">
          &ldquo;{review.quote}&rdquo;
        </blockquote>
      </motion.figure>
    </div>
  );
}

/** Section 9 — client reviews. */
export default function Reviews() {
  const grid = useRef<HTMLDivElement>(null);
  // Touch's stand-in for hover: whichever card is crossing the middle of the
  // screen wears the state a mouse would give it.
  useScrollFocus(grid, ".review-card");

  useGSAP(
    () => {
      const el = grid.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Dealt onto the table rather than faded up: each card arrives off its
        // own bottom edge with a tilt that settles to level, and the tilt
        // alternates so the four read as a hand laying them down one at a time
        // instead of a single wave with a delay on it.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 82%" },
        });

        tl.fromTo(
          ".review-card",
          {
            opacity: 0,
            y: 56,
            scale: 0.94,
            rotate: (i: number) => (i % 2 ? 2.5 : -2.5),
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.95,
            stagger: CARD_STAGGER,
            transformOrigin: "50% 100%",
            // clearProps for the reason Reveal.tsx spells out: an inline
            // transform left on the wrapper would sit above the tilt spring's
            // own writes on the figure inside and pin every card level.
            clearProps: "all",
          },
        );

        // The stars strike in behind their card, which is the one beat that
        // makes the rating read as something someone gave rather than a row of
        // glyphs that was always there. back.out overshoots each star a little
        // — a rating is a stamp, not a fade.
        tl.fromTo(
          ".review-star",
          { opacity: 0, scale: 0.3 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(2.4)",
            stagger: STAR_STAGGER,
            transformOrigin: "50% 50%",
            clearProps: "all",
          },
          // Started so the first card's row is filling as the card itself
          // finishes arriving, not after all four have landed.
          "-=0.75",
        );
      });
    },
    { scope: grid },
  );

  return (
    <section id="reviews" className="bg-surface px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <Reveal variant="words">
          <Eyebrow>Client reviews</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-section font-bold tracking-tight">
            Trusted by brands that{" "}
            <span className="text-gradient">sweat the details</span>.
          </h2>
        </Reveal>

        {/* No rake at this level. Each card owns its own — see ReviewCard.
            One column on a phone, two on a small tablet, three from md. */}
        <div
          ref={grid}
          className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3"
        >
          {REVIEWS.map((review, i) => (
            <ReviewCard
              key={review.name}
              review={review}
              // display:none, so the tail cards cost a phone no layout and no
              // avatar fetch (a lazy image inside a hidden box is never
              // requested). They stay in the GSAP selectors and animate
              // invisibly, which is free: they are last in DOM order, so the
              // visible cards still lead the stagger.
              className={i >= PHONE_LIMIT ? "max-sm:hidden" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
