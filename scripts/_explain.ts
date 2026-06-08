/**
 * Single source for the "allowed vocabulary" surfaced to the agent. GENERATED from
 * the schema + registries (never hand-maintained), so a newly-registered component,
 * panel, or container appears automatically in both `cadence edit --explain` and the
 * SKILL.md generated block (`sync-skill`). This is what makes the data-vs-code
 * boundary self-documenting: if it's in the registry it's data; otherwise it's a PR.
 */
import { CONTAINER_TYPES, componentSchema, regionSchema } from "../src/schema/composition";
import { PANEL_KINDS } from "../src/schema/primitives";

/** Leaf component types — the discriminated-union literals on a node's `type`. */
export const leafTypes = (): string[] =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (componentSchema.options as readonly any[]).map((o) => o.shape.type.value as string);

export const containerTypes = (): string[] => [...CONTAINER_TYPES];
export const regions = (): string[] => [...regionSchema.options];
export const panelKinds = (): string[] => [...PANEL_KINDS];

/** The markdown panel-kind list injected into SKILL.md's GENERATED block. */
export const panelKindsMarkdown = (): string => panelKinds().map((k) => `- \`${k}\``).join("\n");

/** Full `--explain` text. */
export const explainVocabulary = (): string =>
  [
    "allowed component types (leaves):\n  " + leafTypes().join(", "),
    "allowed layout containers (nest inside a region):\n  " + containerTypes().join(", "),
    "allowed regions:\n  " + regions().join(", "),
    "allowed panel kinds (panel.kind):\n  " + panelKinds().join(", "),
    "per-node style (optional): color/bg = a theme ROLE (not raw hex) · gap/padding · track · chrome (window|minimal|none) · size",
    "sequencing (optional): a node id + another node's placement.revealAfter; a container's stagger",
    "anything outside these needs a code change (a PR): a new component type, region, panel kind,\n" +
      "or motion preset is an engine primitive — not data.",
  ].join("\n\n");
