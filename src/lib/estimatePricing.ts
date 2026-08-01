import type { Answers, Service, ServiceId, TimelineId } from "./configurator";

/**
 * The estimator's numbers, all of them, in one file. Nothing here is final —
 * they're plausible placeholders. Edit the tables; the UI reads whatever comes
 * out of estimate() and never does arithmetic of its own.
 */

type Rate = {
  /** Bottom of the quoted range, USD. */
  min: number;
  /** Top of the quoted range, USD. */
  max: number;
  /** Weeks of work if this were the only thing we were building. */
  weeks: number;
};

/**
 * Every service option, keyed "<serviceId>:<optionValue>".
 *
 * The key type is derived from the config rather than typed by hand, so adding,
 * renaming or removing an option in configurator.ts fails the build here until
 * its rate is updated. That drift is the only failure this module really has —
 * everything below is branch-free arithmetic.
 */
type RateKey = {
  [Id in ServiceId]: `${Id}:${Extract<Service, { id: Id }>["options"][number]["value"]}`;
}[ServiceId];

const RATES: Record<RateKey, Rate> = {
  "web:landing": { min: 1500, max: 2500, weeks: 2 },
  "web:standard": { min: 3500, max: 6000, weeks: 4 },
  "web:custom": { min: 8000, max: 15000, weeks: 8 },

  "social:light": { min: 900, max: 1400, weeks: 2 },
  "social:growth": { min: 1800, max: 2800, weeks: 3 },
  "social:always-on": { min: 3200, max: 5000, weeks: 4 },

  "motion:logo": { min: 600, max: 1200, weeks: 1 },
  "motion:kit": { min: 1800, max: 3200, weeks: 3 },
  "motion:explainer": { min: 3500, max: 6500, weeks: 5 },

  "video:1-3": { min: 700, max: 1400, weeks: 1 },
  "video:3-5": { min: 1400, max: 2600, weeks: 2 },
  "video:5-plus": { min: 2800, max: 5000, weeks: 4 },

  "ai:pilot": { min: 900, max: 1800, weeks: 2 },
  "ai:series": { min: 2200, max: 4000, weeks: 3 },
  "ai:scale": { min: 4500, max: 8000, weeks: 5 },
};

/** Rush costs more and buys a shorter calendar; a long runway does the reverse. */
const TIMELINE_FACTORS: Record<TimelineId, { price: number; weeks: number }> = {
  asap: { price: 1.25, weeks: 0.7 },
  standard: { price: 1, weeks: 1 },
  flexible: { price: 0.9, weeks: 1.3 },
};

/**
 * How much of a second service's schedule lands *outside* the longest one.
 * 0 would mean everything runs perfectly in parallel, 1 that nothing does.
 */
const OVERLAP = 0.5;

/** Width of the quoted delivery window, in weeks. */
const WINDOW_WEEKS = 2;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Exported so the cards can format the figures they count up to identically. */
export const formatUsd = (n: number) => usd.format(n);

/** Quote in round numbers — $4,000, never $3,937. */
const toNearest500 = (n: number) => Math.round(n / 500) * 500;

/**
 * Turn the configurator's answers into the two lines the estimate cards show.
 * Ignores any service whose question isn't answered yet, so it's safe to call
 * mid-flow.
 */
export function estimate(
  selected: ServiceId[],
  answers: Answers,
  timeline: TimelineId
) {
  const factor = TIMELINE_FACTORS[timeline];
  let min = 0;
  let max = 0;
  let totalWeeks = 0;
  let longestWeeks = 0;

  for (const id of selected) {
    const rate: Rate | undefined = RATES[`${id}:${answers[id]}` as RateKey];
    if (!rate) continue; // question not answered yet
    min += rate.min;
    max += rate.max;
    totalWeeks += rate.weeks;
    longestWeeks = Math.max(longestWeeks, rate.weeks);
  }

  // Services run alongside each other, so the calendar doesn't simply add up:
  // the biggest piece sets the pace and the rest partly overlap into it.
  const weeks = longestWeeks + (totalWeeks - longestWeeks) * OVERLAP;
  const from = Math.max(1, Math.round(weeks * factor.weeks));
  const to = from + WINDOW_WEEKS;
  const low = toNearest500(min * factor.price);
  const high = toNearest500(max * factor.price);

  return {
    // Formatted, for the email the dialog sends.
    price: `${usd.format(low)} – ${usd.format(high)}`,
    timeline: `${from} – ${to} weeks`,
    // The same four figures bare, because the cards count up to them.
    priceRange: [low, high] as [number, number],
    weekRange: [from, to] as [number, number],
  };
}
