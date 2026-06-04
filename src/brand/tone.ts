import type { Beat } from "../schema/beats";

/** Relative luminance (0-1) of a hex color; non-hex → 0. */
const lum = (hex: string): number => {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length < 6) return 0;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Is the beat's backdrop light enough that overlaid text should be dark? The
 * procedural default (`shapes` / no background) is always light; gradients/solids
 * are judged by luminance; the image pack is assumed dark (keep the light-text +
 * shadow treatment the paintings were designed for).
 */
export function isLightBackdrop(bg: Beat["background"]): boolean {
  if (!bg || bg.shapes) return true;
  if (bg.solid) return lum(bg.solid) > 0.6;
  if (bg.gradient) return (lum(bg.gradient[0]) + lum(bg.gradient[1])) / 2 > 0.55;
  return false;
}
