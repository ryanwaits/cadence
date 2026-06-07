import type { TemplateStyle } from "./types";

/**
 * TERMINAL — a dark, monospace-forward IDE/terminal aesthetic (Vercel-dark /
 * GitHub-dark lineage). Binds to the `midnight` theme so the role-resolved text
 * colors land light-on-dark.
 *
 * Distinct from field-notebook by GEOMETRY + WEIGHT, not just color:
 * - Tighter, sharper corners (smaller radius scale; panels are crisp not pillowy).
 * - Denser panels (smaller header padding, tighter body padding, smaller chips).
 * - Slightly smaller, tighter headline scale with heavier weight + negative track.
 * - Terminal-green accents (green/cyan dots, green badge pill) carried by the
 *   midnight theme's roles.
 * - Snappy default easing (terminals feel mechanical, not floaty).
 *
 * This is the SAME field shape as field-notebook (every `byKind` key for all 10
 * panels, every `layout.regions`/`bands` per format) with different VALUES.
 */
export const terminal: TemplateStyle = {
  name: "terminal",
  description: "Dark monospace IDE/terminal look — sharp corners, dense panels, terminal-green accents. Binds to the midnight theme.",
  theme: "midnight",
  styles: {
    headline: {
      // Slightly smaller + tighter than field-notebook; mono-grotesk technical feel.
      scale: {
        "16x9": { top: "12%", size: 66, eyebrow: 14, track: 0.22, max: "72%" },
        "1x1": { top: "6%", size: 42, eyebrow: 12, track: 0.2, max: "88%" },
        "9x16": { top: "8%", size: 50, eyebrow: 13, track: 0.2, max: "88%" },
      },
      headlineWeight: 650,
      headlineTracking: "-0.03em",
      headlineLineHeight: 1.02,
      eyebrowWeight: 600,
      eyebrowUppercase: true,
      subheadScale: 0.3,
      subheadWeight: 500,
      noteScale: 0.46,
      // Tighter, lower-spread shadows — crisp on dark, no warm halo.
      shadows: {
        headline: "0 0 1px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.5), 0 6px 24px rgba(0,0,0,0.45)",
        headlineLight: "0 1px 2px rgba(0,0,0,0.5)",
        eyebrow: "0 0 1px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.45)",
        subhead: "0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.35)",
      },
      eyebrowColor: "gold",
      headlineColor: "titleWhite",
      headlineLightColor: "ink",
      subheadColor: "titleWhite",
      noteColor: "markerPink",
    },
    panel: {
      // Dark elevated surface, subtle light hairline, sharp corners.
      surface: "rgba(22,27,34,0.96)",
      border: "rgba(240,246,252,0.12)",
      radius: 8, // sharp — vs field-notebook's 18
      shadowRole: "float",
      headerPadding: "14px 20px", // denser
      headerHairlineRole: "hairline",
      bodyFontRole: "mono",
      titleSize: 18,
      titleWeight: 600,
      byKind: {
        // Feed.tsx
        feed: {
          headerGap: 10,
          titleSize: 18,
          titleWeight: 600,
          subtitleSize: 16,
          statusDot: { size: 9, opacityBase: 0.45, opacityPulse: 0.55 },
          statusSize: 16,
          statusColor: "#3fb950",
          body: { padding: "8px 10px 12px" },
          row: {
            padding: "12px 14px",
            margin: "3px 0",
            radiusRole: "sm",
            zebra: "rgba(240,246,252,0.04)",
            gap: 12,
            badgeSize: 12,
            badgeWeight: 700,
            badgePadding: "3px 8px",
            badgeRadiusBase: "sm",
            badgeRadiusPlus: 2,
            badgeTracking: 0.4,
            labelColor: "rgba(230,237,243,0.72)",
            labelSize: 18,
            valueSize: 18,
            valueWeight: 600,
          },
        },
        // UploadProgress.tsx
        "upload-progress": {
          titleSize: 18,
          titleWeight: 600,
          pill: {
            fontSize: 13,
            fontWeight: 600,
            color: "#e3b341",
            background: "rgba(227,179,65,0.16)",
            padding: "4px 10px",
            radiusRole: "full",
          },
          body: { padding: "22px" },
          pctRow: { marginBottom: 14 },
          pctSize: 38,
          pctWeight: 700,
          metaSize: 16,
          bar: { height: 8, radiusRole: "full", track: "rgba(240,246,252,0.10)" },
          btnRow: { gap: 12, marginTop: 20 },
          btn: {
            padding: "10px",
            radiusRole: "sm",
            fontSize: 16,
            fontWeight: 600,
            color: "#e3b341",
            background: "rgba(227,179,65,0.14)",
            borderColor: "rgba(227,179,65,0.30)",
          },
        },
        // DataTable.tsx
        "data-table": {
          body: { padding: "18px 22px" },
          titleSize: 17,
          titleWeight: 600,
          titleMarginBottom: 14,
          columnGap: 16,
          header: { fontSize: 12, tracking: "0.08em", paddingBottom: 10 },
          cell: { fontSize: 17, padding: "12px 0", color: "rgba(230,237,243,0.72)" },
        },
        // Status.tsx
        status: {
          titleSize: 18,
          titleWeight: 600,
          body: { padding: "10px 22px 18px" },
          rowPadding: "12px 0",
          rowGap: 11,
          dot: { size: 8 },
          nameSize: 17,
          badge: { fontSize: 12, tracking: "0.06em", padding: "2px 7px", radiusRole: "sm", bgAlphaHex: "26" },
          stateColor: { ok: "successGreen", syncing: "infoBlue", error: "dangerRed", idle: "textMuted" },
        },
        // Proof.tsx
        proof: {
          headerTitleSize: 17,
          headerTitleWeight: 600,
          headerPill: { fontSize: 12, fontWeight: 600, padding: "3px 9px", radiusRole: "full", tracking: "0.03em" },
          body: { padding: "18px 22px" },
          eventLineSize: 18,
          cursorSize: 15,
          divider: { height: 1, margin: "16px 0" },
          sigLabel: { fontSize: 10, fontWeight: 600, tracking: "0.1em" },
          sig: { minHeight: 52, marginTop: 8, fontSize: 17, lineHeight: "26px", tracking: "0.05em" },
          keyLine: { marginTop: 6, fontSize: 14 },
          verifyRow: { gap: 9, marginTop: 16, height: 24 },
          check: { box: 24, circleR: 10, circleStroke: 1.5, circleOpacity: 0.4, pathStroke: 2.2, len: 24 },
          verifiedSize: 16,
          verifiedWeight: 600,
        },
        // StreamResume.tsx
        "stream-resume": {
          headerTitleSize: 17,
          headerTitleWeight: 600,
          headerMetaSize: 13,
          body: { padding: "18px 22px 20px" },
          markerLabelSize: 13,
          markerGap: 11,
          chip: { fontSize: 18, fontWeight: 700, padding: "4px 11px", radiusRole: "sm", tracking: "0.03em" },
          dividerMargin: "14px 0 6px",
          row: { gap: 14, padding: "11px 4px", cursorSize: 14, cursorMinWidth: 90, labelSize: 17 },
        },
        // Fork.tsx
        fork: {
          headerTitleSize: 17,
          headerTitleWeight: 600,
          headerMetaSize: 13,
          body: { padding: "20px 22px" },
          chip: { fontSize: 15, padding: "6px 11px", radiusRole: "sm", orphanOpacity: 0.6 },
          chainGap: 9,
          forkRow: { gap: 11, marginTop: 14 },
          archivedBadge: { fontSize: 10, fontWeight: 600, tracking: "0.07em", padding: "2px 7px", radiusRole: "sm" },
          note: { marginTop: 16, fontSize: 20 },
        },
        // Stat.tsx
        stat: {
          body: { padding: "46px 50px" },
          value: { fontSize: 96, fontWeight: 650, tracking: "-0.04em", lineHeight: 1 },
          label: { fontSize: 22, marginTop: 12 },
          sub: { fontSize: 26, marginTop: 9 },
        },
        // Diagram.tsx
        diagram: {
          surface: "rgba(22,27,34,0.96)",
          geom: { W: 620, H: 240, NW: 132, NH: 62 },
          svgPadding: "8px",
          edge: { strokeWidth: 1.5, labelOffset: 8, labelSize: 11 },
          nodeRx: 6,
          nodeStroke: 1.5,
          nodeLabel: { fontSize: 15, fontWeight: 600, yOffset: 5 },
          nodeFill: { default: "chrome", data: "signalBlueSoft", api: "signalBlue" },
          nodeStrokeColor: { default: "hairline", data: "signalBlueBorder", api: "signalBlue" },
          nodeText: { default: "ink", data: "signalBlue", api: "paper" },
          note: { padding: "0 22px 16px", fontSize: 20 },
        },
        // Browser.tsx
        browser: {
          headerGap: 9,
          headerTitleSize: 16,
          headerTitleWeight: 600,
          headerMetaSize: 12,
          body: { padding: "6px 0 12px" },
          sectionLabel: { fontSize: 11, fontWeight: 600, tracking: "0.1em", padding: "12px 22px 6px" },
          row: { gap: 11, padding: "10px 22px", fontSize: 17, metaSize: 14 },
        },
      },
    },
    badge: {
      size: 13,
      track: "0.1em",
      radius: 6, // sharper pill
      bgRole: "goldSoft",
      fgRole: "gold",
    },
    caption: {
      footerSize: 20,
      subheadSize: 17,
      weight: 500,
      colorRole: "textMuted",
    },
    // Tighter, sharper radius scale than field-notebook.
    radius: { sm: 2, md: 4, lg: 6, xl: 8, full: 999 },
  },
  layout: {
    // Denser band geometry than field-notebook — tighter gaps + padding.
    regions: {
      "16x9": {
        lead: { top: "30%", bottom: "6%", dir: "row", gap: 48, pad: "0 100px" },
        footer: { bottom: "7%" },
      },
      "1x1": {
        lead: { top: "29%", bottom: "6%", dir: "column", gap: 20, pad: "0 6%" },
        footer: { bottom: "7%" },
      },
      "9x16": {
        lead: { top: "23%", bottom: "6%", dir: "column", gap: 26, pad: "0 6%" },
        footer: { bottom: "7%" },
      },
    },
    bands: {
      "16x9": { codeFont: 23, codeMax: 820, itemMax: 800, panelW: 620, panelMax: 620 },
      "1x1": { codeFont: 16, codeMax: 940, itemMax: 940, panelW: "100%", panelMax: 620 },
      "9x16": { codeFont: 20, codeMax: 940, itemMax: 940, panelW: "100%", panelMax: 620 },
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
    variants: { hero: { lead: { top: "0", bottom: "0" } } },
  },
  motion: {
    // Cards still settle in, but the default easing is snappy (mechanical feel).
    cardEnter: { enter: "settle", delay: 10 },
    defaultEnter: "rise",
    defaultEasing: "snappy",
    enterDistance: 20,
    ease: {
      smooth: [0.19, 1, 0.22, 1],
      snappy: [0.175, 0.885, 0.32, 1.1],
    },
  },
  backgrounds: { default: { shapes: true } },
};
