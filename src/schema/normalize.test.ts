import { describe, expect, test } from "bun:test";
import { normalizeNode, normalizeTree, normalizeVideo } from "./normalize";
import { componentSchema } from "./composition";

/**
 * The single authoring-sugar → canonical-node rewrite. Proves sugar expands 1:1
 * to the discriminated `{ type, … }` shape the schema/renderer read, that
 * canonical input is untouched (idempotent), and that nested container children
 * are recursed. Also asserts `componentSchema.options` survives — the capabilities
 * walker + `_explain` depend on the union staying a real union (NOT a ZodPipe).
 */

describe("normalizeNode", () => {
  test("text-leaf sugar → canonical", () => {
    expect(normalizeNode({ title: "Ship faster" })).toEqual({ type: "title", text: "Ship faster" });
    expect(normalizeNode({ eyebrow: "new" })).toEqual({ type: "eyebrow", text: "new" });
    expect(normalizeNode({ note: "scrawl" })).toEqual({ type: "note", text: "scrawl" });
    expect(normalizeNode({ badge: "v1.0" })).toEqual({ type: "badge", text: "v1.0" });
  });

  test("sibling keys (variant/id/placement/style/motion) are preserved", () => {
    expect(normalizeNode({ caption: "tagline", variant: "subhead" })).toEqual({
      type: "caption",
      text: "tagline",
      variant: "subhead",
    });
    expect(normalizeNode({ title: "x", id: "t1", placement: { region: "lead" } })).toEqual({
      type: "title",
      text: "x",
      id: "t1",
      placement: { region: "lead" },
    });
  });

  test("object-leaf sugar (code/panel) → canonical", () => {
    const code = { filename: "a.ts", lang: "ts", source: "const x = 1" };
    expect(normalizeNode({ code })).toEqual({ type: "code", code });
    const panel = { kind: "feed", rows: [] };
    expect(normalizeNode({ panel })).toEqual({ type: "panel", panel });
  });

  test("canonical nodes pass through untouched (idempotent)", () => {
    const canonical = { type: "title", text: "x", placement: {} };
    expect(normalizeNode(canonical)).toBe(canonical);
    expect(normalizeNode(normalizeNode({ title: "x" }))).toEqual({ type: "title", text: "x" });
  });

  test("container children are recursed", () => {
    const out = normalizeNode({
      type: "col",
      children: [{ title: "x" }, { type: "panel", panel: { kind: "stat" } }, { code: { filename: "b.ts", lang: "ts", source: "" } }],
    }) as { children: unknown[] };
    expect(out.children).toEqual([
      { type: "title", text: "x" },
      { type: "panel", panel: { kind: "stat" } },
      { type: "code", code: { filename: "b.ts", lang: "ts", source: "" } },
    ]);
  });

  test("nested containers expand deep sugar", () => {
    const out = normalizeNode({
      type: "row",
      children: [{ type: "col", children: [{ eyebrow: "deep" }] }],
    }) as { children: [{ children: unknown[] }] };
    expect(out.children[0].children).toEqual([{ type: "eyebrow", text: "deep" }]);
  });

  test("unrecognized object returned as-is (schema surfaces the error)", () => {
    expect(normalizeNode({ widget: "?" })).toEqual({ widget: "?" });
    expect(normalizeNode("not an object")).toBe("not an object");
  });
});

describe("normalizeTree / normalizeVideo", () => {
  test("normalizeTree maps an array of nodes", () => {
    expect(normalizeTree([{ title: "a" }, { badge: "b" }]) as unknown[]).toEqual([
      { type: "title", text: "a" },
      { type: "badge", text: "b" },
    ]);
  });

  test("normalizeVideo rewrites each beat's components, leaves other fields", () => {
    const raw = {
      format: "16x9",
      beats: [
        { id: "a", durationInFrames: 100, layout: "center", components: [{ title: "hi" }] },
        { id: "b", durationInFrames: 50 }, // no components — untouched
      ],
    };
    const out = normalizeVideo(raw) as { beats: Array<Record<string, unknown>> };
    expect(out.beats[0].components).toEqual([{ type: "title", text: "hi" }]);
    expect(out.beats[0].layout).toBe("center");
    expect(out.beats[1]).toEqual({ id: "b", durationInFrames: 50 });
  });
});

describe("schema invariants the normalizer relies on", () => {
  test("componentSchema stays a real union (.options present)", () => {
    expect(Array.isArray(componentSchema.options)).toBe(true);
    expect(componentSchema.options.length).toBeGreaterThan(0);
  });

  test("normalized sugar parses against the canonical leaf union", () => {
    const node = normalizeNode({ title: "Ship faster", placement: {} });
    expect(() => componentSchema.parse(node)).not.toThrow();
  });
});
