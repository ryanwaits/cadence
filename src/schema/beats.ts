import { z } from "zod";
import { CONTAINER_TYPES, nodeSchema, type Node } from "./composition";
import { formatSchema, type Format } from "./primitives";

const CONTAINER_SET = new Set<string>(CONTAINER_TYPES);

/** True if the composition tree contains ≥1 renderable leaf (a non-container node) —
 * an empty array or a beat of only empty containers draws nothing and is rejected. */
function hasRenderableLeaf(nodes: Node[]): boolean {
  for (const n of nodes) {
    if (!CONTAINER_SET.has(n.type)) return true;
    if ("children" in n && hasRenderableLeaf(n.children)) return true;
  }
  return false;
}

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

/** A beat's backdrop. Omit for the default procedural, theme-colored "shapes" pack. */
export const backgroundSchema = z
  .object({
    src: z.string().optional().meta({ describe: "a painting/image under public/ (painterly pack)", example: "backgrounds/congress.png" }),
    treatment: z.enum(["kenburns", "static"]).default("kenburns").meta({ describe: "image motion: slow pan/zoom or hold" }),
    gradient: z.tuple([z.string(), z.string()]).optional().meta({ describe: "AI-free [from, to] gradient", example: ["#312e81", "#0b1120"] }),
    angle: z.number().default(160).meta({ unit: "deg", describe: "gradient angle" }),
    solid: z.string().optional().meta({ describe: "a solid color fill", example: "#0b1120" }),
    shapes: z.boolean().optional().meta({ describe: "procedural theme-colored backdrop (no asset/API key) — the default when background is omitted" }),
    scrim: z
      .object({
        strength: z.number().min(0).max(1).default(0).meta({ min: 0, max: 1, default: 0, describe: "dark legibility wash opacity; 0 = off" }),
        placement: z.enum(["center", "top", "bottom", "full"]).default("center").meta({ describe: "where the wash sits" }),
      })
      .optional()
      .meta({ describe: "legibility wash behind centered/hero text over bright art; a hero-over-image beat gets a template default automatically" }),
  })
  .refine((b) => b.src || b.gradient || b.solid || b.shapes, "background needs src, gradient, solid, or shapes");

export const beatSchema = z
  .object({
    id: z.string(),
    durationInFrames: z.number().int().positive(),
    background: backgroundSchema.optional(),
    /** Full-frame composition. `split` = headline on top, content band below, footer shown.
     * `center` = content band centered full-frame, headline still on top, footer shown (an
     * install opener). `hero` = everything centered, footer suppressed (a closing hero card). */
    layout: z
      .enum(["split", "center", "hero"])
      .default("split")
      .meta({ describe: "split = headline top + content band below + footer; center = centered band, top headline, footer (install opener); hero = all centered, no footer (closer)" }),
    /** The single authoring spine: a recursive `Node[]` composition tree (leaves +
     * `row`/`col`/`grid`/`group` containers). Terse key-shorthand (`{title}`, `{code}`,
     * …) is normalized to canonical nodes before parse (see `schema/normalize.ts`).
     * Must contain ≥1 renderable leaf. */
    components: z
      .array(nodeSchema)
      .refine(hasRenderableLeaf, "beat needs at least one renderable leaf node (title/code/panel/…)")
      .meta({ describe: "the node tree — leaves (title/eyebrow/code/panel/…) and containers (row/col/grid/group)" }),
  })
  .strict();

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
