import { z } from "zod";
import { codeSchema, motionSchema, panelSchema } from "./beats";

/**
 * COMPOSITION SCHEMA (spec §2).
 *
 * A beat may carry an optional `components: ComponentInstance[]`. The renderer
 * runs *only* on `components`; legacy beat fields desugar into this array
 * (see `desugar.ts`). `code`/`panel` instances REUSE `codeSchema`/`panelSchema`
 * from `beats.ts` verbatim — never re-shaped — so the render stays byte-identical.
 *
 * Import direction is one-way: `composition.ts` → `beats.ts`. `beats.ts` imports
 * `componentSchema` back, but only references it lazily inside `z.array(...)`,
 * which keeps the cycle from biting at module-eval time (see note in beats.ts).
 */

export const regionSchema = z.enum(["header", "lead", "trailing", "footer"]);
export const alignSchema = z.enum(["start", "center", "end"]);
export const sizeSchema = z.enum(["auto", "sm", "md", "lg", "fill"]);

export const placementSchema = z
  .object({
    /** Optional → falls to `template.defaultRegion[type]` at render. */
    region: regionSchema.optional(),
    align: alignSchema.optional(),
    /** Enum tier → per-format pixel sizing owned by the template. */
    size: sizeSchema.optional(),
    /** Intra-region sort key. */
    order: z.number().int().optional(),
  })
  .strict();

// Text-component prop shapes (the decomposed Headline + caption bar).
const titleProps = z.object({ text: z.string(), motion: motionSchema.optional() }).strict();
const eyebrowProps = z.object({ text: z.string() }).strict();
const noteProps = z.object({ text: z.string() }).strict();
const captionProps = z
  .object({ text: z.string(), variant: z.enum(["footer", "subhead"]).default("footer") })
  .strict();
const badgeProps = z.object({ text: z.string() }).strict();

export const componentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("title"), placement: placementSchema.default({}), ...titleProps.shape }).strict(),
  z.object({ type: z.literal("eyebrow"), placement: placementSchema.default({}), ...eyebrowProps.shape }).strict(),
  z.object({ type: z.literal("note"), placement: placementSchema.default({}), ...noteProps.shape }).strict(),
  z.object({ type: z.literal("caption"), placement: placementSchema.default({}), ...captionProps.shape }).strict(),
  z.object({ type: z.literal("badge"), placement: placementSchema.default({}), ...badgeProps.shape }).strict(),
  // `code`/`panel` reuse the existing schemas verbatim → zero drift, byte-identical.
  z.object({ type: z.literal("code"), placement: placementSchema.default({}), code: codeSchema }).strict(),
  z.object({ type: z.literal("panel"), placement: placementSchema.default({}), panel: panelSchema }).strict(),
]);

export type ComponentInstance = z.infer<typeof componentSchema>;
/** "title" | "eyebrow" | "note" | "caption" | "badge" | "code" | "panel" */
export type ComponentType = ComponentInstance["type"];
export type Region = z.infer<typeof regionSchema>;
export type Align = z.infer<typeof alignSchema>;
export type SizeHint = z.infer<typeof sizeSchema>;
export type Placement = z.infer<typeof placementSchema>;
