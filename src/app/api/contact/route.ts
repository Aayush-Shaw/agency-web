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
 * being per-instance - a serverless cold start forgets the counts and a second
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
 * Hands the validated enquiry to EmailJS.
 *
 * Their REST endpoint rather than @emailjs/browser: the SDK is a browser
 * package, and moving the send to the client would put the keys in the bundle
 * and skip everything above - the validation, the honeypot and the per-IP cap
 * all live on this side of the wire.
 *
 * The private key is what authorises a non-browser caller. EmailJS blocks
 * server-side requests by default; the switch is in Account - Security.
 */
async function sendEmail(params: Record<string, string>) {
  const {
    EMAILJS_SERVICE_ID: service_id,
    EMAILJS_TEMPLATE_ID: template_id,
    EMAILJS_PUBLIC_KEY: user_id,
    EMAILJS_PRIVATE_KEY: accessToken,
  } = process.env;

  // A missing key is a deploy that forgot its env, not a visitor's mistake -
  // so it fails loudly here rather than returning ok and dropping the message.
  if (!service_id || !template_id || !user_id || !accessToken) {
    throw new Error("EmailJS environment variables are not set");
  }

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id,
      template_id,
      user_id,
      accessToken,
      template_params: params,
    }),
    // Their limit is one request a second; a slow one must not hold this route
    // open until the platform kills it with nothing logged.
    signal: AbortSignal.timeout(10_000),
  });

  // Success is a 200 with the body "OK"; failures put the reason in the body.
  if (!res.ok) {
    throw new Error(`EmailJS ${res.status}: ${await res.text()}`);
  }
}

/**
 * Contact form handler.
 *
 * Validates the submission server-side, then sends it via EmailJS.
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

  // SECURITY: this endpoint is public and unauthenticated. overLimit() above is
  // the only thing between it and a spam relay someone else pays for, and it is
  // deliberately a cheap one - read its note before this sends at volume.
  try {
    // Only these three keys, built here rather than spread from the body: a
    // caller that could add its own template params could reach the template's
    // own fields, recipient included. The name is flattened to one line
    // because the template puts it in the subject, and a subject is one line.
    await sendEmail({
      name: name.replace(/\s+/g, " ").trim(),
      email,
      message,
    });
  } catch (cause) {
    // The reason goes to the logs, never to the response: it can carry the
    // provider's own wording and, on a misconfiguration, the key it rejected.
    console.error("[contact] send failed", cause);
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
