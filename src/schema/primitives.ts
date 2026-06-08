import { z } from "zod";
import { ENTER_PRESETS, EXIT_PRESETS } from "../motion/names";

/**
 * Leaf schemas shared by the beat contract (`beats.ts`) and the composition layer
 * (`composition.ts`). Kept in their own module with NO dependency on either, so the
 * two can both import these without a cycle (`beats → composition → primitives`).
 * These are re-exported from `beats.ts`, so existing `from "../schema/beats"`
 * imports keep working.
 */

const enterEnum = z.enum(ENTER_PRESETS);
const exitEnum = z.enum(EXIT_PRESETS);

export const motionSchema = z
  .object({
    enter: enterEnum.optional().meta({ describe: "entrance preset (see motion.enter for feels)" }),
    exit: exitEnum.optional().meta({ describe: "exit preset; omit to hold until the cut" }),
    easing: z.enum(["smooth", "snappy"]).optional().meta({ describe: "entrance easing", default: "smooth (template)" }),
    delay: z.number().optional().meta({ unit: "frames", default: 0, describe: "frames to wait before entering" }),
    durationInFrames: z.number().optional().meta({ unit: "frames", describe: "entrance length; default round(fps * timing.enterDuration)" }),
    distance: z.number().optional().meta({ unit: "px", default: 24, describe: "travel for the `rise` preset" }),
  })
  .strict();

export const formatSchema = z.enum(["16x9", "1x1", "9x16"]);

const codeTokenSchema = z.object({ content: z.string(), color: z.string() });

export const codeSchema = z
  .object({
    filename: z.string().meta({ describe: "window tab label", example: "stream.ts" }),
    lang: z.enum(["ts", "tsx", "bash", "json"]).meta({ describe: "syntax-highlight language" }),
    source: z.string().meta({ describe: "the code typed out by the typewriter", example: "const sl = createClient();" }),
    theme: z.literal("light").default("light"),
    motion: motionSchema.optional(),
    /** Filled by calculateMetadata via shiki — do not author by hand. */
    tokens: z.array(z.array(codeTokenSchema)).optional().meta({ describe: "engine-filled (shiki) — never author by hand" }),
  })
  .strict();

/**
 * Per-kind panel schemas, each named so the render-side registry
 * (`components/registry.ts`) can pair the SAME schema object with its component —
 * the schema and the dispatch reference one source, so they can't drift. These
 * stay in the (React-free) schema layer so the CLI validate/`--explain` path never
 * pulls Remotion. The discriminated union below is assembled from this record.
 */
export const PANEL_SCHEMAS = {
  feed: z.object({
    kind: z.literal("feed"),
    title: z.string().default("feed"),
    subtitle: z.string().optional(),
    status: z.string().default("live…"),
    rows: z.array(z.object({ badge: z.string(), label: z.string(), value: z.string() })),
    motion: motionSchema.optional(),
  }),
  "upload-progress": z.object({
    kind: z.literal("upload-progress"),
    file: z.string(),
    sizeMB: z.number(),
    parts: z.number(),
    motion: motionSchema.optional(),
  }),
  "data-table": z.object({
    kind: z.literal("data-table"),
    title: z.string().optional(),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    motion: motionSchema.optional(),
  }),
  status: z.object({
    kind: z.literal("status"),
    title: z.string().default("status"),
    services: z.array(z.object({ name: z.string(), state: z.enum(["ok", "syncing", "error", "idle"]), detail: z.string().optional() })),
    motion: motionSchema.optional(),
  }),
  proof: z.object({
    kind: z.literal("proof"),
    eventLine: z.string(),
    cursor: z.string(),
    signature: z.string(),
    keyId: z.string(),
    motion: motionSchema.optional(),
  }),
  "stream-resume": z.object({
    kind: z.literal("stream-resume"),
    fromCursor: z.string(),
    rows: z.array(z.object({ cursor: z.string(), label: z.string() })),
    motion: motionSchema.optional(),
  }),
  fork: z.object({
    kind: z.literal("fork"),
    blocks: z.array(z.object({ height: z.number(), hash: z.string(), state: z.enum(["canonical", "orphaned", "new"]) })),
    rewindTo: z.string(),
    motion: motionSchema.optional(),
  }),
  stat: z.object({
    kind: z.literal("stat"),
    value: z.string(),
    label: z.string(),
    sub: z.string().optional(),
    motion: motionSchema.optional(),
  }),
  diagram: z.object({
    kind: z.literal("diagram"),
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(["default", "data", "api"]).default("default") })),
    edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional() })),
    note: z.string().optional(),
    motion: motionSchema.optional(),
  }),
  // A Finder-style file/folder browser — the "result" card paired beside a code
  // window (e.g. a `list({ prefix, delimiter })` call rendering the folders +
  // files it returns). Sectioned so a listing can split into "prefixes"/"items".
  browser: z.object({
    kind: z.literal("browser"),
    title: z.string(),
    meta: z.string().optional(),
    sections: z.array(
      z.object({
        label: z.string().optional(),
        rows: z.array(z.object({ type: z.enum(["folder", "file"]), name: z.string(), meta: z.string().optional() })),
      })
    ),
    motion: motionSchema.optional(),
  }),
  // A pull-quote / testimonial card — proves a new panel kind is a registry add
  // (schema entry + component + registry line), no renderer/union edit.
  quote: z.object({
    kind: z.literal("quote"),
    text: z.string(),
    author: z.string().optional(),
    role: z.string().optional(),
    motion: motionSchema.optional(),
  }),
} as const;

/** Closed list of panel kinds, derived from the schema record (single source). */
export const PANEL_KINDS = Object.keys(PANEL_SCHEMAS) as (keyof typeof PANEL_SCHEMAS)[];

// Assembled FROM the record (not a hand-listed tuple) so a newly-registered kind
// joins the union automatically — adding a panel is a `PANEL_SCHEMAS` entry + a
// component + a registry line, with no edit here and none in the renderer.
type PanelSchemaValues = (typeof PANEL_SCHEMAS)[keyof typeof PANEL_SCHEMAS];
export const panelSchema = z.discriminatedUnion(
  "kind",
  Object.values(PANEL_SCHEMAS) as [PanelSchemaValues, ...PanelSchemaValues[]],
);

export type MotionSpecData = z.infer<typeof motionSchema>;
export type Format = z.infer<typeof formatSchema>;
export type CodeSpec = z.infer<typeof codeSchema>;
export type PanelSpec = z.infer<typeof panelSchema>;
/** "feed" | "upload-progress" | … — the closed panel-kind set, from `PANEL_SCHEMAS`. */
export type PanelKind = keyof typeof PANEL_SCHEMAS;
