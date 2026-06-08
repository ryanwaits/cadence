import { z } from "zod";
import { nodeSchema } from "./composition";
import {
  codeSchema,
  formatSchema,
  motionSchema,
  panelSchema,
  type CodeSpec,
  type Format,
  type MotionSpecData,
  type PanelSpec,
} from "./primitives";

/**
 * The data contract for a changelog video. Authored as a `.ts` module (for types
 * + comments) but **100% JSON-serializable** — every motion/panel/background is a
 * string key resolved at render time via registries. `scripts/render.ts` parses
 * a beats module with this schema, serializes to JSON, and feeds it as Remotion
 * input props.
 *
 * The leaf schemas (motion/code/panel/format) live in `./primitives` so `beats.ts`
 * and `./composition` can both import them without a cycle. They're re-exported
 * below, so existing `from "../schema/beats"` imports keep resolving.
 */

export { codeSchema, formatSchema, motionSchema, panelSchema } from "./primitives";
export type { CodeSpec, Format, MotionSpecData, PanelSpec } from "./primitives";

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
    /** Relaxed from required → optional. A beat now needs EITHER a legacy
     * `headline` OR an explicit `components` array (enforced by `.refine` below). */
    headline: z.string().optional(),
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
    /** NEW, additive composition layer — a recursive `Node[]` tree (v2). When
     * present the renderer runs only on these; legacy fields desugar into a flat
     * leaf list (a depth-0 tree — see `desugar.ts`). Containers (`row`/`col`/
     * `grid`/`group`) nest *inside* a region; the top level stays region-routed. */
    components: z.array(nodeSchema).optional(),
  })
  .strict()
  // Presence, not truthiness: a legacy install opener carries `headline: ""`
  // (terminal-only card) and must stay valid.
  .refine((b) => b.components !== undefined || b.headline !== undefined, "beat needs `components` or a legacy `headline`");

export const changelogSchema = z
  .object({
    format: formatSchema.default("16x9"),
    /** Optional stylistic layer — one look per video, mirrors `format`. `theme`
     * is NOT a doc field (env/`.cadence/theme.json`-resolved). */
    template: z.string().optional(),
    beats: z.array(beatSchema).min(1),
    /** Reserved — silent render for now. */
    audio: z.object({ music: z.string().optional(), vo: z.string().optional() }).optional(),
  })
  .strict();

export type Beat = z.infer<typeof beatSchema>;
/** Re-exported for downstream consumers that work off the beat contract. */
export type { ComponentInstance, Node } from "./composition";
export type ChangelogVideo = z.infer<typeof changelogSchema>;
/** Authoring type (defaults optional) — used by `content/*.beats.ts`. */
export type ChangelogInput = z.input<typeof changelogSchema>;

export const DIMENSIONS: Record<Format, { width: number; height: number }> = {
  "16x9": { width: 1920, height: 1080 },
  "1x1": { width: 1080, height: 1080 },
  "9x16": { width: 1080, height: 1920 },
};
