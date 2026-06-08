import { describe as group, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCapabilities, type Described } from "./_capabilities";
import { PKG_ROOT } from "./_pkg";

/**
 * THE INVARIANT: nothing that can vary on screen exists only as a hardcoded
 * constant — every visual/temporal DOF is a schema field (with a default) or a
 * theme/template token, and all are enumerable from `cadence capabilities`.
 */

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const code = (rel: string) => stripComments(readFileSync(join(PKG_ROOT, rel), "utf8"));

group("no hardcoded timing constants remain in motion code", () => {
  const timing = code("src/motion/timing.ts");
  const useMotion = code("src/motion/useMotion.ts");

  test("timing.ts no longer holds the magic frame constants (2.6 / 18 / 10)", () => {
    expect(timing).not.toMatch(/\b2\.6\b/); // was CHARS_PER_FRAME
    expect(timing).not.toMatch(/\b18\b/); // was SETTLE
    expect(timing).not.toMatch(/\b10\b/); // was OUTPUT_GAP
  });

  test("useMotion.ts no longer holds the entrance/exit duration constants (0.55 / 0.4)", () => {
    expect(useMotion).not.toMatch(/\b0\.55\b/);
    expect(useMotion).not.toMatch(/\b0\.4\b/);
  });

  test("the constants are now template tokens, enumerable from capabilities", () => {
    const t = buildCapabilities().theme.timing;
    expect(t.typingSpeed.value).toBe(2.6);
    expect(t.settle.value).toBe(18);
    expect(t.outputGap.value).toBe(10);
    expect(t.enterDuration.value).toBe(0.55);
    expect(t.exitDuration.value).toBe(0.4);
  });
});

group("capabilities manifest is complete (no orphan DOF)", () => {
  const m = buildCapabilities();

  test("the walker introspected every field (no `unknown` types)", () => {
    const unknowns: string[] = [];
    const walk = (d: Described, path: string) => {
      if (d.type === "unknown") unknowns.push(path);
      if (d.fields) for (const [k, v] of Object.entries(d.fields)) walk(v, `${path}.${k}`);
      if (d.of) walk(d.of, `${path}[]`);
      if (d.variants) d.variants.forEach((v, i) => walk(v, `${path}|${i}`));
      if (d.items) d.items.forEach((v, i) => walk(v, `${path}.${i}`));
    };
    for (const [k, node] of Object.entries(m.nodes)) walk(node as Described, `nodes.${k}`);
    walk(m.backgrounds as Described, "backgrounds");
    walk(m.panels.kinds.map((x) => ({ type: "object", fields: x.fields }))[0] as Described, "panels[0]");
    expect(unknowns).toEqual([]);
  });

  test("every enum surfaced has non-empty values", () => {
    expect(m.formats.values.length).toBeGreaterThan(0);
    expect(m.motion.enter.values.length).toBeGreaterThan(0);
    expect(m.motion.exit.values.length).toBeGreaterThan(0);
    expect(m.placement.region.values.length).toBeGreaterThan(0);
    expect(m.theme.colors.roles.length).toBeGreaterThan(0);
  });
});
