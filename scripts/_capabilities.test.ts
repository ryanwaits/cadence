import { describe as group, expect, test } from "bun:test";
import { z } from "zod";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildCapabilities, describe } from "./_capabilities";
import { codeSchema, PANEL_KINDS, panelSchema } from "../src/schema/primitives";
import { CONTAINER_TYPES } from "../src/schema/composition";
import { ENTER_PRESETS, EXIT_PRESETS } from "../src/motion/names";

/** The zod→capabilities walker: mechanical structure + harvested `.meta()` enrichments. */

group("describe() — primitives", () => {
  test("unwraps optional/default and reads required + default", () => {
    const d = describe(z.object({ a: z.string(), b: z.number().default(7), c: z.string().optional() }));
    expect(d.type).toBe("object");
    expect(d.fields!.a).toMatchObject({ type: "string" });
    expect(d.fields!.a.required).toBeUndefined(); // required = the absence of `required:false`
    expect(d.fields!.b).toMatchObject({ type: "number", default: 7 });
    expect(d.fields!.c.required).toBe(false);
  });

  test("enum + literal expose their values", () => {
    expect(describe(z.enum(["x", "y", "z"]))).toMatchObject({ type: "enum", values: ["x", "y", "z"] });
    expect(describe(z.literal("feed"))).toMatchObject({ type: "literal", values: ["feed"] });
  });

  test("harvests .meta() enrichments", () => {
    const d = describe(z.number().min(12).max(40).default(22).meta({ unit: "px", describe: "font size", example: 24 }));
    expect(d).toMatchObject({ type: "number", default: 22, unit: "px", describe: "font size", example: 24 });
  });

  test("array + tuple describe their elements", () => {
    expect(describe(z.array(z.string()))).toMatchObject({ type: "array", of: { type: "string" } });
    expect(describe(z.tuple([z.string(), z.number()])).items?.map((i) => i.type)).toEqual(["string", "number"]);
  });
});

group("describe() — real engine schemas", () => {
  test("codeSchema: filename/lang/source required, lang enum, theme default", () => {
    const d = describe(codeSchema);
    expect(d.type).toBe("object");
    expect(d.fields!.filename).toMatchObject({ type: "string" });
    expect(d.fields!.lang).toMatchObject({ type: "enum", values: ["ts", "tsx", "bash", "json"] });
    expect(d.fields!.theme).toMatchObject({ default: "light" });
    expect(d.fields!.tokens.required).toBe(false); // engine-filled, never authored
  });

  test("panelSchema: a discriminated union keyed by `kind` with every variant", () => {
    const d = describe(panelSchema);
    expect(d.type).toBe("union");
    expect(d.discriminator).toBe("kind");
    const kinds = d.variants!.map((v) => v.fields!.kind.values![0]);
    expect(kinds).toContain("feed");
    expect(kinds).toContain("stat");
    expect(kinds).toContain("diagram");
  });
});

group("buildCapabilities() — manifest", () => {
  const m = buildCapabilities();

  test("engine carries a sha256 schemaDigest + version", () => {
    expect(m.engine.schemaDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(typeof m.engine.version).toBe("string");
  });

  test("every panel kind appears with a `use`", () => {
    const kinds = m.panels.kinds.map((k) => k.kind);
    for (const k of PANEL_KINDS) expect(kinds).toContain(k);
    for (const k of m.panels.kinds) expect(typeof k.use).toBe("string"); // anti-drift: no kind without a use
  });

  test("every node type (leaves + containers) is present", () => {
    const types = Object.keys(m.nodes);
    for (const t of ["title", "eyebrow", "caption", "badge", "note", "code", "panel", ...CONTAINER_TYPES]) {
      expect(types).toContain(t);
    }
    for (const c of CONTAINER_TYPES) expect((m.nodes as Record<string, { container?: boolean }>)[c].container).toBe(true);
  });

  test("every motion preset has a feel (curated maps can't drift from the registry)", () => {
    const enters = m.motion.enter.values.map((v) => v.value);
    const exits = m.motion.exit.values.map((v) => v.value);
    for (const p of ENTER_PRESETS) expect(enters).toContain(p);
    for (const p of EXIT_PRESETS) expect(exits).toContain(p);
    for (const v of m.motion.enter.values) expect(typeof v.feel).toBe("string");
    for (const v of m.motion.exit.values) expect(typeof v.feel).toBe("string");
  });

  test("timing tokens carry numeric defaults", () => {
    expect(typeof m.theme.timing.typingSpeed.value).toBe("number");
    expect(typeof m.theme.timing.outputGap.value).toBe("number");
    expect(typeof m.theme.timing.enterDuration.value).toBe("number");
  });

  test("recipes reference REAL in-repo beats (file#id resolves)", async () => {
    for (const [name, recipe] of Object.entries(m.recipes)) {
      const [file, id] = (recipe as { from: string }).from.split("#");
      const mod = (await import(pathToFileURL(resolve(file)).href)).default;
      const ids = mod.beats.map((b: { id: string }) => b.id);
      expect(ids, `recipe ${name} → ${file}`).toContain(id);
    }
  });
});
