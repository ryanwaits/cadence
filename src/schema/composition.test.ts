import { describe, expect, test } from "bun:test";
import { changelogSchema } from "./beats";
import { nodeSchema } from "./composition";

/**
 * T1 — the recursive container schema. Proves the Zod-4 `z.lazy`-in-`children`
 * discriminated union actually validates a nested tree at runtime (the highest-risk
 * claim in the RFC), and that adding containers didn't regress leaf parsing.
 */

describe("nodeSchema — recursive containers", () => {
  test("parses a col nesting code over panel (2 levels deep)", () => {
    const tree = {
      type: "col",
      placement: { region: "lead" },
      gap: 24,
      children: [
        { type: "code", code: { filename: "x.ts", lang: "ts", source: "1" } },
        { type: "panel", panel: { kind: "stat", value: "1M", label: "events" } },
      ],
    };
    const parsed = nodeSchema.parse(tree);
    if (parsed.type !== "col") throw new Error(`expected col, got ${parsed.type}`);
    expect(parsed.children).toHaveLength(2);
    expect(parsed.children[1].type).toBe("panel");
  });

  test("parses arbitrary nesting (grid → col → leaf)", () => {
    const tree = {
      type: "grid",
      cols: 2,
      children: [
        { type: "col", children: [{ type: "title", text: "a" }] },
        { type: "col", children: [{ type: "title", text: "b" }] },
      ],
    };
    expect(() => nodeSchema.parse(tree)).not.toThrow();
  });

  test("rejects an unknown node type", () => {
    expect(() => nodeSchema.parse({ type: "carousel", children: [] })).toThrow();
  });

  test("rejects unknown keys (strict)", () => {
    expect(() => nodeSchema.parse({ type: "title", text: "a", bogus: 1 })).toThrow();
  });
});

describe("style overrides — roles only, strict", () => {
  test("accepts a role color + raw gap on a node", () => {
    const node = { type: "title", text: "a", style: { color: "gold", chrome: "none" } };
    expect(() => nodeSchema.parse(node)).not.toThrow();
    const row = { type: "row", style: { gap: 12, padding: "0 40px" }, children: [{ type: "title", text: "a" }] };
    expect(() => nodeSchema.parse(row)).not.toThrow();
  });

  test("rejects a raw hex color (roles only — keeps overrides themeable)", () => {
    expect(() => nodeSchema.parse({ type: "title", text: "a", style: { color: "#c08a2e" } })).toThrow();
  });

  test("rejects an unknown style key (strict)", () => {
    expect(() => nodeSchema.parse({ type: "title", text: "a", style: { fontWeight: 700 } })).toThrow();
  });
});

describe("the v2 fixture + legacy content still validate", () => {
  test("nested-col fixture parses through changelogSchema", async () => {
    const video = (await import("../content/_fixtures/nested-col.beats.ts")).default;
    expect(() => changelogSchema.parse(video)).not.toThrow();
  });

  test("a representative legacy content file still parses", async () => {
    const video = (await import("../content/streams-launch.beats.ts")).default;
    expect(() => changelogSchema.parse(video)).not.toThrow();
  });
});
