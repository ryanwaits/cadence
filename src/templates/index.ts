/**
 * Template styling layer (spec §1, §4) — public surface.
 *
 * Re-exports the registry, the type contract, and the bundle-time active
 * bindings (`STYLES`/`MOTION`/`LAYOUT_MODEL`/`resolveRole`). Components consume
 * these in Stage 1a; nothing reads them yet.
 */
export type {
  TemplateStyle,
  TemplateStyles,
  ColorRole,
  PanelKind,
  Align,
  SizeHint,
  RegionName,
  RegionGeom,
  BezierTuple,
  MotionPersonality,
  LayoutModel,
} from "./types";

export { fieldNotebook } from "./field-notebook";
export { TEMPLATES } from "./registry";
export { activeTemplate, STYLES, MOTION, LAYOUT_MODEL, resolveRole } from "./active";
