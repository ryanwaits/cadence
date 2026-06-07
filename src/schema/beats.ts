import { z } from "zod";
import { ENTER_PRESETS, EXIT_PRESETS } from "../motion/names";

/**
 * The data contract for a changelog video. Authored as a `.ts` module (for types
 * + comments) but **100% JSON-serializable** — every motion/panel/background is a
 * string key resolved at render time via registries. `scripts/render.ts` parses
 * a beats module with this schema, serializes to JSON, and feeds it as Remotion
 * input props.
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

export const beatSchema = z
  .object({
    id: z.string(),
    durationInFrames: z.number().int().positive(),
    /** Omit for the default procedural, theme-colored backdrop (the "shapes" pack). */
    background: z
      .object({
        /** A painting/image in public/ (the optional painterly style pack). */
        src: z.string().optional(),
        treatment: z.enum(["kenburns", "static"]).default("kenburns"),
        /** AI-free packs: a [from, to] gradient or a solid color. */
        gradient: z.tuple([z.string(), z.string()]).optional(),
        angle: z.number().default(160),
        solid: z.string().optional(),
        /** Procedural theme-colored backdrop (no asset, no API key) — the default. */
        shapes: z.boolean().optional(),
      })
      .refine((b) => b.src || b.gradient || b.solid || b.shapes, "background needs src, gradient, solid, or shapes")
      .optional(),
    eyebrow: z.string().optional(),
    headline: z.string(),
    headlineMotion: motionSchema.optional(),
    /** Optional sub-line pinned bottom-center — e.g. an install closer's tagline. */
    caption: z.string().optional(),
    /** Optional gold version pill shown with the caption — e.g. "v1.0". */
    badge: z.string().optional(),
    layout: z.enum(["split", "center"]).default("split"),
    /** Render as a centered hero/title card — big headline + `caption` as a
     * sub-tagline directly under it (e.g. a closing "package · one-line pitch"). */
    hero: z.boolean().optional(),
    /** Optional handwritten flourish rendered under the headline (FONTS.note,
     * marker color) — e.g. a product-name scrawl on a closer. Beat-level; distinct
     * from the `diagram` panel's `note`. */
    note: z.string().optional(),
    code: codeSchema.optional(),
    panel: panelSchema.optional(),
  })
  .strict();

export const changelogSchema = z
  .object({
    format: formatSchema.default("16x9"),
    beats: z.array(beatSchema).min(1),
    /** Reserved — silent render for now. */
    audio: z.object({ music: z.string().optional(), vo: z.string().optional() }).optional(),
  })
  .strict();

export type MotionSpecData = z.infer<typeof motionSchema>;
export type Format = z.infer<typeof formatSchema>;
export type CodeSpec = z.infer<typeof codeSchema>;
export type PanelSpec = z.infer<typeof panelSchema>;
export type Beat = z.infer<typeof beatSchema>;
export type ChangelogVideo = z.infer<typeof changelogSchema>;
/** Authoring type (defaults optional) — used by `content/*.beats.ts`. */
export type ChangelogInput = z.input<typeof changelogSchema>;

export const DIMENSIONS: Record<Format, { width: number; height: number }> = {
  "16x9": { width: 1920, height: 1080 },
  "1x1": { width: 1080, height: 1080 },
  "9x16": { width: 1080, height: 1920 },
};
