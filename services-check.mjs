// Services rail checks, against a running dev server.
//
//  1. Cards lay out along an arc: spread across x, sagging in y away from
//     centre, and rotated tangent to it.
//  2. Landscape cards are 16:9, portrait cards 9:16, and the swap survives a
//     resize with a clean re-layout.
//  3. Arrow keys advance by exactly one card pitch.
//  4. Hover tilts a card in 3D on a fine pointer, and eases back on leave.
//  5. No tilt handler exists on a coarse pointer.
import { chromium, devices } from "playwright";
import assert from "node:assert";

const URL = process.env.URL ?? "http://localhost:3000";
const browser = await chromium.launch();

const readCards = () =>
  [...document.querySelectorAll("#services [aria-hidden='false'], #services .absolute")]
    .slice(0, 5)
    .map((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return {
        x: m.m41,
        y: m.m42,
        z: m.m43,
        rot: Math.round((Math.atan2(m.m12, m.m11) * 180) / Math.PI),
        w: el.offsetWidth,
        h: el.offsetHeight,
      };
    });

// The rail wraps cards far off-screen, so always act on the one nearest the
// middle rather than whichever happens to be first in the DOM — hovering an
// off-screen card would make "no tilt ran" pass for the wrong reason.
const centreCard = async (p) =>
  (
    await p.evaluateHandle(() =>
      [...document.querySelectorAll("#services .absolute")].reduce((best, el) =>
        Math.abs(new DOMMatrix(getComputedStyle(el).transform).m41) <
        Math.abs(new DOMMatrix(getComputedStyle(best).transform).m41)
          ? el
          : best
      )
    )
  ).asElement();

// Every service is shown whole — no disclosure, no truncation — so no card's
// content may exceed the box the fixed aspect ratio gives it.
const assertNothingClipped = async (p, where) => {
  const over = await p.evaluate(() =>
    [...document.querySelectorAll("#services .absolute > *")]
      .map((el, i) => (el.scrollHeight > el.clientHeight + 1 ? `${i}:+${el.scrollHeight - el.clientHeight}px` : null))
      .filter(Boolean)
  );
  assert(over.length === 0, `${where}: card content overflows its card — ${over.join(", ")}`);
};

async function open(opts) {
  const page = await browser.newPage(opts);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  return { page, errors };
}

// ---- desktop / landscape -------------------------------------------------
const { page, errors } = await open({ viewport: { width: 1280, height: 800 } });

let cards = await page.evaluate(readCards);
assert(cards.length >= 5, `expected 5+ cards, got ${cards.length}`);

// 16:9 in landscape
const ratio = cards[0].w / cards[0].h;
assert(Math.abs(ratio - 16 / 9) < 0.02, `landscape ratio ${ratio.toFixed(3)} != 16:9`);

// Distinct, evenly pitched x positions
const xs = cards.map((c) => c.x).sort((a, b) => a - b);
const gaps = xs.slice(1).map((v, i) => v - xs[i]);
assert(
  gaps.every((g) => Math.abs(g - gaps[0]) < 1),
  `uneven card pitch: ${gaps.map((g) => g.toFixed(1))}`
);
assert(Math.abs(gaps[0] - cards[0].w * 1.18) < 1, `pitch ${gaps[0]} != 1.18 * card width`);

// The arc: the card nearest centre sits highest and flat; outer cards sag,
// recede in z, and rotate. bend > 0 => y grows downward away from centre.
const byDist = [...cards].sort((a, b) => Math.abs(a.x) - Math.abs(b.x));
assert(Math.abs(byDist[0].rot) < Math.abs(byDist[byDist.length - 1].rot), "no tangent rotation");
assert(byDist[0].y < byDist[byDist.length - 1].y, "arc does not sag away from centre");
assert(byDist[byDist.length - 1].z < byDist[0].z, "outer cards do not recede in z");
// Sign: right of centre rotates clockwise (positive) on a positive bend.
const right = cards.find((c) => c.x > cards[0].w);
const left = cards.find((c) => c.x < -cards[0].w);
if (right && left) assert(right.rot > 0 && left.rot < 0, "arc rotation is mirrored wrong");

await assertNothingClipped(page, "landscape");

// ---- keyboard advances exactly one pitch ---------------------------------
const before = (await page.evaluate(readCards))[0].x;
await page.locator("#services [role='region']").focus();
await page.keyboard.press("ArrowRight");
// The lerp is asymptotic — ~90% of the travel lands in 350ms, but the loop
// only parks once it is within 0.1px, which takes about 1.8s at ease 0.08.
await page.waitForTimeout(2500);
const after = (await page.evaluate(readCards))[0].x;
assert(
  Math.abs(Math.abs(after - before) - gaps[0]) < 2,
  `arrow key moved ${Math.abs(after - before).toFixed(1)}, expected pitch ${gaps[0].toFixed(1)}`
);

// ---- hover tilt (fine pointer) -------------------------------------------
assert(
  await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches),
  "browser does not report a fine pointer — tilt gate can't be exercised here"
);
const card = await centreCard(page);
const box = await card.boundingBox();
await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.9);
await page.waitForTimeout(400);
const tilted = await card.evaluate((el) => getComputedStyle(el.firstElementChild).transform);
assert(tilted !== "none" && tilted.startsWith("matrix3d"), `no 3d tilt: ${tilted}`);
await page.mouse.move(box.x + box.width / 2, box.y - 200);
await page.waitForTimeout(500);
const flat = await card.evaluate((el) => el.firstElementChild.style.transform);
assert(flat === "", `tilt did not ease back to flat: "${flat}"`);

// ---- vertical wheel belongs to the page, not the rail --------------------
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
const beforeWheel = (await page.evaluate(readCards))[0].x;
const beforeScroll = await page.evaluate(() => window.scrollY);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(1500);
const afterWheel = (await page.evaluate(readCards))[0].x;
assert(
  await page.evaluate((y) => window.scrollY !== y, beforeScroll),
  "the page did not scroll — wheel test proves nothing"
);
assert(
  Math.abs(afterWheel - beforeWheel) < 1,
  `scrolling the page spun the rail by ${(afterWheel - beforeWheel).toFixed(1)}px`
);

// ---- short laptop, the viewport the `short:` variant exists for ----------
await page.setViewportSize({ width: 1366, height: 610 });
await page.waitForTimeout(500);
await assertNothingClipped(page, "short landscape");

// ---- resize to portrait --------------------------------------------------
await page.setViewportSize({ width: 420, height: 900 });
await page.waitForTimeout(500);
cards = await page.evaluate(readCards);
const pRatio = cards[0].w / cards[0].h;
assert(Math.abs(pRatio - 9 / 16) < 0.02, `portrait ratio ${pRatio.toFixed(3)} != 9:16`);
const pGaps = cards
  .map((c) => c.x)
  .sort((a, b) => a - b)
  .slice(1)
  .map((v, i, _, s = cards.map((c) => c.x).sort((a, b) => a - b)) => v - s[i]);
assert(
  Math.abs(pGaps[0] - cards[0].w * 1.18) < 1,
  `portrait re-layout kept the old pitch: ${pGaps[0].toFixed(1)} vs ${(cards[0].w * 1.18).toFixed(1)}`
);
await assertNothingClipped(page, "portrait");
assert(errors.length === 0, `page errors: ${errors}`);
await page.close();

// ---- touch device: no tilt handler at all --------------------------------
const { page: mobile, errors: mErrors } = await open({ ...devices["Pixel 7"] });
const mCard = await centreCard(mobile);
const mBox = await mCard.boundingBox();
await mobile.mouse.move(mBox.x + mBox.width * 0.9, mBox.y + mBox.height * 0.9);
await mobile.waitForTimeout(400);
const mTransform = await mCard.evaluate((el) => el.firstElementChild.style.transform);
assert(mTransform === "", `tilt ran on a coarse pointer: "${mTransform}"`);
assert(mErrors.length === 0, `mobile page errors: ${mErrors}`);
await mobile.close();

await browser.close();
console.log("services rail: all checks passed");
