"use client";

import { useState, type FormEvent } from "react";
import Eyebrow from "@/components/Eyebrow";

type Status = "idle" | "submitting" | "success" | "error";

const CONTACT_EMAIL = "hello@digitalbear.studio";

/** Section 12 — closing CTA + contact form (posts to /api/contact). */
export default function Cta() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      form.reset();
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const inputClass =
    "min-h-12 w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted/70 focus:border-accent-primary focus:outline-none";

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

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Pitch */}
        <div>
          <Eyebrow>Let&apos;s talk</Eyebrow>
          <h2 className="mt-5 text-section-xl font-bold leading-[1.05] tracking-tight">
            Ready to build something{" "}
            <span className="text-gradient">worth watching</span>?
          </h2>
          <p className="mt-5 max-w-md text-lead text-text-muted">
            Tell us what you&apos;re working on. We&apos;ll reply within one
            business day with next steps — no pushy sales calls.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-6 inline-block font-display text-lg font-semibold text-accent-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Form */}
        {status === "success" ? (
          <div className="glow-ring flex flex-col items-start justify-center rounded-2xl border border-transparent bg-surface p-8">
            <span className="claw h-8 w-8" aria-hidden="true" />
            <h3 className="mt-4 text-card-lg font-bold tracking-tight">
              Message sent — thank you.
            </h3>
            <p className="mt-2 text-text-muted">
              We&apos;ve got your enquiry and will be in touch within one
              business day.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-6 text-sm font-semibold text-accent-primary hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-border bg-surface p-6 md:p-8"
          >
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
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
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder="jane@company.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Project details
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  placeholder="Tell us about your project, timeline, and budget."
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Honeypot — hidden from users, catches bots. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {status === "error" && (
                <p role="alert" className="text-sm text-accent-secondary">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="glow mt-2 inline-flex h-13 items-center justify-center rounded-full bg-linear-to-r from-accent-primary to-accent-secondary text-base font-semibold text-bg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "submitting" ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
