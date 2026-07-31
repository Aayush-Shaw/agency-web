"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";

export type Summary = {
  services: { label: string; value: string }[];
  timelinePreference: string;
  estimate: { price: string; timeline: string };
};

type Status = "idle" | "submitting" | "success" | "error";

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
  "min-h-12 w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted/70 focus:border-accent-primary focus:outline-none";

/**
 * Contact step of the configurator, in a native <dialog>.
 *
 * showModal() is doing the accessibility work that a hand-rolled modal would
 * have to reimplement: focus trap, focus returned to the opener on close, Esc
 * to dismiss, the rest of the page marked inert, and top-layer painting that
 * no z-index on the page can beat. The only thing left to add is the
 * click-outside, which is four lines because a click on the backdrop targets
 * the dialog element itself — hence p-0 here and the padding on the child.
 */
export default function ContactDialog({
  open,
  onClose,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  summary: Summary;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [business, setBusiness] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setStatus("idle");
      setError("");
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
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
          message: composeMessage(summary, business),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
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
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-text backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      {/* data-lenis-prevent so a wheel inside the dialog scrolls the dialog and
          not the page underneath it. */}
      <div
        data-lenis-prevent
        className="max-h-[85dvh] overflow-y-auto p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="contact-dialog-title"
            className="text-card-lg font-bold tracking-tight"
          >
            {status === "success" ? "Message sent — thank you." : "Start a conversation"}
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
          <>
            <p className="mt-3 text-text-muted">
              We&apos;ve got your brief and the estimate you built. Expect a reply
              within one business day.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="glow mt-6 inline-flex h-12 items-center justify-center rounded-full bg-linear-to-r from-accent-primary to-accent-secondary px-6 text-base font-semibold text-bg"
            >
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-1">
            <p className="text-sm text-text-muted">
              We&apos;ll send this brief straight to the team.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label htmlFor="cd-name" className="mb-1.5 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="cd-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="cd-business"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Business name{" "}
                  <span className="font-normal text-text-muted">(optional)</span>
                </label>
                <input
                  id="cd-business"
                  name="business"
                  type="text"
                  maxLength={100}
                  autoComplete="organization"
                  placeholder="Acme Co."
                  value={business}
                  onChange={(event) => setBusiness(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cd-email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="cd-email"
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder="jane@company.com"
                  className={inputClass}
                />
              </div>

              {/* Honeypot — hidden from users, catches bots. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
            </div>

            {/* Read-only review of everything the configurator collected. */}
            <div className="mt-6 rounded-xl border border-border bg-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Your brief
              </p>
              <dl className="mt-3 flex flex-col gap-2.5 text-sm">
                {summary.services.map((service) => (
                  <div key={service.label}>
                    <dt className="font-medium">{service.label}</dt>
                    <dd className="text-text-muted">{service.value}</dd>
                  </div>
                ))}
                <div className="border-t border-border pt-2.5">
                  <dt className="font-medium">Timeline preference</dt>
                  <dd className="text-text-muted">{summary.timelinePreference}</dd>
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

            {status === "error" && (
              <p role="alert" className="mt-4 text-sm text-accent-secondary">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="glow mt-6 inline-flex h-13 w-full items-center justify-center rounded-full bg-linear-to-r from-accent-primary to-accent-secondary text-base font-semibold text-bg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting" ? "Sending…" : "Send brief"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
