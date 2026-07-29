// Hero stage checks, against a running `npm run dev`.
//
//  1. Aurora animates, and renders exactly one static frame under
//     prefers-reduced-motion.
//  2. In light mode the hero and the navbar both resolve to the dark palette
//     while the hero is under the bar, and the navbar returns to the light
//     palette once the page has scrolled a full hero past the top.
//  3. Past the hero, the backdrop is display:none — which is what stops the
//     render loop.
import { chromium } from "playwright";
import assert from "node:assert";
import os from "node:os";

const URL = "http://localhost:3000";
// Screenshots land outside the repo unless SHOT_DIR says otherwise.
const SHOTS = process.env.SHOT_DIR ?? os.tmpdir();
const browser = await chromium.launch();

async function twoFrames(reducedMotion) {
  const page = await browser.newPage({
    viewport: { width: 900, height: 700 },
    reducedMotion,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const hero = page.locator("section#top");
  const a = await hero.screenshot();
  await page.waitForTimeout(1200);
  const b = await hero.screenshot();
  await page.close();
  return { same: a.equals(b), errors };
}

const moving = await twoFrames("no-preference");
const still = await twoFrames("reduce");
assert(!moving.same, "expected the aurora to animate");
assert(still.same, "expected a single static frame under reduced motion");
assert(moving.errors.length === 0 && still.errors.length === 0, "page errors");

// --- hero stage, forced to the light site theme (the case that can regress) ---
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  colorScheme: "light",
});
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => (document.documentElement.dataset.theme = "light"));
await page.waitForTimeout(600);

const probe = () =>
  page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    pastHero: document.documentElement.hasAttribute("data-past-hero"),
    heroPinned: document.querySelector("section#top").getBoundingClientRect().top,
    heroVisibility: getComputedStyle(document.querySelector("section#top"))
      .visibility,
    navText: getComputedStyle(document.querySelector("header a")).color,
    backdrop: getComputedStyle(document.querySelector(".hero-backdrop")).display,
    canvasBg: getComputedStyle(document.querySelector(".hero-backdrop canvas"))
      .backgroundColor,
  }));

const atTop = await probe();
await page.screenshot({ path: `${SHOTS}/check-1-top.png` });

// Mid-overlap: the next section has climbed over a pinned hero.
const heroHeight = await page.evaluate(
  () => document.querySelector("section#top").offsetHeight
);
await page.evaluate((y) => window.scrollTo(0, y), heroHeight * 0.6);
await page.waitForTimeout(1200);
const midway = await probe();
await page.screenshot({ path: `${SHOTS}/check-2-overlap.png` });

await page.evaluate((y) => window.scrollTo(0, y + 200), heroHeight);
await page.waitForTimeout(1200);
const past = await probe();
await page.screenshot({ path: `${SHOTS}/check-3-past.png` });

console.log({ moving, still, atTop, midway, past, errors });

assert(atTop.theme === "light", "site theme should still be light");
assert(atTop.canvasBg === "rgb(23, 18, 13)", "hero backdrop should clear dark");
assert(!atTop.pastHero && !midway.pastHero, "not past the hero yet");
assert(past.pastHero, "should be flagged past the hero");
assert(
  atTop.navText === midway.navText && atTop.navText !== past.navText,
  "navbar should hold the dark palette over the hero, then return to light"
);
assert(Math.abs(midway.heroPinned) < 1, "hero should be pinned at top-0");
assert(midway.backdrop !== "none" && past.backdrop === "none", "backdrop off");
assert(
  midway.heroVisibility === "visible" && past.heroVisibility === "hidden",
  "hero should show through the overlap, then take itself out of the stack"
);
assert(errors.length === 0, "page errors");
await page.close();

// --- the post-hero sheet must stay opaque, on a phone ---
//
// The hero stays pinned underneath for the whole page and six sections are
// deliberately transparent, so the sheet's own background is the only thing
// stopping the hero showing through. It bit on mobile first because the
// covering section is shorter than a tall phone viewport (Manifesto 522px vs
// 844px), leaving a strip below it with nothing but hero behind.
//
// .atmosphere lives in that sheet and is sticky rather than fixed for the same
// reason — a viewport-sized fixed layer would paint over the pinned hero above
// the sheet's top edge.
for (const [w, h] of [[390, 844], [430, 780], [360, 640]]) {
  const m = await browser.newPage({
    viewport: { width: w, height: h },
    isMobile: true,
    hasTouch: true,
  });
  await m.goto(URL, { waitUntil: "networkidle" });
  await m.waitForTimeout(1200);
  const heroH = await m.evaluate(() => document.querySelector("#top").offsetHeight);
  for (const y of [0, 200, Math.round(heroH * 0.5), heroH - 50, heroH, heroH + 400]) {
    await m.evaluate((v) => window.scrollTo(0, v), y);
    await m.waitForTimeout(350);
    const s = await m.evaluate(() => {
      const sheet = document.querySelector("main > div");
      const r = sheet.getBoundingClientRect();
      const a = document.querySelector(".atmosphere").getBoundingClientRect();
      const bg = getComputedStyle(sheet).backgroundColor;
      return {
        opaque: bg !== "rgba(0, 0, 0, 0)" && !bg.endsWith(", 0)"),
        sheetTop: Math.round(r.top),
        atmLeak: Math.round(Math.max(0, r.top - a.top)),
      };
    });
    assert(s.opaque, `post-hero sheet must be opaque (${w}x${h} @${y})`);
    assert(s.atmLeak === 0, `atmosphere ${s.atmLeak}px above sheet (${w}x${h} @${y})`);
  }
  await m.close();
}

console.log("OK");
await browser.close();
