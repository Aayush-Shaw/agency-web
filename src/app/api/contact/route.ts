import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact form handler.
 *
 * Validates the submission server-side and returns success. No email provider
 * is wired yet (no secrets to leak) — drop your provider call where noted.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, message, website } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // Honeypot: real users never fill this hidden field. Silently accept + drop.
  if (typeof website === "string" && website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const valid =
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.length <= 100 &&
    typeof email === "string" &&
    email.length <= 200 &&
    EMAIL_RE.test(email) &&
    typeof message === "string" &&
    message.trim().length >= 10 &&
    message.length <= 2000;

  if (!valid) {
    return NextResponse.json(
      { error: "Please check the highlighted fields and try again." },
      { status: 400 }
    );
  }

  // TODO: send via your email provider (e.g. Resend) here.
  //
  // SECURITY: add rate limiting before you wire a provider up. This endpoint is
  // public and unauthenticated, so today the worst case is a wasted log line —
  // but the moment it sends mail it becomes a spam relay someone else pays for.
  // Per-IP limiting at the edge is the usual fix.
  console.log("[contact] new enquiry received");

  return NextResponse.json({ ok: true });
}
