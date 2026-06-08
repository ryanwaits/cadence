import type { Format } from "../../schema/beats";
import type { Align, Node, NodeStyle } from "../../schema/composition";
import { LAYOUT_MODEL, resolveRole } from "../../templates/active";
import type { BandSizes } from "../../templates/types";
import { CARD_ENTER } from "../../motion/useMotion";
import { CodeWindow } from "../CodeWindow";
import { Panel } from "../panels";

/**
 * The recursive container renderer (Composition v2, T6). `renderNode` walks a node
 * tree: leaves dispatch to their component, containers (`row`/`col`/`grid`/`group`)
 * lay out their children and recurse. Text leaves are NOT rendered here — the scene
 * composites them into the single `<Headline>` block — so renderNode covers the band
 * content: `code`, `panel`, and the containers that arrange them.
 *
 * Reflow is a pure function of `(node, format)` — NO DOM measurement — so the tree
 * stays Remotion-deterministic: a `row` becomes a column below 16x9 (the same rule
 * the legacy band uses), a `grid` collapses to one column, a `col` is invariant.
 */
export type RenderCtx = {
  band: BandSizes;
  format: Format;
  /** Base reveal frame for a node (its `revealAfter` target's done-frame, or the
   * legacy code→panel default). Built once per beat by the scene; stagger is added on top. */
  revealOf: (node: Node) => number;
  /** Accumulated stagger offset from ancestor containers (added to a node's reveal). */
  staggerOffset: number;
};

const flexAlign = (a?: Align): "flex-start" | "center" | "flex-end" =>
  a === "start" ? "flex-start" : a === "end" ? "flex-end" : "center";

/** A node's resolved size tier. Containers default to `fill` (occupy their band slot). */
export const sizeOf = (node: Node): string => {
  if (node.placement?.size) return node.placement.size;
  if (node.type === "row" || node.type === "col" || node.type === "grid" || node.type === "group") return "fill";
  return LAYOUT_MODEL.defaultSize[node.type as keyof typeof LAYOUT_MODEL.defaultSize] ?? "auto";
};

/**
 * Sizing for a child slot inside a flex container, by the child's size tier and the
 * container's axis. `vertical` (column axis) → full-width, capped at the band's
 * `itemMax`; horizontal → `fill` flexes (capped at `codeMax`), `md` is fixed
 * (`panelW`/`panelMax`). This reproduces the legacy band's two slot styles exactly.
 */
export function slotStyle(size: string, vertical: boolean, band: BandSizes): React.CSSProperties {
  if (vertical) return { flex: "0 0 auto", width: "100%", maxWidth: band.itemMax };
  if (size === "fill") return { flex: "1 1 0", maxWidth: band.codeMax };
  if (size === "md") return { flex: "0 0 auto", width: band.panelW, maxWidth: band.panelMax };
  return { flex: "0 0 auto", maxWidth: band.itemMax };
}

/** Lay children along an axis, each in a size-tier slot, recursing via renderNode.
 * `stagger` offsets each child's reveal by `i * stagger` frames (added to ctx). */
const FlexContainer: React.FC<{
  vertical: boolean;
  gap?: number;
  align?: Align;
  justify?: Align;
  stagger?: number;
  style?: NodeStyle;
  children: Node[];
  ctx: RenderCtx;
}> = ({ vertical, gap, align, justify, stagger, style, children, ctx }) => (
  <div
    style={{
      display: "flex",
      flexDirection: vertical ? "column" : "row",
      // `style.gap` overrides the container's `gap`; `bg`/`padding` tint/inset the box.
      gap: style?.gap ?? gap ?? 24,
      alignItems: vertical ? flexAlign(align) : (align ? flexAlign(align) : "flex-start"),
      justifyContent: justify ? flexAlign(justify) : "center",
      width: "100%",
      background: style?.bg ? resolveRole(style.bg) : undefined,
      padding: style?.padding,
      borderRadius: style?.bg ? 16 : undefined,
    }}
  >
    {children.map((c, i) => (
      <div key={i} style={slotStyle(sizeOf(c), vertical, ctx.band)}>
        {renderNode(c, { ...ctx, staggerOffset: ctx.staggerOffset + i * (stagger ?? 0) })}
      </div>
    ))}
  </div>
);

/** Render one node. Returns null for node types the band doesn't own (text leaves). */
export function renderNode(node: Node, ctx: RenderCtx): React.ReactNode {
  const offset = ctx.revealOf(node) + ctx.staggerOffset;
  switch (node.type) {
    case "code": {
      // A reveal/stagger offset delays the typewriter start (folds into motion delay).
      // offset === 0 (the legacy path) ⇒ motion passed through untouched → byte-identical.
      const motion =
        offset > 0
          ? { ...CARD_ENTER, ...node.code.motion, delay: (node.code.motion?.delay ?? CARD_ENTER.delay ?? 0) + offset }
          : node.code.motion;
      return <CodeWindow filename={node.code.filename} tokens={node.code.tokens ?? []} motion={motion} fontSize={ctx.band.codeFont} chrome={node.style?.chrome} />;
    }
    case "panel":
      return <Panel spec={node.panel} reveal={offset} />;
    case "row":
      // Reflow: a row becomes a column below 16x9 (degrades "side-by-side" to "stacked").
      return (
        <FlexContainer vertical={ctx.format !== "16x9"} gap={node.gap} align={node.align} justify={node.justify} stagger={node.stagger} style={node.style} children={node.children} ctx={ctx} />
      );
    case "col":
      return <FlexContainer vertical gap={node.gap} align={node.align} justify={node.justify} stagger={node.stagger} style={node.style} children={node.children} ctx={ctx} />;
    case "grid": {
      // Collapse to a single column below 16x9.
      const cols = ctx.format === "16x9" ? node.cols : 1;
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: node.style?.gap ?? node.gap ?? 24,
            width: "100%",
            background: node.style?.bg ? resolveRole(node.style.bg) : undefined,
            padding: node.style?.padding,
            borderRadius: node.style?.bg ? 16 : undefined,
          }}
        >
          {node.children.map((c, i) => (
            <div key={i}>{renderNode(c, { ...ctx, staggerOffset: ctx.staggerOffset + i * (node.stagger ?? 0) })}</div>
          ))}
        </div>
      );
    }
    case "group":
      // No layout effect — children participate in the parent's flow.
      return (
        <div style={{ display: "contents" }}>
          {node.children.map((c, i) => (
            <div key={i}>{renderNode(c, ctx)}</div>
          ))}
        </div>
      );
    default:
      // Text leaves (title/eyebrow/caption/note/badge) are composited into <Headline>.
      return null;
  }
}
