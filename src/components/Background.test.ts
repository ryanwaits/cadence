import { describe, expect, test } from "bun:test";
import { kenBurns } from "./Background";

/**
 * For `transform: scale(s) translateY(t)` about the center, the image bottom edge
 * (centered coord +H/2) maps to `s·(H/2 + t)` and the top edge to `s·(t − H/2)`.
 * Either crossing inside the frame edge exposes the parent fill (the white strip).
 */
const exposurePx = (s: number, t: number, H: number) =>
  Math.max(0, H / 2 - s * (H / 2 + t), H / 2 - s * (H / 2 - t));

describe("kenBurns never exposes a frame edge", () => {
  const DUR = 150;
  // Sample every frame for both common backdrop heights (16:9 1080, vertical 1920).
  for (const H of [1080, 1920]) {
    test(`H=${H}: bottom/top stay covered across the whole drift`, () => {
      let worst = 0;
      for (let f = 0; f <= DUR; f++) {
        const { scale, translateY } = kenBurns(f, DUR);
        worst = Math.max(worst, exposurePx(scale, translateY, H));
      }
      expect(worst).toBe(0);
    });
  }
});
