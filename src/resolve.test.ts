import { describe, expect, test } from "bun:test";
import { changelogSchema } from "./schema/beats";
import { normalizeVideo } from "./schema/normalize";
import { resolveBeat } from "./resolve";
import { MOTION } from "./templates/active";

/** The pure beat resolver — regions, per-element reveal timings, resolved colors. */

const parseBeat = (raw: unknown) => changelogSchema.parse(normalizeVideo({ format: "16x9", beats: [raw] })).beats[0];

describe("resolveBeat", () => {
  test("a panel reveals after the code finishes typing (+ outputGap)", () => {
    const beat = parseBeat({
      id: "feature",
      durationInFrames: 235,
      components: [
        { title: "Query it." },
        { code: { filename: "q.ts", lang: "ts", source: "const x = await sl.query();" } },
        { panel: { kind: "feed", rows: [] } },
      ],
    });
    const r = resolveBeat(beat, "16x9");
    const code = r.nodes.find((n) => n.type === "code")!;
    const panel = r.nodes.find((n) => n.type === "panel")!;
    expect(panel.reveal).toBe(code.typingDone! + MOTION.timing.outputGap);
  });

  test("groups nodes into the four regions", () => {
    const beat = parseBeat({
      id: "b",
      durationInFrames: 150,
      components: [{ eyebrow: "new" }, { title: "Hi" }, { code: { filename: "a.ts", lang: "ts", source: "x" } }, { panel: { kind: "stat", value: "1", label: "n" } }],
    });
    const r = resolveBeat(beat, "16x9");
    expect(r.regions.header).toContain("eyebrow");
    expect(r.regions.lead).toEqual(expect.arrayContaining(["title", "code"]));
    expect(r.regions.trailing).toContain("panel");
  });

  test("resolves a title's color to a theme hex", () => {
    const beat = parseBeat({ id: "b", durationInFrames: 150, components: [{ title: "Hi" }] });
    const r = resolveBeat(beat, "16x9");
    const title = r.nodes.find((n) => n.type === "title")!;
    expect(title.color?.hex).toMatch(/^#?[0-9a-fA-F]/);
    expect(typeof title.color?.role).toBe("string");
  });

  test("revealAfter chains: a node holds until its target settles (+ outputGap)", () => {
    const beat = parseBeat({
      id: "b",
      durationInFrames: 300,
      components: [
        { type: "code", id: "c1", code: { filename: "a.ts", lang: "ts", source: "aaaa" } },
        { type: "panel", placement: { revealAfter: "c1" }, panel: { kind: "feed", rows: [] } },
      ],
    });
    const r = resolveBeat(beat, "16x9");
    const code = r.nodes.find((n) => n.id === "c1")!;
    const panel = r.nodes.find((n) => n.type === "panel")!;
    expect(panel.reveal).toBe(code.typingDone! + MOTION.timing.outputGap);
  });
});
