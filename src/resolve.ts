import type { Beat, Format } from "./schema/beats";
import type { ColorRole } from "./templates/types";
import { CONTAINER_TYPES, type Node, type Region } from "./schema/composition";
import { codeDoneFrame } from "./motion/timing";
import { MOTION, STYLES, resolveRole } from "./templates/active";
import { groupByRegion } from "./components/layout/regions";

/**
 * The pure (React-free) beat resolver — the ONE place that turns a beat's node tree
 * into laid-out regions + resolved per-element timings + colors. The renderer
 * (`ChangelogScene`) and the `cadence inspect` verb both read from here, so "when
 * does the panel reveal / what color is the title" has a single source.
 */

const TEXT_TYPES = new Set(["title", "eyebrow", "caption", "note", "badge"]);
const CONTAINERS = new Set<string>(CONTAINER_TYPES);
const REGIONS: Region[] = ["header", "lead", "trailing", "footer"];

/** First `code` node anywhere in a band (recursing containers). */
export function findCode(nodes: Node[]): Extract<Node, { type: "code" }> | undefined {
  for (const n of nodes) {
    if (n.type === "code") return n;
    if ("children" in n) {
      const f = findCode(n.children);
      if (f) return f;
    }
  }
  return undefined;
}

/**
 * Reveal-timing closure for a beat's band nodes. A node's base reveal is its
 * `revealAfter` target's done-frame + `outputGap`; absent that, a panel waits for
 * the band's code to finish typing (the legacy coupling, now just the default).
 * `doneFrame`/`baseReveal` are mutually recursive over `revealAfter`; `seen` guards
 * an authored cycle. Shared verbatim with the renderer so reveal stays one path.
 */
export function bandReveal(bandNodes: Node[], timing = MOTION.timing) {
  const codeForReveal = findCode(bandNodes);
  const byId = new Map<string, Node>();
  const indexIds = (nodes: Node[]): void => {
    for (const n of nodes) {
      if (n.id) byId.set(n.id, n);
      if ("children" in n) indexIds(n.children);
    }
  };
  indexIds(bandNodes);

  const doneFrame = (node: Node, seen: Set<Node>): number => {
    if (seen.has(node)) return 0;
    seen.add(node);
    const base = baseReveal(node, seen);
    return node.type === "code" ? base + codeDoneFrame(node.code, timing) : base + timing.settle;
  };
  const baseReveal = (node: Node, seen: Set<Node> = new Set()): number => {
    const after = node.placement?.revealAfter;
    if (after && byId.has(after)) return doneFrame(byId.get(after)!, seen) + timing.outputGap;
    if (node.type === "panel" && codeForReveal) return codeDoneFrame(codeForReveal.code, timing) + timing.outputGap;
    return 0;
  };
  return { revealOf: baseReveal, doneFrame, codeForReveal };
}

/** Template default color ROLE for a text node (before a per-node `style.color` override). */
const defaultColorRole = (n: Node): ColorRole | undefined => {
  switch (n.type) {
    case "title":
      return STYLES.headline.headlineColor;
    case "eyebrow":
      return STYLES.headline.eyebrowColor;
    case "note":
      return STYLES.headline.noteColor;
    case "caption":
      return n.variant === "subhead" ? STYLES.headline.subheadColor : STYLES.caption.colorRole;
    case "badge":
      return STYLES.badge.fgRole;
    default:
      return undefined;
  }
};

export type ResolvedNode = {
  id?: string;
  type: string;
  region: Region;
  /** Frame the node's content reveals (band nodes — code/panel). */
  reveal?: number;
  /** Frame a code node finishes typing (band code). */
  typingDone?: number;
  /** Resolved text color (role → hex). */
  color?: { role: ColorRole; hex: string };
};

export type ResolvedBeat = {
  id: string;
  layout: Beat["layout"];
  format: Format;
  durationInFrames: number;
  /** node id (or type) per region — the on-brand skeleton. */
  regions: Record<Region, string[]>;
  nodes: ResolvedNode[];
};

/** Resolve a beat to regions + per-element timings + colors (the `inspect` payload). */
export function resolveBeat(beat: Beat, format: Format): ResolvedBeat {
  const byRegion = groupByRegion(beat.components);
  const bandNodes = [...byRegion.lead, ...byRegion.trailing].filter((n) => !TEXT_TYPES.has(n.type));
  const { revealOf } = bandReveal(bandNodes);

  const nodes: ResolvedNode[] = [];
  const visit = (n: Node, region: Region): void => {
    const entry: ResolvedNode = { type: n.type, region, ...(n.id ? { id: n.id } : {}) };
    if (!TEXT_TYPES.has(n.type) && !CONTAINERS.has(n.type)) entry.reveal = revealOf(n);
    if (n.type === "code") entry.typingDone = revealOf(n) + codeDoneFrame(n.code);
    const role = n.style?.color ?? defaultColorRole(n);
    if (role) entry.color = { role, hex: resolveRole(role) };
    nodes.push(entry);
    if ("children" in n) for (const c of n.children) visit(c, region);
  };
  for (const region of REGIONS) for (const n of byRegion[region]) visit(n, region);

  return {
    id: beat.id,
    layout: beat.layout,
    format,
    durationInFrames: beat.durationInFrames,
    regions: Object.fromEntries(REGIONS.map((r) => [r, byRegion[r].map((n) => n.id ?? n.type)])) as Record<Region, string[]>,
    nodes,
  };
}
