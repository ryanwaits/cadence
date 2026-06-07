/**
 * TEMPLATE STYLING LAYER — type shapes (spec §1, §4).
 *
 * A `template` is the NEW stylistic layer: component styling (type scale,
 * weights, tracking, shadows, surfaces, padding), default region geometry per
 * format, motion personality, default backgrounds, and a bound default theme
 * name. It defers raw tokens to the theme via color *roles* (`resolveRole`),
 * and owns no narrative structure (that's a `kind`).
 *
 * theme = what color/font · template = how big/heavy/spaced/animated · kind =
 * what beats in what order.
 */
import type { ThemeColors } from "../theme/types";
import type { BackgroundSpec } from "../kinds/types";
import type { Format, MotionSpecData, PanelSpec } from "../schema/beats";
import type { ComponentType } from "../schema/composition";
import type { EnterPreset } from "../motion/names";

/**
 * A color ROLE names a theme token (`keyof ThemeColors`); the component resolves
 * it at render via `resolveRole()`. This is the only template↔theme coupling —
 * the template picks *which* role, the theme owns the actual value.
 */
export type ColorRole = keyof ThemeColors;

/** The standalone panel components (discriminated union members of `panelSchema`). */
export type PanelKind = PanelSpec["kind"];

/** Intra-region alignment, mirrors `alignSchema` in the composition layer. */
export type Align = "start" | "center" | "end";

/** Component size tier, mirrors `sizeSchema` — template maps these to per-format pixels. */
export type SizeHint = "auto" | "sm" | "md" | "lg" | "fill";

/** The four layout regions (spec §1, OD #1 — RESOLVED to the 4-region model). */
export type RegionName = "header" | "lead" | "trailing" | "footer";

/** Geometry for one region within a format. All fields optional → inherit/flow. */
export type RegionGeom = {
  top?: string;
  bottom?: string;
  dir?: "row" | "column";
  gap?: number;
  pad?: string;
  align?: Align;
  maxWidth?: string;
};

/**
 * Per-format pixel tiers for the `lead`/`trailing` band — the `size` enum
 * (`fill`/`md`/`auto`) resolves through these. Carries the values the legacy
 * `LAYOUT` map held that don't fit a single `RegionGeom` (code font + the
 * per-tier max/width pixels). Extracted verbatim from `ChangelogScene`.
 *
 * - `codeFont`  → `<CodeWindow fontSize>` for the `fill` code instance.
 * - `codeMax`   → `maxWidth` of a `fill` instance in a ROW band (16x9 split).
 * - `itemMax`   → `maxWidth` of any instance in a STACKED band (column).
 * - `panelW`    → `width` of an `md` instance in a ROW band.
 * - `panelMax`  → `maxWidth` of an `md` instance in a ROW band.
 */
export type BandSizes = {
  codeFont: number;
  codeMax: number;
  itemMax: number;
  panelW: number | string;
  panelMax: number;
};

/** Raw cubic-bezier control points `[x1, y1, x2, y2]` (a theme/template-agnostic curve). */
export type BezierTuple = [number, number, number, number];

export type MotionPersonality = {
  /** Shared entrance for the floating cards (code window + result panel). */
  cardEnter: MotionSpecData; // was CARD_ENTER = { enter: "settle", delay: 12 }
  defaultEnter: EnterPreset; // "rise"
  defaultEasing: "smooth" | "snappy";
  enterDistance: number; // px travel for `rise` (24)
  ease: { smooth: BezierTuple; snappy: BezierTuple };
};

export type LayoutModel = {
  /** Per-format region geometry. */
  regions: Record<Format, Partial<Record<RegionName, RegionGeom>>>;
  /** Per-format `size`-enum → pixel tiers for the lead/trailing band. */
  bands: Record<Format, BandSizes>;
  /** Where each component type lands when `placement.region` is omitted. */
  defaultRegion: Record<ComponentType, RegionName>;
  /** Default size tier per component type. */
  defaultSize: Partial<Record<ComponentType, SizeHint>>;
  /** Region overrides for the `layout:center` / `hero` full-frame variant. */
  variants: { hero: Partial<Record<RegionName, RegionGeom>> };
};

export type TemplateStyles = {
  headline: {
    /** Per-format type scale (the legacy `H` map). */
    scale: Record<Format, { top: string; size: number; eyebrow: number; track: number; max: string }>;
    headlineWeight: number;
    headlineTracking: string;
    headlineLineHeight: number;
    eyebrowWeight: number;
    eyebrowUppercase: boolean;
    subheadScale: number;
    subheadWeight: number;
    noteScale: number;
    shadows: { headline: string; headlineLight: string; eyebrow: string; subhead: string };
    eyebrowColor: ColorRole;
    headlineColor: ColorRole;
    headlineLightColor: ColorRole;
    subheadColor: ColorRole;
    noteColor: ColorRole;
  };
  panel: {
    surface: string;
    border: string;
    radius: number;
    shadowRole: "float";
    headerPadding: string;
    headerHairlineRole: ColorRole;
    bodyFontRole: "mono";
    titleSize: number;
    titleWeight: number;
    /** Per-panel literals (OD #2 — RESOLVED: nested under `panel.byKind`). */
    byKind: Record<PanelKind, Record<string, unknown>>;
  };
  badge: { size: number; track: string; radius: number; bgRole: ColorRole; fgRole: ColorRole };
  caption: { footerSize: number; subheadSize: number; weight: number; colorRole: ColorRole };
  radius: { sm: number; md: number; lg: number; xl: number; full: number };
};

export type TemplateStyle = {
  name: string;
  description: string;
  /** Bound default theme, e.g. "default"; `--theme` at render overrides. */
  theme: string;
  styles: TemplateStyles;
  layout: LayoutModel;
  motion: MotionPersonality;
  backgrounds: { default: BackgroundSpec };
};

export type { Format, BackgroundSpec, MotionSpecData, EnterPreset, ComponentType };
