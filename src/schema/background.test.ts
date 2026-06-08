import { describe, expect, test } from "bun:test";
import { changelogSchema } from "./beats";

/** The background `scrim` legibility wash (strength + placement) and its defaults. */

const beat = (background: unknown) => ({
  format: "16x9",
  beats: [{ id: "a", durationInFrames: 100, background, components: [{ type: "title", text: "x" }] }],
});

describe("background scrim", () => {
  test("scrim with strength + placement parses", () => {
    const v = changelogSchema.parse(beat({ src: "bg.png", scrim: { strength: 0.5, placement: "center" } }));
    expect(v.beats[0].background?.scrim).toEqual({ strength: 0.5, placement: "center" });
  });

  test("scrim defaults: strength 0, placement center", () => {
    const v = changelogSchema.parse(beat({ src: "bg.png", scrim: {} }));
    expect(v.beats[0].background?.scrim).toEqual({ strength: 0, placement: "center" });
  });

  test("strength is clamped to [0,1] — >1 rejected", () => {
    expect(() => changelogSchema.parse(beat({ src: "bg.png", scrim: { strength: 1.5 } }))).toThrow();
  });

  test("scrim is optional — a plain background still parses", () => {
    const v = changelogSchema.parse(beat({ src: "bg.png" }));
    expect(v.beats[0].background?.scrim).toBeUndefined();
  });
});
