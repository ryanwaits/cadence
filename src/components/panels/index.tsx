import type { PanelSpec } from "../../schema/beats";
import { PANEL_REGISTRY } from "../registry";

/**
 * Resolve a PanelSpec (by its `kind`) to the right panel component via the
 * `PANEL_REGISTRY`. `reveal` is a frame offset that holds the panel's *content*
 * animations (rows, counters, draws) until the paired code window has finished
 * typing — the card/header still mount immediately, so both components are on
 * screen together.
 *
 * Completeness is guaranteed at the type level by the registry's mapped type (every
 * `PanelKind` must have an entry), so the old `assertNever` switch is no longer needed.
 */
export const Panel: React.FC<{ spec: PanelSpec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  // The registry guarantees an entry per kind + a Component matching that kind's
  // spec; TS can't correlate `spec` with the indexed Component across `spec.kind`,
  // so one localized widening cast bridges the lookup.
  const Component = PANEL_REGISTRY[spec.kind].Component as React.FC<{ spec: PanelSpec; reveal?: number }>;
  return <Component spec={spec} reveal={reveal} />;
};
