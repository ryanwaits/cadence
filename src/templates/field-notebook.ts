import type { TemplateStyle } from "./types";

/**
 * FIELD-NOTEBOOK — the current Cadence look, extracted into the styling layer.
 *
 * values filled verbatim from components in Stage 1a — provisional here.
 *
 * This is a COMPILING shell: the shape is the contract (a complete
 * `TemplateStyle`), but every literal below is a best-guess placeholder lifted
 * loosely from the live components. Stage 1a does the byte-exact extraction
 * (move literal X out of the component, read it back through `STYLES`/`MOTION`/
 * `resolveRole`) — until then nothing consumes these values, so they cannot
 * affect any rendered output.
 */
export const fieldNotebook: TemplateStyle = {
  name: "field-notebook",
  description: "The current Cadence look — warm paper surfaces, gold eyebrows, near-white headlines.",
  theme: "default",
  styles: {
    headline: {
      // provisional — verbatim `H` map extraction happens in Stage 1a.
      scale: {
        "16x9": { top: "13%", size: 72, eyebrow: 15, track: 0.18, max: "70%" },
        "1x1": { top: "6%", size: 44, eyebrow: 13, track: 0.16, max: "86%" },
        "9x16": { top: "8%", size: 52, eyebrow: 14, track: 0.16, max: "86%" },
      },
      headlineWeight: 700,
      headlineTracking: "-0.025em",
      headlineLineHeight: 1.0,
      eyebrowWeight: 600,
      eyebrowUppercase: true,
      subheadScale: 0.32,
      subheadWeight: 500,
      noteScale: 0.5,
      shadows: {
        headline:
          "0 0 1px rgba(30,41,59,0.33), 0 0 4px rgba(30,41,59,0.28), 0 0 16px rgba(30,41,59,0.24), 0 2px 8px rgba(30,41,59,0.28), 0 10px 44px rgba(30,41,59,0.22)",
        headlineLight: "0 1px 2px rgba(255,255,255,0.6)",
        eyebrow: "0 0 1px rgba(30,41,59,0.35), 0 0 7px rgba(30,41,59,0.28), 0 1px 3px rgba(30,41,59,0.25)",
        subhead: "0 0 2px rgba(30,41,59,0.28), 0 0 11px rgba(30,41,59,0.22), 0 2px 8px rgba(30,41,59,0.24)",
      },
      eyebrowColor: "gold",
      headlineColor: "titleWhite",
      headlineLightColor: "ink",
      subheadColor: "titleWhite",
      noteColor: "markerPink",
    },
    panel: {
      // provisional — PanelCard / panels/*.tsx literals extracted in Stage 1a.
      surface: "rgba(252,251,247,0.95)",
      border: "rgba(255,255,255,0.6)",
      radius: 18, // RADIUS.xl (10) + 8
      shadowRole: "float",
      headerPadding: "20px 26px",
      headerHairlineRole: "hairline",
      bodyFontRole: "mono",
      titleSize: 15,
      titleWeight: 600,
      byKind: {
        feed: {},
        "upload-progress": {},
        "data-table": {},
        status: {},
        proof: {},
        "stream-resume": {},
        fork: {},
        stat: {},
        diagram: {},
        browser: {},
      },
    },
    badge: {
      // provisional — footer pill literals from ChangelogScene extracted in Stage 1a.
      size: 13,
      track: "0.04em",
      radius: 999,
      bgRole: "goldSoft",
      fgRole: "gold",
    },
    caption: {
      // provisional — footer/subhead caption literals extracted in Stage 1a.
      footerSize: 18,
      subheadSize: 23,
      weight: 500,
      colorRole: "textMuted",
    },
    radius: { sm: 3, md: 6, lg: 8, xl: 10, full: 999 },
  },
  layout: {
    // provisional — LAYOUT map + per-format geometry extracted in Stage 1a.
    regions: {
      "16x9": {},
      "1x1": {},
      "9x16": {},
    },
    defaultRegion: {
      title: "lead",
      eyebrow: "header",
      note: "lead",
      caption: "footer",
      badge: "footer",
      code: "lead",
      panel: "trailing",
    },
    defaultSize: {
      code: "fill",
      panel: "md",
    },
    variants: { hero: {} },
  },
  motion: {
    // provisional — useMotion CARD_ENTER + brand EASE extracted in Stage 1a.
    cardEnter: { enter: "settle", delay: 12 },
    defaultEnter: "rise",
    defaultEasing: "smooth",
    enterDistance: 24,
    ease: {
      smooth: [0.19, 1, 0.22, 1],
      snappy: [0.175, 0.885, 0.32, 1.1],
    },
  },
  backgrounds: { default: { shapes: true } },
};
