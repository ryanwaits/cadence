import type { ThemeConfig } from "./types";

/** The default theme — warm tinted-neutrals, blue accent, gold version marker. */
export const defaultTheme: ThemeConfig = {
  name: "default",
  fonts: {
    display: "Sora, ui-sans-serif, system-ui, sans-serif",
    body: "Public Sans, ui-sans-serif, system-ui, sans-serif",
    mono: "Fira Code, SFMono-Regular, Menlo, monospace",
    note: "Caveat, cursive",
  },
  colors: {
    ink: "#111111",
    paper: "#fafafa",
    paperElevated: "#ffffff",
    chrome: "#f0f0f0",
    hairline: "#e5e5e5",
    hairlineHover: "#dddddd",
    textMuted: "rgba(0,0,0,0.65)",
    textDim: "rgba(0,0,0,0.12)",
    signalBlue: "#2563eb",
    signalBlueSoft: "rgba(37,99,235,0.10)",
    signalBlueBorder: "rgba(37,99,235,0.33)",
    markerPink: "#ff00aa",
    gold: "#c08a2e",
    goldSoft: "rgba(192,138,46,0.16)",
    titleWhite: "#f7f6f2",
    successGreen: "#22c55e",
    warningYellow: "#eab308",
    dangerRed: "#ef4444",
    infoBlue: "#3b82f6",
    accentTeal: "#1588b2",
  },
  floatShadow: "0 30px 80px rgba(30,41,59,0.28), 0 2px 6px rgba(30,41,59,0.12)",
  codeBg: "#f7f5ee",
  caretBg: "rgba(252,249,242,0.95)",
  codeTheme: { fg: "#1f2937", kw: "#0e9488", nw: "#8250df", str: "#c2410c", num: "#7c3aed", fn: "#2563eb", punct: "#5b6470", comment: "#9aa0a6" },
  backdrop: ["#e6edff", "#f8faff"],
};
