import { describe, expect, test } from "bun:test";
import type { Node } from "../schema/composition";
import { codeTypingDoneFrame, settledFrame } from "./timing";

/**
 * T7 — the pure timing helpers shared by the renderer and storyboard. `settledFrame`
 * picks a representative still: it must land AFTER code finishes typing and a result
 * panel reveals, so a contact-sheet thumbnail shows settled content.
 */

const codeNode = (source: string): Node => ({ type: "code", placement: {}, code: { filename: "x.ts", lang: "ts", source } } as Node);
const panelNode = (): Node => ({ type: "panel", placement: {}, panel: { kind: "stat", value: "1M", label: "events" } } as Node);

describe("settledFrame", () => {
  test("text-only beat settles at the default (no code/panel)", () => {
    const nodes: Node[] = [{ type: "title", placement: {}, text: "Hi" } as Node];
    expect(settledFrame(nodes)).toBe(18); // SETTLE default
  });

  test("code beat settles no earlier than the typewriter finishes", () => {
    const src = "const { events } = await sl.index.events({ limit: 50 });";
    const nodes = [codeNode(src)];
    // estimate uses source length when tokens absent
    const done = codeTypingDoneFrame([[{ content: src, color: "" }]], undefined);
    expect(settledFrame(nodes)).toBeGreaterThanOrEqual(done);
  });

  test("code + panel settles after the panel reveals (code done + gap + settle)", () => {
    const src = "await run();";
    const codeOnly = settledFrame([codeNode(src)]);
    const withPanel = settledFrame([codeNode(src), panelNode()]);
    expect(withPanel).toBeGreaterThan(codeOnly);
  });

  test("walks nested containers for the latest code", () => {
    const long = "x".repeat(200);
    const nested: Node[] = [
      { type: "col", placement: {}, children: [codeNode("short"), { type: "row", placement: {}, children: [codeNode(long)] } as Node] } as Node,
    ];
    const flat = settledFrame([codeNode("short")]);
    expect(settledFrame(nested)).toBeGreaterThan(flat); // the deep long code dominates
  });
});
