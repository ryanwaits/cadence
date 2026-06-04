import { deriveTheme } from "./derive";
import type { ThemeConfig } from "./types";

/**
 * The named theme library. Each is minted from one accent via `deriveTheme`
 * (which generates a matching code palette + backdrop), with per-theme fonts and
 * optional neutral/marker overrides. `default` and `slate` stay hand-authored in
 * their own files; everything here is registered alongside them in `index.ts`.
 */
const S = (f: string) => `${f}, ui-sans-serif, system-ui, sans-serif`;
const M = (f: string) => `${f}, SFMono-Regular, Menlo, monospace`;
const R = (f: string) => `${f}, Georgia, "Times New Roman", serif`;
const NOTE = "Caveat, cursive";

type Spec = {
  accent: string;
  ink?: string;
  paper?: string;
  gold?: string;
  marker?: string;
  display: string;
  body: string;
  mono: string;
};

const COOL_INK = "#0f172a";

const SPECS: Record<string, Spec> = {
  cobalt: { accent: "#2f5fff", ink: COOL_INK, paper: "#f5f7fb", display: S("Manrope"), body: S("Manrope"), mono: M("JetBrains Mono") },
  emerald: { accent: "#10b981", display: S("Space Grotesk"), body: S("Inter"), mono: M("Fira Code") },
  amber: { accent: "#d97706", paper: "#fbf8f3", gold: "#b45309", display: S("Sora"), body: S("Public Sans"), mono: M("IBM Plex Mono") },
  crimson: { accent: "#e11d48", marker: "#0ea5e9", display: S("Archivo"), body: S("Inter"), mono: M("Space Mono") },
  violet: { accent: "#7c3aed", display: S("Plus Jakarta Sans"), body: S("Inter"), mono: M("JetBrains Mono") },
  teal: { accent: "#0d9488", paper: "#f3f8f7", display: S("Outfit"), body: S("Inter"), mono: M("Fira Code") },
  indigo: { accent: "#4338ca", ink: COOL_INK, display: S("Inter"), body: S("Inter"), mono: M("IBM Plex Mono") },
  sky: { accent: "#0ea5e9", paper: "#f4f9fc", display: S("Figtree"), body: S("Figtree"), mono: M("JetBrains Mono") },
  sunset: { accent: "#f97316", marker: "#7c3aed", display: S("Epilogue"), body: S("Inter"), mono: M("Fira Code") },
  rose: { accent: "#f43f5e", paper: "#fdf6f7", display: S("DM Sans"), body: S("DM Sans"), mono: M("Fira Code") },
  lime: { accent: "#65a30d", display: S("Space Grotesk"), body: S("Work Sans"), mono: M("Space Mono") },
  grape: { accent: "#9333ea", marker: "#22c55e", display: S("Manrope"), body: S("Inter"), mono: M("Space Mono") },
  forest: { accent: "#15803d", ink: "#14241b", paper: "#f4f7f3", display: R("Fraunces"), body: R("Spectral"), mono: M("JetBrains Mono") },
  editorial: { accent: "#9333ea", ink: "#1a1a1a", paper: "#fbfaf8", display: R("Playfair Display"), body: R("Spectral"), mono: M("IBM Plex Mono") },
  graphite: { accent: "#475569", ink: COOL_INK, paper: "#f6f7f8", marker: "#ef4444", display: S("Geist"), body: S("Geist"), mono: M("Geist Mono") },
  mono: { accent: "#111111", paper: "#f5f5f5", marker: "#2563eb", display: S("Geist"), body: S("Geist"), mono: M("Geist Mono") },
};

export const LIBRARY: Record<string, ThemeConfig> = Object.fromEntries(
  Object.entries(SPECS).map(([name, s]) => [
    name,
    deriveTheme({
      name,
      accent: s.accent,
      ink: s.ink,
      paper: s.paper,
      gold: s.gold,
      markerPink: s.marker,
      fonts: { display: s.display, body: s.body, mono: s.mono, note: NOTE },
    }),
  ]),
);
