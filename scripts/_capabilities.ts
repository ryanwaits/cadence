/**
 * Zod → capabilities introspection. `describe(schema)` walks a zod 4 schema
 * MECHANICALLY (type/required/enum/default/nested shape) and merges the human
 * enrichments zod can't carry — `unit`, `min`, `max`, `example`, `feel`, `use`,
 * and a prose `describe` — from each field's `.meta()`/`.describe()` annotation.
 *
 * This is the single source the `cadence capabilities` manifest (T3.3) is built
 * from, so the agent-facing vocabulary can't drift from the engine's schemas.
 */

/** A self-describing field/schema node in the capabilities manifest. */
export type Described = {
  type: string;
  /** false when the field is optional (object context). */
  required?: boolean;
  default?: unknown;
  /** enum / literal members. */
  values?: unknown[];
  /** object fields. */
  fields?: Record<string, Described>;
  /** array element. */
  of?: Described;
  /** tuple positional items. */
  items?: Described[];
  /** union members + the discriminant key. */
  variants?: Described[];
  discriminator?: string;
  /** for a recursive self-reference (`lazy`) — e.g. a container's `children`. */
  ref?: string;
  // ── enrichments harvested from `.meta()` / `.describe()` ──
  describe?: string;
  unit?: string;
  min?: number;
  max?: number;
  example?: unknown;
  feel?: string;
  use?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySchema = any;

const defOf = (s: AnySchema) => s?.def ?? s?._def;
const metaOf = (s: AnySchema): Record<string, unknown> => {
  try {
    return (typeof s?.meta === "function" ? s.meta() : undefined) ?? {};
  } catch {
    return {};
  }
};

/** Enrichment keys lifted from `.meta()` into the manifest (verbatim). */
const ENRICH_KEYS = ["unit", "min", "max", "example", "feel", "use", "describe"] as const;

/** Recursively describe a zod schema for the capabilities manifest. */
export function describe(schema: AnySchema): Described {
  // Collect meta from the outermost schema (where `.meta()`/`.describe()` live)
  // before unwrapping optional/default/lazy.
  const meta = metaOf(schema);
  const description: string | undefined = schema?.description;

  let s = schema;
  let def = defOf(s);
  let required = true;
  let hasDefault = false;
  let defaultValue: unknown;

  // Unwrap optional/default/nullable wrappers. `lazy` is NOT unwrapped — it marks
  // the recursive node-tree self-reference; expanding it would loop forever, so it
  // becomes a `ref` (a container's `children` → array of node refs).
  while (def && (def.type === "optional" || def.type === "default" || def.type === "nullable")) {
    if (def.type === "optional" || def.type === "nullable") required = false;
    if (def.type === "default") {
      hasDefault = true;
      defaultValue = typeof def.defaultValue === "function" ? def.defaultValue() : def.defaultValue;
    }
    s = def.innerType;
    Object.assign(meta, metaOf(s)); // inner meta is a fallback, outer wins below
    def = defOf(s);
  }

  const out: Described = { type: def?.type === "lazy" ? "ref" : (def?.type ?? "unknown") };
  if (def?.type === "lazy") out.ref = "node";
  if (!required) out.required = false;
  if (hasDefault) out.default = defaultValue;
  else if ("default" in meta) out.default = meta.default;
  if (description) out.describe = description;
  for (const k of ENRICH_KEYS) if (k in meta) (out as Record<string, unknown>)[k] = meta[k];

  switch (def?.type) {
    case "object": {
      out.fields = {};
      for (const [k, v] of Object.entries(def.shape as Record<string, AnySchema>)) out.fields[k] = describe(v);
      break;
    }
    case "enum":
      out.values = Object.keys(def.entries);
      break;
    case "literal":
      out.values = def.values;
      break;
    case "array":
      out.of = describe(def.element);
      break;
    case "tuple":
      out.items = (def.items as AnySchema[]).map(describe);
      break;
    case "union":
      out.variants = (def.options as AnySchema[]).map(describe);
      if (def.discriminator) out.discriminator = def.discriminator;
      break;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// MANIFEST ASSEMBLY — the `cadence capabilities` document, generated FROM the
// schemas (via `describe`) + the registries, enriched with the tabular feels/uses
// that read better as curated maps (validated against the registries by the
// invariant test, so they can't list a kind/preset the engine doesn't have).
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DIMENSIONS, backgroundSchema, formatSchema } from "../src/schema/beats";
import { PANEL_KINDS, codeSchema, motionSchema, panelSchema } from "../src/schema/primitives";
import { CONTAINER_TYPES, alignSchema, nodeSchema, placementSchema, regionSchema, sizeSchema, styleSchema } from "../src/schema/composition";
import { ENTER_PRESETS, EXIT_PRESETS } from "../src/motion/names";
import { COLOR_ROLES } from "../src/theme/types";
import { fieldNotebook } from "../src/templates/field-notebook";
import { PKG_ROOT } from "./_pkg";

const PKG_VERSION: string = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")).version;

/** Structural fields every node carries — excluded from a node's authoring `props`. */
const STRUCTURAL = new Set(["type", "id", "placement", "style"]);

const FORMAT_USE: Record<string, string> = {
  "16x9": "default · site hero · YouTube",
  "1x1": "feed · square",
  "9x16": "reel · shorts · vertical",
};

const ENTER_FEEL: Record<string, string> = {
  rise: "slides up + fades in (headlines, cards)",
  settle: "scales 1.03→1 + fades (windows/panels arriving)",
  bloom: "fade + de-blur (backgrounds)",
  type: "character-by-character typewriter (code)",
  stagger: "children cascade in (list rows)",
  draw: "SVG stroke reveal (diagrams, the ✓ badge)",
  count: "number tweens 0→value (stat)",
};
const EXIT_FEEL: Record<string, string> = {
  sink: "slides up + fades out",
  dissolve: "fade out",
  lift: "scales up + fades out",
  cut: "instant",
};

const PANEL_USE: Record<string, string> = {
  feed: "live events / logs / a feed",
  "data-table": "a query / list result",
  browser: "file / folder listing",
  status: "service / test health",
  stat: "one big number (milestones, counts)",
  proof: "signed / verifiable output",
  "stream-resume": "resumable streams / iterators",
  fork: "reorg / finality",
  "upload-progress": "long-running / bulk ops",
  diagram: "architecture / how-it-works",
  quote: "a pull-quote / testimonial",
};

const NODE_DESCRIBE: Record<string, string> = {
  title: "heavy declarative headline (lead)",
  eyebrow: "small gold uppercase tracked label (header)",
  caption: "sub-line — `subhead` under a hero title, or a `footer` tagline",
  badge: "gold version pill (footer); suppressed on hero beats",
  note: "handwritten marker flourish",
  code: "typewriter code window (tokens engine-filled by shiki)",
  panel: "a result surface paired with code; reveals after the code finishes typing",
  row: "lay children along a row (becomes a column below 16x9)",
  col: "stack children in a column (format-invariant)",
  grid: "tile children across `cols` (collapses to 1 column below 16x9)",
  group: "a styling/motion scope with no layout effect",
};

/** The leaf component nodes (id, placement, style stripped) keyed by `type`. */
function nodeVocabulary() {
  const options = (nodeSchema as AnySchema).def.getter().def.options as AnySchema[];
  const nodes: Record<string, Described & { container?: boolean; describe?: string }> = {};
  for (const opt of options) {
    const d = describe(opt);
    const type = d.fields!.type.values![0] as string;
    const props: Record<string, Described> = {};
    for (const [k, v] of Object.entries(d.fields!)) if (!STRUCTURAL.has(k)) props[k] = v;
    nodes[type] = {
      type: "node",
      describe: NODE_DESCRIBE[type],
      ...(CONTAINER_TYPES.includes(type as never) ? { container: true } : {}),
      fields: props,
    };
  }
  return nodes;
}

const enumValues = (s: AnySchema): string[] => Object.keys((s as AnySchema).def.entries);

/** Deterministic stringify (sorted keys) for a stable schema digest. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export function buildCapabilities() {
  const timing = fieldNotebook.motion.timing;
  const ease = fieldNotebook.motion.ease;

  // The agent-facing schema shape the digest hashes — excludes engine-filled `tokens`.
  const code = describe(codeSchema);
  if (code.fields) delete code.fields.tokens;
  const schemaShape = {
    nodes: nodeVocabulary(),
    panels: describe(panelSchema),
    motion: describe(motionSchema),
    placement: describe(placementSchema),
    style: describe(styleSchema),
    code,
  };
  const schemaDigest = `sha256:${createHash("sha256").update(stable(schemaShape)).digest("hex")}`;

  return {
    $schema: "https://cadence.dev/schemas/capabilities/1.json",
    capabilitiesVersion: 1,
    engine: { version: PKG_VERSION, schemaDigest },

    formats: {
      type: "enum",
      default: "16x9",
      values: enumValues(formatSchema).map((v) => ({ value: v, dims: [DIMENSIONS[v as keyof typeof DIMENSIONS].width, DIMENSIONS[v as keyof typeof DIMENSIONS].height], use: FORMAT_USE[v] })),
    },

    // The single node vocabulary (leaves + containers) — generated from the tree union.
    nodes: schemaShape.nodes,

    // Panel kinds — the discriminated union, each variant + what it's for.
    panels: {
      discriminant: "kind",
      kinds: PANEL_KINDS.map((kind) => {
        const variant = (panelSchema as AnySchema).def.options.find((o: AnySchema) => o.def.shape.kind.def.values[0] === kind);
        return { kind, use: PANEL_USE[kind], fields: describe(variant).fields };
      }),
    },

    backgrounds: describe(backgroundSchema),

    motion: {
      enter: { type: "enum", default: fieldNotebook.motion.defaultEnter, values: ENTER_PRESETS.map((v) => ({ value: v, feel: ENTER_FEEL[v] })) },
      exit: { type: "enum", values: EXIT_PRESETS.map((v) => ({ value: v, feel: EXIT_FEEL[v] })) },
      easing: { type: "enum", default: fieldNotebook.motion.defaultEasing, values: ["smooth", "snappy"] },
      perElementOverrides: describe(motionSchema).fields,
    },

    placement: {
      region: { type: "enum", values: enumValues(regionSchema) },
      align: { type: "enum", default: "center", values: enumValues(alignSchema) },
      size: { type: "enum", values: enumValues(sizeSchema) },
      ...describe(placementSchema).fields,
    },

    // The brandable token surface (template + theme). Defaults shown from the default template.
    theme: {
      colors: { roles: [...COLOR_ROLES] },
      fonts: { slots: ["display", "body", "mono", "note"] },
      codeChrome: { type: "enum", values: ["window", "minimal", "none"], default: "window" },
      timing: {
        typingSpeed: { value: timing.typingSpeed, unit: "chars/frame", describe: "lower = slower typewriter" },
        outputGap: { value: timing.outputGap, unit: "frames", describe: "pause after code 'runs' before the panel reveals" },
        settle: { value: timing.settle, unit: "frames" },
        enterDuration: { value: timing.enterDuration, unit: "seconds", describe: "default component entrance; raise to de-choppy" },
        exitDuration: { value: timing.exitDuration, unit: "seconds" },
      },
      ease: { smooth: ease.smooth, snappy: ease.snappy },
      heroScrim: fieldNotebook.backgrounds.heroScrim,
    },

    // Honest starting points — compositions that reference REAL in-repo beats.
    recipes: {
      feature: { describe: "headline + code (lead) + panel (trailing), 16:9 split", from: "src/content/streams.beats.ts#stream" },
      "install-opener": { describe: "centered bash window + badge + caption pills", from: "src/content/clarinet-3.18.beats.ts#cta" },
      stat: { describe: "one big number centerpiece", from: "src/content/mainnet-launch.beats.ts#scale" },
      "hero-closer": { describe: "hero center: title + caption subhead", from: "src/content/files-sdk.beats.ts#hero" },
    },

    verbs: {
      capabilities: { out: "this document", flags: ["--json"] },
      new: { out: "a durable beats file (no render)" },
      edit: { out: "validate + normalize gate (re-run after each edit)" },
      storyboard: { out: "plan + one still per beat (png)" },
      inspect: { args: ["--beat <id>"], out: "computed regions, resolved colors, per-element timings (json)" },
      create: { out: "mp4", flags: ["--format", "--template", "--theme", "--theme-file", "--frame"] },
    },
  };
}
