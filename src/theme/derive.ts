import { defaultTheme } from "./default";
import type { CodeTheme, ThemeConfig, ThemeFonts } from "./types";

/** "#abc" | "#aabbcc" → {r,g,b}. */
function parseHex(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
const rgba = (hex: string, a: number) => {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r},${g},${b},${a})`;
};

/** hex → HSL (h 0-360, s/l 0-100). */
function hexToHsl(hex: string): [number, number, number] {
  const { r, g, b } = parseHex(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn), d = mx - mn;
  const l = (mx + mn) / 2;
  let h = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (mx === rn) h = ((gn - bn) / d) % 6;
    else if (mx === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}
/** HSL → hex. */
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/**
 * A readable syntax palette tied to the accent: keywords sit at the accent's
 * complement, functions take the accent, numbers a violet rotation, strings a
 * fixed warm tone (kept independent so they never clash). Punctuation/comments
 * are low-saturation grays carrying a hint of the accent hue.
 */
function deriveCodeTheme(accent: string): CodeTheme {
  const [h] = hexToHsl(accent);
  return {
    fg: hslToHex(h, 16, 20),
    kw: hslToHex(h + 165, 62, 40),
    nw: hslToHex(h + 90, 55, 46),
    str: hslToHex(28, 72, 42),
    num: hslToHex(h + 270, 60, 50),
    fn: hslToHex(h, 70, 46),
    punct: hslToHex(h, 10, 42),
    comment: hslToHex(h, 8, 62),
  };
}

/** Light [from, to] gradient (pale tints of the accent) for the procedural backdrop. */
function deriveBackdrop(accent: string): [string, string] {
  const [h] = hexToHsl(accent);
  return [hslToHex(h, 58, 90), hslToHex(h + 14, 42, 97)];
}

/**
 * Derive a full ThemeConfig from a brand accent (+ optional neutrals/fonts). The
 * accent drives links/badges/the one pointing color, a matching code palette, and
 * the default backdrop. This is brand extraction's output (and the base every
 * named library theme is minted from) — give one color, get a complete theme.
 */
export function deriveTheme(opts: {
  name?: string;
  accent: string;
  ink?: string;
  paper?: string;
  gold?: string;
  markerPink?: string;
  fonts?: ThemeFonts;
}): ThemeConfig {
  const base = defaultTheme;
  const ink = opts.ink ?? base.colors.ink;
  const paper = opts.paper ?? base.colors.paper;
  return {
    name: opts.name ?? "brand",
    fonts: opts.fonts ?? base.fonts,
    colors: {
      ...base.colors,
      ink,
      paper,
      paperElevated: "#ffffff",
      textMuted: rgba(ink, 0.65),
      textDim: rgba(ink, 0.12),
      signalBlue: opts.accent,
      signalBlueSoft: rgba(opts.accent, 0.1),
      signalBlueBorder: rgba(opts.accent, 0.3),
      infoBlue: opts.accent,
      markerPink: opts.markerPink ?? base.colors.markerPink,
      gold: opts.gold ?? base.colors.gold,
      goldSoft: rgba(opts.gold ?? base.colors.gold, 0.16),
    },
    floatShadow: base.floatShadow,
    codeBg: base.codeBg,
    caretBg: base.caretBg,
    codeTheme: deriveCodeTheme(opts.accent),
    backdrop: deriveBackdrop(opts.accent),
  };
}
