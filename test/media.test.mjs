import assert from "node:assert/strict";
import test from "node:test";
import * as media from "../src/lib/media.ts";

test("builds matching grid and popup paths for a video filename", () => {
  assert.equal(typeof media.gridVideo, "function");
  assert.equal(media.gridVideo("sample_AI.mp4"), "/vid/grid/sample_AI.mp4");
  assert.equal(media.popupVideo("sample_AI.mp4"), "/vid/popup/sample_AI.mp4");
});
