import { LAYOUT_MODEL } from "../../templates/active";
import type { ComponentInstance, ComponentType, Node, Region } from "../../schema/composition";

/**
 * Region routing — the on-brand top-level skeleton (header/lead/trailing/footer).
 * Pure helpers shared by the scene renderer and the `inspect` resolver (so both read
 * regions the same way). A node's region: explicit `placement.region` wins; else the
 * template default for its (leaf) type; a container without an explicit region falls
 * to `lead`.
 */
export const regionOf = (c: Node): Region =>
  c.placement?.region ?? LAYOUT_MODEL.defaultRegion[c.type as ComponentType] ?? "lead";

export type RegionGroups = Record<Region, Node[]>;

/** Group a beat's top-level nodes into the four named regions, preserving order. */
export function groupByRegion(nodes: Node[]): RegionGroups {
  const byRegion: RegionGroups = { header: [], lead: [], trailing: [], footer: [] };
  for (const c of nodes) byRegion[regionOf(c)].push(c);
  return byRegion;
}

/** Find the first node of `type` (optionally matching `match`) within a region's nodes. */
export const pickIn = <T extends ComponentInstance["type"]>(
  cs: Node[],
  type: T,
  match?: (c: Extract<ComponentInstance, { type: T }>) => boolean,
): Extract<ComponentInstance, { type: T }> | undefined =>
  cs.find(
    (c): c is Extract<ComponentInstance, { type: T }> =>
      c.type === type && (!match || match(c as Extract<ComponentInstance, { type: T }>)),
  ) as Extract<ComponentInstance, { type: T }> | undefined;
