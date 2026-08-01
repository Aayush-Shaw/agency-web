import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How many submissions one address gets, and over what stretch. */
const MAX_PER_WINDOW = 3;
const WINDOW_MS = 10 * 60 * 1000;

const hits = new Map<string, number>();
let windowStart = Date.now();

/**
 * Per-IP submission cap. Counts every request, including honeypot hits, so a
 * flood costs the route as little as possible.
 *
 * ponytail: in-process counter with a window that resets for everyone at once
 * rather than sliding per caller. That keeps it to ten lines and bounds the
 * map's memory for free (the clear below is the only cleanup), at the price of
 * being per-instance — a serverless cold start forgets the counts and a second
 * instance keeps its own. It thins accidental and casual floods; it will not
 * stop a determined one. Move to a shared store (Vercel KV / Upstash) or edge
 * rate limiting when this endpoint actually sends mail at volume.
 */
function overLimit(request: Request) {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    hits.clear();
  }

  // Vercel sets x-forwarded-for; the fallback buckets every unknown together,
  // which fails closed rather than handing out an unlimited lane.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const count = (hits.get(ip) ?? 0) + 1;
  hits.set(ip, count);
  return count > MAX_PER_WINDOW;
}

/**
 * Contact form handler.
 *
 * Validates the submission server-side and returns success. No email provider
 * is wired yet (no secrets to leak) — drop your provider call where noted.
 */
export async function POST(request: Request) {
  if (overLimit(request)) {
    return NextResponse.json(
      { error: "Too many messages from here. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(WINDOW_MS / 1000) } }
    );
  }

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
  // SECURITY: this endpoint is public and unauthenticated. overLimit() above is
  // the only thing between it and a spam relay someone else pays for, and it is
  // deliberately a cheap one — read its note before you wire a provider up.
  console.log("[contact] new enquiry received");

  return NextResponse.json({ ok: true });
}
