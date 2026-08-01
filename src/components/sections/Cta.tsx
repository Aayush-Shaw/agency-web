"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ChevronDown, X } from "lucide-react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import ContactDialog, { type Summary } from "@/components/ui/ContactDialog";
import {
  SERVICES,
  TIMELINES,
  optionLabel,
  serviceById,
  timelineLabel,
  type Answers,
  type ServiceId,
  type TimelineId,
} from "@/lib/configurator";
import { estimate, formatUsd } from "@/lib/estimatePricing";

const CONTACT_EMAIL = "hello@digitalbear.studio";

/** The site's standard curve (see .lift in globals.css), typed for motion. */
const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

/** Shared entrance for every block that appears mid-flow. */
const REVEAL_STEP = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: EASE },
};

/**
 * The estimate's entrance — a spring loose enough to overshoot, so the numbers
 * land rather than merely appear. The JS half of --ease-elastic in globals.css,
 * which does the same job for the service picker's panel.
 *
 * No duration: a spring is described by its physics, and motion derives the
 * rest. MotionConfig's reducedMotion="user" (SmoothScroll.tsx) already drops it
 * for anyone who asked for less movement.
 */
const REVEAL_ELASTIC = {
  // The travel is part of the effect: a spring overshoots by a percentage of
  // the distance it covers, so a 0.04 scale range springs back by 0.7% and
  // reads as nothing at all. These numbers put the overshoot around 20%.
  initial: { opacity: 0, y: 28, scale: 0.92 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring" as const, stiffness: 260, damping: 13, mass: 0.8 },
};

/**
 * One numbered step with the progress line running down its left edge.
 * `last` drops the line and the gap below — pass it when nothing is rendered
 * underneath this step yet.
 *
 * No title: every field in here carries its own floating label, so a heading
 * above would only say the same thing twice.
 */
function Step({
  number,
  last = false,
  children,
}: {
  number: number;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div {...REVEAL_STEP} className="flex gap-4">
      <div className="flex flex-col items-center">
        {/* mt-2 centres the 2rem badge against the 3rem field beside it. */}
        <span className="mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent-primary/40 bg-accent-primary/10 font-display text-sm font-semibold text-accent-primary">
          {number}
        </span>
        {!last && <span className="mt-2 w-px flex-1 bg-border" aria-hidden="true" />}
      </div>

      <div className={`min-w-0 flex-1 ${last ? "" : "pb-8"}`}>{children}</div>
    </motion.div>
  );
}

/**
 * The two dismissals a <details> doesn't bring itself: click-outside and Esc.
 *
 * Everything else about the disclosure — the click and Enter/Space toggles, the
 * expanded state a screen reader announces, open/closed living in the DOM
 * rather than in React — is the element's own behaviour, which is why both
 * pickers below are built on one.
 */
function useDismiss(ref: RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    const close = (returnFocus: boolean) => {
      const el = ref.current;
      if (!el?.open) return;
      el.open = false;
      // Esc from inside the panel would otherwise drop focus onto <body>.
      if (returnFocus) el.querySelector("summary")?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref]);
}

/** Shared by both pickers' panels — the list under the summary. */
const panelClass = "border-t border-border p-1.5";
const optionClass =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-accent-primary/10";

/**
 * Every service in one field: the picked ones sit inside it as removable tags,
 * the rest are one click away.
 *
 * The panel expands in flow instead of floating over the page: the section
 * clips its own overflow for the blur behind it, so an absolutely positioned
 * dropdown would be cut off on a phone, where the card is short and the panel
 * would reach past the section's bottom edge.
 *
 * ponytail: a disclosure wrapped around a checkbox group, not an ARIA combobox
 * — no type-ahead, no arrow-key roving. The right shape for five fixed options;
 * if this list ever grows enough to want searching, that's the upgrade.
 */
function ServicePicker({
  selected,
  onToggle,
}: {
  selected: ServiceId[];
  onToggle: (id: ServiceId) => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useDismiss(ref);

  /**
   * Widest tag first, rather than the order they were picked.
   *
   * flex-wrap fills each row greedily and never looks back, so pick order
   * leaves holes: "Motion Graphics" then "Website Design & Development" puts a
   * short tag alone on row one because the long one couldn't follow it. Sorting
   * widest-first is first-fit-decreasing — the long tags claim their rows early
   * and the short ones fill in behind them, which is the fewest rows this can
   * wrap into.
   *
   * Display only. `selected` keeps pick order, and that is what the brief, the
   * estimate and the email all read.
   *
   * ponytail: label length as a stand-in for rendered width. True for this
   * list, where every tag is the same size and weight; if tags ever mix type
   * sizes, measure instead.
   */
  const packed = [...selected].sort(
    (a, b) => serviceById(b).label.length - serviceById(a).label.length
  );

  const names = packed.map((id) => serviceById(id).label);

  return (
    <div className="float-field" data-empty={selected.length === 0 ? "" : undefined}>
      {/* Border, outline and the elastic open/close all come from .float-field
          and .elastic in globals.css. */}
      <details ref={ref} className="elastic group rounded-xl bg-bg transition-colors">
        <summary
          // <summary> is a button, so its name comes from its content — which
          // is tags, or nothing at all before anything is picked. Spelled out
          // here so it always says what the field is for, selections included.
          aria-label={`Services — What do you need?${names.length ? `: ${names.join(", ")}` : ""}`}
          className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-2 px-3 py-2 [&::-webkit-details-marker]:hidden"
        >
          {packed.map((id) => (
            <span
              key={id}
              className="flex items-center gap-1 rounded-full bg-accent-primary/12 py-1 pl-3 pr-1 text-sm text-accent-primary"
            >
              {serviceById(id).label}
              <button
                type="button"
                // Inside a <summary>, whose default action is to toggle the
                // panel — so removing a tag has to cancel it. The checkbox list
                // is the keyboard/screen-reader path to the same thing; this is
                // the mouse shortcut.
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onToggle(id);
                }}
                aria-label={`Remove ${serviceById(id).label}`}
                className="grid h-6 w-6 place-items-center rounded-full transition hover:bg-accent-primary/20"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
          <ChevronDown
            className="ml-auto h-4 w-4 shrink-0 text-text-muted transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div role="group" aria-label="Services — What do you need?" className={panelClass}>
          {SERVICES.map((service) => (
            <label key={service.id} className={optionClass}>
              <input
                type="checkbox"
                checked={selected.includes(service.id)}
                onChange={() => onToggle(service.id)}
                className="h-4 w-4 shrink-0 accent-accent-primary"
              />
              {service.label}
            </label>
          ))}
        </div>
      </details>

      {/* A <span>, not a <label>: there is no form control here to point at —
          the summary names itself with aria-label. */}
      <span className="float-label" aria-hidden="true">
        <span className="float-only">Services</span>
        <span className="rest-only">What do you need?</span>
      </span>
    </div>
  );
}

/**
 * Pick one, in the same disclosure as the service picker above — so every
 * question in the flow opens and closes with the same elastic panel instead of
 * handing two of the three off to the OS picker.
 *
 * Radios rather than a listbox: a named group is arrow-key navigable, single-
 * choice and announced as such by the platform, so nothing about the selection
 * is reimplemented here — only the open/closed shell around it.
 *
 * `resting` is what the label says before the field is touched; `label` is what
 * it says once it has lifted onto the border. aria-label carries both, so the
 * accessible name is the whole question however the label is currently drawn.
 */
function Select({
  id,
  label,
  resting,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  resting: string;
  options: readonly { readonly value: string; readonly label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useDismiss(ref);

  const picked = options.find((option) => option.value === value);

  return (
    <div className="float-field" data-empty={value === "" ? "" : undefined}>
      {/* Border, outline and the elastic open/close all come from .float-field
          and .elastic in globals.css. */}
      <details ref={ref} className="elastic group rounded-xl bg-bg transition-colors">
        <summary
          // A <summary> is a button and names itself from its content, which is
          // blank until something is picked — so the question is spelled out
          // here, with the answer appended once there is one.
          aria-label={`${label} — ${resting}${picked ? `: ${picked.label}` : ""}`}
          className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
        >
          {/* Wraps rather than truncates: these answers are sentences, and at
              390px the field is 260px wide. */}
          <span className="min-w-0 flex-1">{picked?.label}</span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-text-muted transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div role="radiogroup" aria-label={`${label} — ${resting}`} className={panelClass}>
          {options.map((option) => (
            <label key={option.value} className={optionClass}>
              <input
                type="radio"
                name={id}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                // Answered, so the panel's work is done — but only for a real
                // click. Arrow-keying through a radio group fires a synthetic
                // click (detail 0) per option, which would shut the panel on
                // the first keypress, mid-navigation.
                onClick={(event) => {
                  if (event.detail > 0 && ref.current) ref.current.open = false;
                }}
                className="h-4 w-4 shrink-0 accent-accent-primary"
              />
              {option.label}
            </label>
          ))}
        </div>
      </details>

      {/* A <span>, not a <label>: there is no form control here to point at —
          the summary names itself with aria-label. */}
      <span className="float-label" aria-hidden="true">
        <span className="float-only">{label}</span>
        <span className="rest-only">{resting}</span>
      </span>
    </div>
  );
}

/**
 * A number that counts to its new value instead of cutting to it.
 *
 * The spring is seeded with the first value, so the card's own entrance is the
 * only thing that happens when the estimate first appears — the count-up is
 * reserved for the answer changing underneath it, which is the moment worth
 * pointing at.
 */
function Count({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 90, damping: 20 });
  const text = useTransform(spring, (n) => format(Math.round(n)));

  // jump, not set: MotionConfig's reducedMotion only governs transforms, so a
  // tweening number has to opt out for itself.
  useEffect(() => {
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [reduce, spring, value]);

  return <motion.span>{text}</motion.span>;
}

function EstimateCard({
  label,
  range: [from, to],
  format,
  suffix,
}: {
  label: string;
  range: [number, number];
  format: (n: number) => string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg p-5">
      {/* Sentence case, normal tracking: this is a caption, not an eyebrow, and
          uppercase was costing it a second line as well as the extra width. */}
      <p className="text-sm text-text-muted">{label}</p>
      {/* tabular-nums so a digit rolling 9→10 mid-count doesn't shove the rest
          of the line sideways. */}
      <p className="mt-1.5 text-card-lg font-bold tracking-tight tabular-nums text-gradient">
        <Count value={from} format={format} /> – <Count value={to} format={format} />
        {suffix}
      </p>
    </div>
  );
}

/**
 * Section 12 — closing CTA + project configurator.
 *
 * Steps appear one at a time as the one above is answered; the estimate and the
 * contact button only exist once every question has an answer. Everything the
 * flow asks lives in lib/configurator.ts and every number it quotes in
 * lib/estimatePricing.ts, so neither is edited here.
 */
export default function Cta() {
  const [selected, setSelected] = useState<ServiceId[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeline, setTimeline] = useState<TimelineId | "">("");
  const [dialogOpen, setDialogOpen] = useState(false);
  // The dialog grows out of this button, so it needs its position on screen.
  const openRef = useRef<HTMLButtonElement>(null);

  function toggleService(id: ServiceId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((s) => s !== id) : [...current, id]
    );
  }

  // Answers for de-selected services are kept on purpose: re-adding a service
  // brings its answer back instead of making the visitor pick it again. Only
  // the ids in `selected` are ever read.
  const answeredCount = selected.filter((id) => answers[id]).length;
  const allServicesAnswered = selected.length > 0 && answeredCount === selected.length;
  const complete = allServicesAnswered && timeline !== "";

  const quote = complete ? estimate(selected, answers, timeline) : null;

  const summary: Summary | null = quote
    ? {
        services: selected.map((id) => ({
          label: serviceById(id).label,
          value: optionLabel(id, answers[id]),
        })),
        timelinePreference: timelineLabel(timeline as TimelineId),
        estimate: quote,
      }
    : null;

  return (
    <section
      id="contact"
      className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32"
    >
      {/* Warm glow behind the closing pitch. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-accent-primary/20 blur-3xl"
      />

      {/* Pitch left, estimator right at 60%. One column below lg — the steps
          need the full width on a phone more than the pitch needs a neighbour. */}
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-8">
        <Reveal variant="words">
          <Eyebrow>Let&apos;s talk</Eyebrow>
          <h2 className="mt-5 text-section-xl font-bold leading-[1.05] tracking-tight">
            Ready to build something{" "}
            <span className="text-gradient">worth watching</span>?
          </h2>
          <p className="mt-5 max-w-md text-lead text-text-muted">
            Pick what you need and we&apos;ll shape a timeline and a price range
            around it — no forms to guess at, no pushy sales calls.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-6 inline-block font-display text-lg font-semibold text-accent-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 md:p-8">
            {/* Step 1 — services. */}
            <Step number={1} last={selected.length === 0}>
              <ServicePicker selected={selected} onToggle={toggleService} />
            </Step>

            {/* Steps 2..n — one question per selected service, in the order they
                were picked, each revealed once the one above is answered. */}
            {selected.map((id, index) => {
              if (selected.slice(0, index).some((prev) => !answers[prev])) return null;
              const service = serviceById(id);
              return (
                <Step
                  key={id}
                  number={index + 2}
                  // Nothing renders below an unanswered step — neither the next
                  // service nor the timeline question — so it owns the end of
                  // the line.
                  last={!answers[id]}
                >
                  <Select
                    id={`configurator-${id}`}
                    label={service.label}
                    resting={service.question}
                    options={service.options}
                    value={answers[id] ?? ""}
                    onChange={(value) =>
                      setAnswers((current) => ({ ...current, [id]: value }))
                    }
                  />
                </Step>
              );
            })}

            {/* Final step — timeline. */}
            {allServicesAnswered && (
              <Step number={selected.length + 2} last={!complete}>
                <Select
                  id="configurator-timeline"
                  label="Timeline"
                  resting="When do you need it?"
                  options={TIMELINES}
                  value={timeline}
                  onChange={(value) => setTimeline(value as TimelineId)}
                />
              </Step>
            )}

            {/* The estimate, plus the way out of the flow. */}
            {quote && (
              <motion.div
                {...REVEAL_ELASTIC}
                // Full width, no step indent: the numbered column belongs to the
                // questions, and the cards were paying 3rem for an alignment
                // nothing above them needed.
                //
                // @container, not sm:, for the split below: this block sits in a
                // 60% column, so its own width — not the viewport's — decides
                // whether two price cards fit side by side.
                className="@container border-t border-border pt-6"
              >
                <div className="grid gap-3 @sm:grid-cols-2">
                  <EstimateCard
                    label="Estimated development timeline"
                    range={quote.weekRange}
                    format={String}
                    suffix=" weeks"
                  />
                  <EstimateCard
                    label="Estimated price range"
                    range={quote.priceRange}
                    format={formatUsd}
                  />
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  A starting point, not a quote — we&apos;ll confirm both once
                  we&apos;ve talked through the detail.
                </p>
                <button
                  ref={openRef}
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="glow mt-6 inline-flex h-13 w-full items-center justify-center rounded-full bg-linear-to-r from-accent-primary to-accent-secondary text-base font-semibold text-bg transition-transform hover:scale-[1.02]"
                >
                  Start a conversation
                </button>
              </motion.div>
            )}
          </div>
        </Reveal>
      </div>

      {summary && (
        <ContactDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          summary={summary}
          opener={openRef}
        />
      )}
    </section>
  );
}
