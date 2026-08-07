"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type FormEvent,
  type RefObject,
} from "react";
import { X } from "lucide-react";
import Roll from "@/components/ui/Roll";

export type Summary = {
  services: { label: string; value: string }[];
  timelinePreference: string;
  estimate: { price: string; timeline: string };
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Seconds the send button stays locked after an attempt.
 *
 * This is politeness, not protection - anyone can skip the button and POST the
 * route directly. The limit that actually guards the inbox is per-IP in
 * app/api/contact/route.ts.
 */
const COOLDOWN_S = 30;

/** How long to wait on the network before calling it a failure. */
const TIMEOUT_MS = 15_000;

/**
 * Everything the configurator collected, as the plain-text body of the email.
 *
 * Spread rather than filtered: the blank strings here are paragraph breaks, so
 * dropping the optional business line with .filter(Boolean) would take the
 * spacing with it and run the whole brief into one block.
 */
function composeMessage(summary: Summary, business: string) {
  const trimmed = business.trim();
  return [
    "Project configurator enquiry",
    ...(trimmed ? [`Business: ${trimmed}`] : []),
    "",
    "Services",
    ...summary.services.map((s) => `- ${s.label}: ${s.value}`),
    "",
    `Timeline preference: ${summary.timelinePreference}`,
    `Estimated timeline: ${summary.estimate.timeline}`,
    `Estimated price: ${summary.estimate.price}`,
  ].join("\n");
}

const inputClass =
  // The placeholder is never painted - the fields stay empty until they're
  // typed in. It is kept on the elements anyway because :placeholder-shown is
  // how .float-field (globals.css) knows a field is empty and where to draw
  // its label; text-transparent hides the example without taking that away.
  // Border and focus styling also come from .float-field.
  "min-h-12 w-full rounded-xl bg-bg px-4 py-3 text-text transition-colors placeholder:text-transparent aria-invalid:border-accent-secondary";

/**
 * What's wrong with a field, in words.
 *
 * The platform's own `validationMessage` for everything except a failed
 * `pattern` - Chrome answers those with "Please match the requested format",
 * which tells nobody anything. The input's `title` says what the format is, so
 * it stands in there; every other case keeps the browser's localised text.
 */
const problemWith = (el: HTMLInputElement) =>
  el.validity.patternMismatch && el.title ? el.title : el.validationMessage;

/**
 * Label + input + whatever the browser says is wrong with it.
 *
 * The rules live on the input itself (required / minLength / pattern) and the
 * message comes back from the platform's own `validationMessage`, so there is
 * no second copy of the validation in JS and the text arrives localised.
 * `noValidate` on the form suppresses only the browser's bubble UI - the checks
 * themselves still run, which is what lets us render them inline per keystroke.
 */
function Field({
  name,
  label,
  error,
  onCheck,
  i,
  ...input
}: {
  name: string;
  label: string;
  error?: string;
  onCheck: (el: HTMLInputElement) => void;
  /** Position in the dialog's entrance cascade - see .cascade-item. */
  i: number;
} & ComponentProps<"input">) {
  const id = `cd-${name}`;
  return (
    <div className="cascade-item" style={{ "--i": i } as CSSProperties}>
      <div className="float-field">
        <input
          {...input}
          id={id}
          name={name}
          onChange={(event) => onCheck(event.currentTarget)}
          onBlur={(event) => onCheck(event.currentTarget)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClass}
        />
        <label htmlFor={id} className="float-label">
          {label}
          {input.required ? (
            // Decoration only - `required` is what tells a screen reader.
            <span aria-hidden="true" className="text-accent-secondary">
              {" *"}
            </span>
          ) : (
            <span className="font-normal text-text-muted"> (optional)</span>
          )}
        </label>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm text-accent-secondary"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Contact step of the configurator, in a native <dialog>.
 *
 * showModal() is doing the accessibility work that a hand-rolled modal would
 * have to reimplement: focus trap, focus returned to the opener on close, Esc
 * to dismiss, the rest of the page marked inert, and top-layer painting that
 * no z-index on the page can beat. The only thing left to add is the
 * click-outside, which is four lines because a click on the backdrop targets
 * the dialog element itself - hence p-0 here and the padding on the child.
 */
export default function ContactDialog({
  open,
  onClose,
  summary,
  opener,
}: {
  open: boolean;
  onClose: () => void;
  summary: Summary;
  /** The button that opens this - the panel grows out of it. */
  opener: RefObject<HTMLButtonElement | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setStatus("idle");
      setError("");
      setErrors({});

      // Aim the growth at the opener, before showModal() rather than after:
      // the entrance is driven by @starting-style, which reads the element's
      // state on the frame it opens, so a later write would arrive too late.
      //
      // The dialog isn't laid out yet and can't be measured - but it doesn't
      // need to be. `m-auto` centres it, so its future centre is the
      // viewport's, and the origin is just the button's offset from there.
      const box = opener.current?.getBoundingClientRect();
      // No opener mounted: fall back to a plain centred zoom rather than
      // aiming the growth at a point that isn't there.
      dialog.style.transformOrigin = box
        ? `calc(50% + ${box.left + box.width / 2 - window.innerWidth / 2}px) calc(50% + ${box.top + box.height / 2 - window.innerHeight / 2}px)`
        : "";

      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, opener]);

  // One timer per remaining second; it stops itself at zero. Deliberately not
  // reset when the dialog closes - reopening must not buy a fresh send.
  useEffect(() => {
    if (cooldown === 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const check = (el: HTMLInputElement) =>
    setErrors((current) => ({ ...current, [el.name]: problemWith(el) }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Array.from(form.querySelectorAll("input"));

    // Surface every problem at once, rather than the browser's one bubble at a
    // time. The honeypot is in here too and has no constraints, so it reports
    // an empty message and never renders.
    const invalid = fields.filter((el) => !el.checkValidity());
    if (invalid.length > 0) {
      setErrors(Object.fromEntries(fields.map((el) => [el.name, problemWith(el)])));
      invalid[0].focus();
      return;
    }

    const data = new FormData(form);
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          website: data.get("website"), // honeypot
          message: composeMessage(summary, String(data.get("business") ?? "")),
        }),
        // Without this a stalled connection leaves the button on "Sending…"
        // forever with nothing to tell the visitor - the one failure that
        // otherwise never reaches the error box below.
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        // Every failure the route returns carries { error }. Anything else on
        // this path is a 500 or a platform error page, which won't parse as
        // JSON - hence the catch and the fallback.
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          body.error ?? "Something went wrong at our end. Please try again."
        );
        setStatus("error");
      }
    } catch {
      // fetch itself rejected: offline, DNS, a dropped connection, or the
      // timeout above. Deliberately not the thrown error's own message - that
      // would put "Failed to fetch" or "signal timed out" in front of someone.
      setError(
        "We couldn't reach the server. Check your connection and try again."
      );
      setStatus("error");
    } finally {
      setCooldown(COOLDOWN_S);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="contact-dialog-title"
      // dialog-in (globals.css) is the entrance: the panel grows out of the
      // opener while .cascade-item rows below assemble behind it. It also
      // transitions width, which is what makes the line below a movement
      // rather than a jump.
      //
      // The md widening exists for the two-column form; the receipt that
      // replaces it is two short lines and a button, so it drops back to 34rem
      // rather than sitting in 50rem of empty panel.
      className={`dialog-in m-auto w-[min(34rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-text backdrop:bg-black/60 backdrop:backdrop-blur-sm ${
        status === "success" ? "" : "md:w-[min(50rem,calc(100vw-3rem))]"
      }`}
    >
      {/* data-lenis-prevent so a wheel inside the dialog scrolls the dialog and
          not the page underneath it. */}
      <div
        data-lenis-prevent
        className="max-h-[85dvh] overflow-y-auto p-5 sm:p-6 md:p-8"
      >
        {/* --i values are the cascade order: header, prompt, the three fields,
            the brief, the button. They are written out rather than counted by
            nth-child because the rows sit in two different parents. */}
        <div
          className="cascade-item flex items-start justify-between gap-4"
          style={{ "--i": 0 } as CSSProperties}
        >
          <h2
            id="contact-dialog-title"
            className="text-card-lg font-bold tracking-tight"
          >
            {status === "success" ? "Message sent - thank you." : "Start a conversation"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-text-muted transition hover:bg-text/5 hover:text-text"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>

        {status === "success" ? (
          // .cascade-item carries this too: a CSS animation restarts whenever a
          // matching element is inserted, so the same rule that staggers the
          // form on open plays the receipt in when it replaces it - no second
          // mechanism, and no exit machinery for the form it displaces.
          <>
            <p
              className="cascade-item mt-3 text-text-muted"
              style={{ "--i": 1 } as CSSProperties}
            >
              We&apos;ve got your brief and the estimate you built. Expect a reply
              within one business day.
            </p>
            <div
              className="cascade-item mt-6 flex justify-end"
              style={{ "--i": 2 } as CSSProperties}
            >
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-12 items-center justify-center rounded-full brand-gradient px-6 text-base font-semibold text-bg"
              >
                <Roll>Done</Roll>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-1">
            <p
              className="cascade-item text-sm text-text-muted"
              style={{ "--i": 1 } as CSSProperties}
            >
              We&apos;ll send this brief straight to the team.{" "}
              <span aria-hidden="true" className="text-accent-secondary">
                *
              </span>{" "}
              marks a required field.
            </p>

            {/* Fields left, brief and send right once there's room for two
                columns. Stacked, this form is taller than 85dvh on a laptop and
                the send button starts below the fold; side by side it is about
                half as tall and nothing scrolls. Below md it stacks in the same
                reading order. */}
            <div className="mt-6 grid gap-x-6 gap-y-6 md:grid-cols-2 md:items-start">
              {/* gap-5 rather than gap-4: a floated label sits half above its
                  field and needs the extra room not to touch the one above. */}
              <div className="flex flex-col gap-5">
                <Field
                  i={2}
                  name="name"
                  label="Name"
                  error={errors.name}
                  onCheck={check}
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  // Two non-space characters, so "  " can't satisfy minLength.
                  // Mirrors name.trim().length >= 2 in app/api/contact/route.ts.
                  pattern="\s*(\S\s*){2,}"
                  title="Please enter your name - at least 2 characters."
                  autoComplete="name"
                  placeholder="Jane Doe"
                />

                <Field
                  i={3}
                  name="business"
                  label="Business name"
                  error={errors.business}
                  onCheck={check}
                  type="text"
                  maxLength={100}
                  autoComplete="organization"
                  placeholder="Acme Co."
                />

                <Field
                  i={4}
                  name="email"
                  label="Email"
                  error={errors.email}
                  onCheck={check}
                  type="email"
                  required
                  maxLength={200}
                  // type="email" on its own accepts "jane@company"; the server
                  // wants the dot. Same expression as EMAIL_RE in the route.
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="Please enter a valid email address, e.g. jane@company.com."
                  autoComplete="email"
                  placeholder="jane@company.com"
                />

                {/* Honeypot - hidden from users, catches bots. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                {/* Every failed send lands here - a 400 from the route, the
                    429 rate limit, a 500, an unparseable platform error page,
                    an offline browser, or the fetch timeout. role="alert" is
                    what reads it out without moving focus off the field the
                    visitor was in. */}
                {status === "error" && (
                  <p
                    role="alert"
                    className="rounded-xl border border-accent-secondary/40 bg-accent-secondary/10 px-4 py-3 text-sm text-accent-secondary"
                  >
                    {error}
                  </p>
                )}

                {/* Under the fields it is filling in, not across the bottom of
                    the dialog - the brief on the right is for reading, and the
                    send button belongs to the column you just typed in. */}
                <button
                  type="submit"
                  disabled={status === "submitting" || cooldown > 0}
                  style={{ "--i": 6 } as CSSProperties}
                  className="cascade-item inline-flex h-13 w-full items-center justify-center rounded-full brand-gradient text-base font-semibold text-bg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                >
                  <Roll>
                    {status === "submitting"
                      ? "Sending…"
                      : cooldown > 0
                        ? `Wait ${cooldown}s`
                        : "Send brief"}
                  </Roll>
                </button>
              </div>

              {/* Read-only review of everything the configurator collected.
                  Wrapped in .float-field so its name sits on the border like
                  every other field's - this one has no resting state to return
                  to, and the CSS only drops the label back inside the box for
                  something empty or focused, so it stays up without being told.

                  The label being a sibling of the scroll box rather than inside
                  it is also what keeps it from scrolling away with the list. */}
              <div
                className="float-field cascade-item"
                style={{ "--i": 5 } as CSSProperties}
              >
                {/* 16rem is the fields column beside it, to the pixel: three
                    h-12 fields, three gap-5 gaps and the h-13 button. Capping
                    at exactly that is what stops this column from setting the
                    row height and pushing the dialog past 85dvh - the brief
                    scrolls so the dialog doesn't.

                    md only: below that the dialog is one column and already
                    scrolls, and a scroll box inside a scroll box on a phone is
                    a trap. */}
                <div
                  data-lenis-prevent
                  className="scroll-subtle rounded-xl border border-border bg-bg p-4 md:max-h-64 md:overflow-y-auto"
                >
                  <dl className="flex flex-col gap-2.5 text-sm">
                    {summary.services.map((service) => (
                      <div key={service.label}>
                        <dt className="font-medium">{service.label}</dt>
                        <dd className="text-text-muted">{service.value}</dd>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2.5">
                      <dt className="font-medium">Timeline preference</dt>
                      <dd className="text-text-muted">
                        {summary.timelinePreference}
                      </dd>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-2.5">
                      <div>
                        <dt className="text-text-muted">Estimated timeline</dt>
                        <dd className="font-semibold text-accent-primary">
                          {summary.estimate.timeline}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-muted">Estimated price</dt>
                        <dd className="font-semibold text-accent-primary">
                          {summary.estimate.price}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Not aria-hidden, unlike the pickers' labels in Cta.tsx -
                    there is no control here naming itself, so this span is the
                    only thing that introduces the list. */}
                <span className="float-label">Your brief</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
