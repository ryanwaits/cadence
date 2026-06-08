import { z } from "zod";
import { COLOR_ROLES } from "../theme/types";
import { codeSchema, motionSchema, panelSchema } from "./primitives";

/**
 * COMPOSITION SCHEMA — the single authoring model.
 *
 * A beat's `components: Node[]` is THE content spine the renderer walks. Terse
 * key-shorthand (`{title}`, `{code}`, …) is normalized to these canonical nodes
 * before parse (see `schema/normalize.ts`) — there is no separate legacy path.
 * `code`/`panel` instances REUSE `codeSchema`/`panelSchema` from `./primitives`
 * verbatim — never re-shaped.
 *
 * Import direction is one-way and acyclic: `beats.ts → composition.ts → primitives.ts`
 * (and `beats.ts → primitives.ts`). No `require`/lazy hack needed.
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
    /** Sequencing-as-data (T7): this node reveals after the node with this `id`
     * finishes (its typing-done for code, entrance-settle otherwise) + a gap. */
    revealAfter: z.string().optional(),
  })
  .strict();

/**
 * Per-node style override (decision §7.3). A CLOSED, validated prop set — NOT
 * arbitrary CSS — so per-instance tweaks stay honest + on-brand. `color`/`bg` are
 * theme ROLES only (no raw hex), so overrides survive a theme swap; `gap`/`padding`
 * accept raw values. Resolution chain at render: node.style → template STYLES → theme.
 * Parsed everywhere from T2; APPLIED by the renderer in T8.
 */
const colorRoleSchema = z.enum(COLOR_ROLES);
export const styleSchema = z
  .object({
    color: colorRoleSchema.optional(),
    bg: colorRoleSchema.optional(),
    gap: z.number().optional(),
    padding: z.string().optional(),
    /** letter-spacing override. */
    track: z.number().optional(),
    /** code-window chrome override (e.g. drop the window frame for a docs-style snippet). */
    chrome: z.enum(["window", "minimal", "none"]).optional(),
    /** per-instance size-tier override (otherwise the template default for the type). */
    size: sizeSchema.optional(),
  })
  .strict();
export type NodeStyle = z.infer<typeof styleSchema>;

/** Shared optional `style` field spread into every leaf + container node. */
const styleField = { style: styleSchema.optional() };

/** Shared optional `id` — a node's handle, referenced by another node's `revealAfter`. */
const idField = { id: z.string().optional() };

// Text-component prop shapes (the decomposed Headline + caption bar).
const titleProps = z.object({ text: z.string(), motion: motionSchema.optional() }).strict();
const eyebrowProps = z.object({ text: z.string() }).strict();
const noteProps = z.object({ text: z.string() }).strict();
const captionProps = z
  .object({ text: z.string(), variant: z.enum(["footer", "subhead"]).default("footer") })
  .strict();
const badgeProps = z.object({ text: z.string() }).strict();

// --- Leaf members (content nodes). Named so both the leaf union (`componentSchema`)
//     and the full tree union (`nodeSchema`) reference the SAME object schemas. ---
const titleNode = z.object({ type: z.literal("title"), ...idField, placement: placementSchema.default({}), ...styleField, ...titleProps.shape }).strict();
const eyebrowNode = z.object({ type: z.literal("eyebrow"), ...idField, placement: placementSchema.default({}), ...styleField, ...eyebrowProps.shape }).strict();
const noteNode = z.object({ type: z.literal("note"), ...idField, placement: placementSchema.default({}), ...styleField, ...noteProps.shape }).strict();
const captionNode = z.object({ type: z.literal("caption"), ...idField, placement: placementSchema.default({}), ...styleField, ...captionProps.shape }).strict();
const badgeNode = z.object({ type: z.literal("badge"), ...idField, placement: placementSchema.default({}), ...styleField, ...badgeProps.shape }).strict();
// `code`/`panel` reuse the existing schemas verbatim → zero drift, byte-identical.
const codeNode = z.object({ type: z.literal("code"), ...idField, placement: placementSchema.default({}), ...styleField, code: codeSchema }).strict();
const panelNode = z.object({ type: z.literal("panel"), ...idField, placement: placementSchema.default({}), ...styleField, panel: panelSchema }).strict();

/** The 7 leaf component types. Kept as its own union (separate from the container
 * tree `nodeSchema`) so `ComponentInstance` stays leaf-only — the introspection
 * walker + `_explain` read `componentSchema.options` for the leaf vocabulary. */
export const componentSchema = z.discriminatedUnion("type", [
  titleNode, eyebrowNode, noteNode, captionNode, badgeNode, codeNode, panelNode,
]);

export type ComponentInstance = z.infer<typeof componentSchema>;
/** "title" | "eyebrow" | "note" | "caption" | "badge" | "code" | "panel" */
export type ComponentType = ComponentInstance["type"];
export type Region = z.infer<typeof regionSchema>;
export type Align = z.infer<typeof alignSchema>;
export type SizeHint = z.infer<typeof sizeSchema>;
export type Placement = z.infer<typeof placementSchema>;

/**
 * COMPOSITION v2 — the bounded tree. Containers (`row`/`col`/`grid`/`group`) carry
 * `children`, so a beat's `components` is a recursive `Node[]` rather than a flat list.
 *
 * **Guardrail:** the TOP level is still region-routed (header/lead/trailing/footer) —
 * that's the on-brand skeleton. Containers are only meaningful *inside* a region. A
 * node nested in a container **inherits the container's region** (the renderer ignores
 * a nested child's `placement.region`); only top-level nodes use their own region
 * (or the template default). This is the minimum that unlocks free layout without
 * inviting off-brand/free-form output.
 *
 * **Reflow (renderer-side, decided here — a pure function of `(node, format)`, NO DOM
 * measurement so it stays Remotion-deterministic):**
 *   - `row` lays children along the main axis at 16x9, and **becomes a `col`** when
 *     `format !== "16x9"` — the same rule the legacy band uses (`ChangelogScene` `stack`).
 *   - `grid` tiles `cols` across at 16x9 and **collapses to `cols: 1`** below 16x9.
 *   - `col` is format-invariant (already vertical).
 *   - `group` has NO layout effect — a styling/motion scope only.
 *   - `size: "fill"` on a child = flex along the container's main axis; other tiers
 *     resolve against `LAYOUT_MODEL.bands[format]`. Nesting introduces NO new pixel
 *     constants — children always draw from the template's band tiers.
 *
 * Zod-4 recursion: `z.lazy` lives ONLY in the `children` field. A discriminated-union
 * member must expose its literal `type` at definition time, so the container schemas
 * themselves are eager `z.object`s; only their `children` defer to `nodeSchema`.
 */
export const CONTAINER_TYPES = ["row", "col", "grid", "group"] as const;
export type ContainerType = (typeof CONTAINER_TYPES)[number];

const containerBase = {
  ...idField,
  placement: placementSchema.default({}),
  ...styleField,
  gap: z.number().optional(),
  align: alignSchema.optional(),
  justify: alignSchema.optional(),
  /** Offset each child's reveal by `i * stagger` frames (sequence children in). */
  stagger: z.number().optional(),
};

const rowNode = z.object({ type: z.literal("row"), ...containerBase, children: z.array(z.lazy(() => nodeSchema)) }).strict();
const colNode = z.object({ type: z.literal("col"), ...containerBase, children: z.array(z.lazy(() => nodeSchema)) }).strict();
const gridNode = z
  .object({ type: z.literal("grid"), ...containerBase, cols: z.number().int().positive(), children: z.array(z.lazy(() => nodeSchema)) })
  .strict();
const groupNode = z
  .object({ type: z.literal("group"), ...idField, placement: placementSchema.default({}), ...styleField, children: z.array(z.lazy(() => nodeSchema)) })
  .strict();

type ContainerCommon = { id?: string; placement: Placement; style?: NodeStyle; gap?: number; align?: Align; justify?: Align; stagger?: number };
type ContainerNode =
  | ({ type: "row"; children: Node[] } & ContainerCommon)
  | ({ type: "col"; children: Node[] } & ContainerCommon)
  | ({ type: "grid"; cols: number; children: Node[] } & ContainerCommon)
  | { type: "group"; id?: string; placement: Placement; style?: NodeStyle; children: Node[] };

/** A node in the composition tree: any leaf component OR a layout container. */
export type Node = ComponentInstance | ContainerNode;

/** The recursive tree union. `z.lazy` defers evaluation so the forward references in
 * each container's `children` resolve. Annotated `z.ZodType<Node>` to close the loop. */
export const nodeSchema: z.ZodType<Node> = z.lazy(() =>
  z.discriminatedUnion("type", [
    titleNode, eyebrowNode, noteNode, captionNode, badgeNode, codeNode, panelNode,
    rowNode, colNode, gridNode, groupNode,
  ]),
);
