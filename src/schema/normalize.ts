/**
 * AUTHORING SUGAR → canonical nodes (the single normalize step).
 *
 * The unified model has ONE node shape: a discriminated `{ type, … }` (see
 * `composition.ts`). To keep authoring terse, a node may be written in a compact
 * key-shorthand form that this module expands to the canonical shape:
 *
 *   { title: "Ship faster" }            → { type: "title",   text: "Ship faster" }
 *   { caption: "…", variant: "subhead" } → { type: "caption", text: "…", variant: "subhead" }
 *   { code: { filename, lang, source } } → { type: "code",    code: { … } }
 *   { panel: { kind: "feed", … } }       → { type: "panel",   panel: { … } }
 *
 * This is NOT a parallel schema and NOT a legacy code path — it's a pure,
 * idempotent rewrite run ONCE before `changelogSchema.parse`. Already-canonical
 * nodes (those carrying `type`) pass through untouched; container children are
 * recursed so sugar nests freely. `nodeSchema`/`componentSchema` stay the single
 * canonical unions the renderer + introspection read.
 *
 * Sugar is leaf-only by design — layout containers (`row/col/grid/group`) are
 * always authored canonically (`{ type: "row", children: [...] }`), so the
 * top-level skeleton stays explicit.
 */

/** Sugar keys whose value is the node's `text`. */
const TEXT_SUGAR = ["title", "eyebrow", "note", "caption", "badge"] as const;
/** Sugar keys whose value is carried under the same-named field. */
const OBJECT_SUGAR = ["code", "panel"] as const;

type Raw = Record<string, unknown>;

const isObject = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Expand one node. Canonical nodes (carrying `type`) pass through — recursing into
 * a container's `children`. A sugar object (no `type`, exactly one recognized sugar
 * key) becomes its canonical form, with any sibling keys (id/placement/style/motion/
 * variant) preserved.
 */
export function normalizeNode(raw: unknown): unknown {
  if (!isObject(raw)) return raw;

  // Canonical or container — leave the node, but normalize nested children.
  if ("type" in raw) {
    if (Array.isArray(raw.children)) {
      return { ...raw, children: raw.children.map(normalizeNode) };
    }
    return raw;
  }

  for (const key of TEXT_SUGAR) {
    if (key in raw) {
      const { [key]: text, ...rest } = raw;
      return { type: key, text, ...rest };
    }
  }
  for (const key of OBJECT_SUGAR) {
    if (key in raw) {
      const { [key]: value, ...rest } = raw;
      return { type: key, [key]: value, ...rest };
    }
  }

  // Unrecognized — return as-is so the schema surfaces a precise error.
  return raw;
}

/** Normalize a `components` array (each node + nested children). */
export function normalizeTree(nodes: unknown): unknown {
  return Array.isArray(nodes) ? nodes.map(normalizeNode) : nodes;
}

/**
 * Normalize a whole changelog input: rewrite each beat's `components` sugar to
 * canonical nodes. Idempotent and shallow elsewhere — beats without `components`
 * (and every other field) are untouched. Run before `changelogSchema.parse`.
 */
export function normalizeVideo(raw: unknown): unknown {
  if (!isObject(raw) || !Array.isArray(raw.beats)) return raw;
  return {
    ...raw,
    beats: raw.beats.map((beat) =>
      isObject(beat) && "components" in beat ? { ...beat, components: normalizeTree(beat.components) } : beat,
    ),
  };
}
