import { Easing } from "remotion";
import { activeTheme } from "../theme";

/**
 * Engine tokens. Colors + shadow come from the active theme (swappable per render
 * via `--theme`); the easing curves and scale are engine constants.
 */
export const COLORS = activeTheme.colors;

export const CARET_BG = activeTheme.caretBg;

/** Light [from, to] gradient for the procedural default backdrop ("shapes"). */
export const BACKDROP: [string, string] = activeTheme.backdrop ?? ["#e6edff", "#f8faff"];

/**
 * Two easings:
 * - `smooth`: pure ease-out — the ENTRANCE curve (no overshoot).
 * - `snappy`: a deliberate slight settle/overshoot — small UI state pops only.
 */
export const EASE = {
  smooth: Easing.bezier(0.19, 1, 0.22, 1),
  snappy: Easing.bezier(0.175, 0.885, 0.32, 1.1),
} as const;

/** No-overshoot spring for entrances (damping high so it settles, never bounces). */
export const SPRING_ENTER = { damping: 200, mass: 1, stiffness: 100 } as const;

export const RADIUS = { sm: 3, md: 6, lg: 8, xl: 10, full: 999 } as const;

/** Shadow reserved for floating, dismissible chrome (windows/panels over the art). */
export const FLOAT_SHADOW = activeTheme.floatShadow;
