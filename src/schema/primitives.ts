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
    enter: enterEnum.optional(),
    exit: exitEnum.optional(),
    easing: z.enum(["smooth", "snappy"]).optional(),
    delay: z.number().optional(),
    durationInFrames: z.number().optional(),
    distance: z.number().optional(),
  })
  .strict();

export const formatSchema = z.enum(["16x9", "1x1", "9x16"]);

const codeTokenSchema = z.object({ content: z.string(), color: z.string() });

export const codeSchema = z
  .object({
    filename: z.string(),
    lang: z.enum(["ts", "tsx", "bash", "json"]),
    source: z.string(),
    theme: z.literal("light").default("light"),
    motion: motionSchema.optional(),
    /** Filled by calculateMetadata via shiki — do not author by hand. */
    tokens: z.array(z.array(codeTokenSchema)).optional(),
  })
  .strict();

export const panelSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("feed"),
    title: z.string().default("feed"),
    subtitle: z.string().optional(),
    status: z.string().default("live…"),
    rows: z.array(z.object({ badge: z.string(), label: z.string(), value: z.string() })),
    motion: motionSchema.optional(),
  }),
  z.object({
    kind: z.literal("upload-progress"),
    file: z.string(),
    sizeMB: z.number(),
    parts: z.number(),
    motion: motionSchema.optional(),
  }),
  z.object({
    kind: z.literal("data-table"),
    title: z.string().optional(),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    motion: motionSchema.optional(),
  }),
  z.object({
    kind: z.literal("status"),
    title: z.string().default("status"),
    services: z.array(z.object({ name: z.string(), state: z.enum(["ok", "syncing", "error", "idle"]), detail: z.string().optional() })),
    motion: motionSchema.optional(),
  }),
  z.object({
    kind: z.literal("proof"),
    eventLine: z.string(),
    cursor: z.string(),
    signature: z.string(),
    keyId: z.string(),
    motion: motionSchema.optional(),
  }),
  z.object({
    kind: z.literal("stream-resume"),
    fromCursor: z.string(),
    rows: z.array(z.object({ cursor: z.string(), label: z.string() })),
    motion: motionSchema.optional(),
  }),
  z.object({
    kind: z.literal("fork"),
    blocks: z.array(z.object({ height: z.number(), hash: z.string(), state: z.enum(["canonical", "orphaned", "new"]) })),
    rewindTo: z.string(),
    motion: motionSchema.optional(),
  }),
  z.object({
    kind: z.literal("stat"),
    value: z.string(),
    label: z.string(),
    sub: z.string().optional(),
    motion: motionSchema.optional(),
  }),
  z.object({
    kind: z.literal("diagram"),
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(["default", "data", "api"]).default("default") })),
    edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional() })),
    note: z.string().optional(),
    motion: motionSchema.optional(),
  }),
  // A Finder-style file/folder browser — the "result" card paired beside a code
  // window (e.g. a `list({ prefix, delimiter })` call rendering the folders +
  // files it returns). Sectioned so a listing can split into "prefixes"/"items".
  z.object({
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
]);

export type MotionSpecData = z.infer<typeof motionSchema>;
export type Format = z.infer<typeof formatSchema>;
export type CodeSpec = z.infer<typeof codeSchema>;
export type PanelSpec = z.infer<typeof panelSchema>;
