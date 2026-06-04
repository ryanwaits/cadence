import type { ThemeConfig } from "./types";

/** A cooler contrasting theme — slate neutrals, indigo accent, copper marker. */
export const slateTheme: ThemeConfig = {
  name: "slate",
  fonts: {
    display: "Inter, ui-sans-serif, system-ui, sans-serif",
    body: "Inter, ui-sans-serif, system-ui, sans-serif",
    mono: "JetBrains Mono, SFMono-Regular, Menlo, monospace",
    note: "Caveat, cursive",
  },
  colors: {
    ink: "#0f172a",
    paper: "#f6f7f9",
    paperElevated: "#ffffff",
    chrome: "#eef1f4",
    hairline: "#e2e8f0",
    hairlineHover: "#cbd5e1",
    textMuted: "rgba(15,23,42,0.62)",
    textDim: "rgba(15,23,42,0.12)",
    signalBlue: "#4f46e5",
    signalBlueSoft: "rgba(79,70,229,0.10)",
    signalBlueBorder: "rgba(79,70,229,0.30)",
    markerPink: "#e11d8f",
    gold: "#b5762a",
    goldSoft: "rgba(181,118,42,0.16)",
    titleWhite: "#f8fafc",
    successGreen: "#16a34a",
    warningYellow: "#d97706",
    dangerRed: "#dc2626",
    infoBlue: "#4f46e5",
    accentTeal: "#0e7490",
  },
  floatShadow: "0 30px 80px rgba(15,23,42,0.30), 0 2px 6px rgba(15,23,42,0.14)",
  codeBg: "#f4f6f8",
  caretBg: "rgba(248,250,252,0.95)",
  codeTheme: { fg: "#0f172a", kw: "#0891b2", nw: "#7c3aed", str: "#b45309", num: "#9333ea", fn: "#4f46e5", punct: "#64748b", comment: "#94a3b8" },
  backdrop: ["#eceafd", "#f7f8fc"],
};
