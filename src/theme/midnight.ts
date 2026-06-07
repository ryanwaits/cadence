import type { ThemeConfig } from "./types";

/**
 * MIDNIGHT — a dark terminal/IDE theme (GitHub-dark / Vercel-dark lineage).
 *
 * Built to back the `terminal` template: near-black paper (#0d1117), light ink
 * (#e6edf3), and a terminal-green accent. Because component text colors resolve
 * through `resolveRole(role)` against the ACTIVE theme, every role the templates
 * pick (ink, paper, titleWhite, hairline, textMuted, …) must read legibly on
 * dark — so the neutrals are inverted relative to the light themes: `paper` is
 * the dark canvas, `ink`/`titleWhite` are light, and `hairline`/`chrome` are
 * subtle light-on-dark separators. The code surface + syntax palette are a
 * dark-native scheme (one-dark-ish), and shadows are deep/diffuse so floating
 * cards still read against the dark backdrop.
 */
export const midnightTheme: ThemeConfig = {
  name: "midnight",
  fonts: {
    display: "Geist, ui-sans-serif, system-ui, sans-serif",
    body: "Geist, ui-sans-serif, system-ui, sans-serif",
    mono: "Geist Mono, JetBrains Mono, SFMono-Regular, Menlo, monospace",
    note: "Caveat, cursive",
  },
  colors: {
    // Inverted neutrals: light text on a dark canvas.
    ink: "#e6edf3",
    paper: "#0d1117",
    paperElevated: "#161b22",
    chrome: "#1c2128",
    hairline: "rgba(240,246,252,0.10)",
    hairlineHover: "rgba(240,246,252,0.18)",
    textMuted: "rgba(230,237,243,0.62)",
    textDim: "rgba(230,237,243,0.14)",
    // Terminal-green accent (the one pointing color).
    signalBlue: "#3fb950",
    signalBlueSoft: "rgba(63,185,80,0.14)",
    signalBlueBorder: "rgba(63,185,80,0.40)",
    // Human-flourish marker — cyan reads well on dark.
    markerPink: "#39d3c8",
    // Version / NEW marker — a warm amber pops on dark.
    gold: "#e3b341",
    goldSoft: "rgba(227,179,65,0.18)",
    // Headlines over imagery — slightly cooler near-white.
    titleWhite: "#f0f6fc",
    successGreen: "#3fb950",
    warningYellow: "#d29922",
    dangerRed: "#f85149",
    infoBlue: "#58a6ff",
    accentTeal: "#39c5cf",
  },
  // Deep, diffuse shadow so floating cards separate from the dark backdrop.
  floatShadow: "0 30px 80px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.40)",
  // Dark code surface + matching caret.
  codeBg: "#161b22",
  caretBg: "rgba(230,237,243,0.92)",
  // Dark-native syntax palette (one-dark / github-dark lineage).
  codeTheme: {
    fg: "#c9d1d9",
    kw: "#ff7b72",
    nw: "#d2a8ff",
    str: "#a5d6ff",
    num: "#79c0ff",
    fn: "#d2a8ff",
    punct: "#8b949e",
    comment: "#6e7681",
  },
  // Dark procedural backdrop — two near-black blues for the "shapes" gradient.
  backdrop: ["#0b0f16", "#11161f"],
};
