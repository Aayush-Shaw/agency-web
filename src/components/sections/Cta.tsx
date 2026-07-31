"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import { motion } from "motion/react";
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
import { estimate } from "@/lib/estimatePricing";

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
 * One numbered step with the progress line running down its left edge.
 * `last` drops the line and the gap below — pass it when nothing is rendered
 * underneath this step yet.
 */
function Step({
  number,
  title,
  last = false,
  children,
}: {
  number: number;
  title: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div {...REVEAL_STEP} className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent-primary/40 bg-accent-primary/10 font-display text-sm font-semibold text-accent-primary">
          {number}
        </span>
        {!last && <span className="mt-2 w-px flex-1 bg-border" aria-hidden="true" />}
      </div>

      <div className={`min-w-0 flex-1 ${last ? "" : "pb-8"}`}>
        <p id={`configurator-step-${number}`} className="text-sm font-medium">
          {title}
        </p>
        <div className="mt-3">{children}</div>
      </div>
    </motion.div>
  );
}

/** Native <select> in the site's input shell — the OS picker on mobile, free. */
function Select({
  id,
  labelledBy,
  placeholder,
  options,
  value,
  onChange,
}: {
  id: string;
  labelledBy: string;
  placeholder: string;
  options: readonly { readonly value: string; readonly label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-labelledby={labelledBy}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-border bg-bg pl-4 pr-11 text-text focus:border-accent-primary focus:outline-none"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
    </div>
  );
}

function EstimateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-card-lg font-bold tracking-tight text-gradient">
        {value}
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

      <div className="mx-auto max-w-3xl">
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

        <Reveal className="mt-12">
          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
            {/* Step 1 — services. */}
            <Step
              number={1}
              title="What do you need?"
              last={selected.length === 0}
            >
              <div
                role="group"
                aria-labelledby="configurator-step-1"
                className="flex flex-wrap gap-2"
              >
                {SERVICES.map((service) => {
                  const on = selected.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      aria-pressed={on}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        on
                          ? "border-accent-primary bg-accent-primary/12 text-accent-primary"
                          : "border-border text-text-muted hover:border-accent-primary/50 hover:text-text"
                      }`}
                    >
                      {service.label}
                    </button>
                  );
                })}
              </div>

              {selected.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {selected.map((id) => (
                    <li
                      key={id}
                      className="flex items-center gap-1 rounded-full bg-accent-primary/12 py-1 pl-3 pr-1 text-sm text-accent-primary"
                    >
                      {serviceById(id).label}
                      <button
                        type="button"
                        onClick={() => toggleService(id)}
                        aria-label={`Remove ${serviceById(id).label}`}
                        className="grid h-6 w-6 place-items-center rounded-full transition hover:bg-accent-primary/20"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Step>

            {/* Steps 2..n — one question per selected service, in the order they
                were picked, each revealed once the one above is answered. */}
            {selected.map((id, index) => {
              if (selected.slice(0, index).some((prev) => !answers[prev])) return null;
              const service = serviceById(id);
              const number = index + 2;
              return (
                <Step
                  key={id}
                  number={number}
                  title={`${service.label} — ${service.question}`}
                  // Nothing renders below an unanswered step — neither the next
                  // service nor the timeline question — so it owns the end of
                  // the line.
                  last={!answers[id]}
                >
                  <Select
                    id={`configurator-${id}`}
                    labelledBy={`configurator-step-${number}`}
                    placeholder="Choose one…"
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
              <Step
                number={selected.length + 2}
                title="When do you need it?"
                last={!complete}
              >
                <Select
                  id="configurator-timeline"
                  labelledBy={`configurator-step-${selected.length + 2}`}
                  placeholder="Choose one…"
                  options={TIMELINES}
                  value={timeline}
                  onChange={(value) => setTimeline(value as TimelineId)}
                />
              </Step>
            )}

            {/* The estimate, plus the way out of the flow. */}
            {quote && (
              <motion.div
                {...REVEAL_STEP}
                // ml-12 lines the cards up with the step content: 2rem number
                // column + the 1rem gap.
                className="ml-12 border-t border-border pt-6"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <EstimateCard
                    label="Estimated development timeline"
                    value={quote.timeline}
                  />
                  <EstimateCard label="Estimated price range" value={quote.price} />
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  A starting point, not a quote — we&apos;ll confirm both once
                  we&apos;ve talked through the detail.
                </p>
                <button
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
        />
      )}
    </section>
  );
}
