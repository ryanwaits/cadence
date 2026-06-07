import { Easing } from "remotion";
import { activeTheme } from "../theme";
import { MOTION, STYLES } from "../templates/active";

/**
 * Engine tokens. Colors + shadow come from the active theme (swappable per render
 * via `--theme`); the easing curves and scale come from the active template.
 * These names are kept for back-compat (many files import them) but the values
 * are now template/theme-resolved.
 */
export const COLORS = activeTheme.colors;

export const CARET_BG = activeTheme.caretBg;

/** Code window chrome — `"window"` (floating editor) or `"minimal"` (docs-style). */
export const CODE_CHROME = activeTheme.codeChrome ?? "window";

/** Light [from, to] gradient for the procedural default backdrop ("shapes"). */
export const BACKDROP: [string, string] = activeTheme.backdrop ?? ["#e6edff", "#f8faff"];

/**
 * Two easings:
 * - `smooth`: pure ease-out — the ENTRANCE curve (no overshoot).
 * - `snappy`: a deliberate slight settle/overshoot — small UI state pops only.
 */
export const EASE = {
  smooth: Easing.bezier(...MOTION.ease.smooth),
  snappy: Easing.bezier(...MOTION.ease.snappy),
} as const;

/** No-overshoot spring for entrances (damping high so it settles, never bounces). */
export const SPRING_ENTER = { damping: 200, mass: 1, stiffness: 100 } as const;

export const RADIUS = STYLES.radius;

/** Shadow reserved for floating, dismissible chrome (windows/panels over the art). */
export const FLOAT_SHADOW = activeTheme.floatShadow;
