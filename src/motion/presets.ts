import type { EnterPreset, ExitPreset } from "./names";

/**
 * Pure preset functions: given a normalized progress `p` (0→1, already eased by
 * the caller) they return a style fragment. Keeping them pure (no hooks) makes
 * the vocabulary testable and lets `useMotion` own all timing/easing.
 *
 * Entrances use the caller's `smooth` easing (pure ease-out). `type`/`draw`/
 * `count` carry their value internally (typewriter chars, stroke offset, tween)
 * so as container presets they only gate visibility — see the helpers below.
 */
export type StyleFrag = { opacity: number; transform: string; filter?: string };

export function enterStyle(
  name: EnterPreset,
  p: number,
  opts: { distance?: number; reduced?: boolean } = {}
): StyleFrag {
  const reduced = opts.reduced ?? false;
  const d = opts.distance ?? 24;
  switch (name) {
    case "rise":
      return { opacity: p, transform: reduced ? "none" : `translateY(${(1 - p) * d}px)` };
    case "settle":
      return { opacity: p, transform: reduced ? "none" : `scale(${(1.03 - 0.03 * p).toFixed(4)})` };
    case "bloom":
      return { opacity: p, transform: "none", filter: reduced ? undefined : `blur(${((1 - p) * 8).toFixed(2)}px)` };
    case "stagger":
      return { opacity: p, transform: reduced ? "none" : `translateY(${(1 - p) * 16}px)` };
    case "type":
    case "draw":
    case "count":
      return { opacity: p > 0 ? 1 : 0, transform: "none" };
  }
}

export function exitStyle(
  name: ExitPreset,
  p: number,
  opts: { reduced?: boolean } = {}
): StyleFrag {
  const reduced = opts.reduced ?? false;
  switch (name) {
    case "sink":
      return { opacity: 1 - p, transform: reduced ? "none" : `translateY(${-16 * p}px)` };
    case "lift":
      return { opacity: 1 - p, transform: reduced ? "none" : `scale(${(1 + 0.02 * p).toFixed(4)})` };
    case "dissolve":
      return { opacity: 1 - p, transform: "none" };
    case "cut":
      return { opacity: p < 1 ? 1 : 0, transform: "none" };
  }
}

// ─── Helpers for the value-carrying presets ──────────────────────────────────

/** `type`: how many characters of `total` are revealed at eased progress `p`. */
export const typewriterChars = (p: number, total: number) => Math.round(p * total);

/** `draw`: stroke-dashoffset for an SVG path of length `len` at progress `p`. */
export const drawDashoffset = (p: number, len: number) => (1 - p) * len;

/** `count`: tween a metric from `from`→`to` at eased progress `p`. */
export const countValue = (p: number, to: number, from = 0) => from + (to - from) * p;

/** `stagger`: per-child delay (in frames) for index `i`. */
export const staggerDelay = (i: number, step = 4) => i * step;
