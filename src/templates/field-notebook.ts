import type { TemplateStyle } from "./types";

/**
 * FIELD-NOTEBOOK — the current Cadence look, extracted into the styling layer.
 *
 * Every literal below is read **verbatim** from the live components (Stage 1a),
 * so render output is byte-identical: each value here is the same number / hex /
 * px / shadow string the component used inline, now sourced through `STYLES` /
 * `MOTION` / `resolveRole`. The component picks *which* color role; the theme
 * owns the actual token.
 */
export const fieldNotebook: TemplateStyle = {
  name: "field-notebook",
  description: "The current Cadence look — warm paper surfaces, gold eyebrows, near-white headlines.",
  theme: "default",
  styles: {
    headline: {
      // `H` per-format type scale — verbatim from Headline.tsx.
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
      surface: "rgba(252,251,247,0.95)",
      border: "rgba(255,255,255,0.6)",
      radius: 18, // RADIUS.xl (10) + 8
      shadowRole: "float",
      headerPadding: "20px 26px",
      headerHairlineRole: "hairline",
      bodyFontRole: "mono",
      // Generic panel-title literals are not used by a shared title element;
      // every panel sets its own header sizes (captured per-kind below). These
      // carry the most common header values for forward use.
      titleSize: 19,
      titleWeight: 600,
      byKind: {
        // Feed.tsx
        feed: {
          headerGap: 12,
          titleSize: 19,
          titleWeight: 600,
          subtitleSize: 17,
          statusDot: { size: 10, opacityBase: 0.4, opacityPulse: 0.6 },
          statusSize: 18,
          statusColor: "#16a34a",
          body: { padding: "10px 12px 16px" },
          row: {
            padding: "15px 18px",
            margin: "4px 0",
            radiusRole: "md",
            zebra: "rgba(0,0,0,0.035)",
            gap: 14,
            badgeSize: 13,
            badgeWeight: 700,
            badgePadding: "4px 9px",
            badgeRadiusBase: "sm",
            badgeRadiusPlus: 4,
            badgeTracking: 0.3,
            labelColor: "rgba(0,0,0,0.7)",
            labelSize: 19,
            valueSize: 19,
            valueWeight: 600,
          },
        },
        // UploadProgress.tsx
        "upload-progress": {
          titleSize: 19,
          titleWeight: 600,
          pill: {
            fontSize: 14,
            fontWeight: 600,
            color: "#c2410c",
            background: "rgba(194,65,12,0.10)",
            padding: "5px 11px",
            radiusRole: "full",
          },
          body: { padding: "26px" },
          pctRow: { marginBottom: 16 },
          pctSize: 40,
          pctWeight: 700,
          metaSize: 17,
          bar: { height: 10, radiusRole: "full", track: "rgba(0,0,0,0.08)" },
          btnRow: { gap: 14, marginTop: 22 },
          btn: {
            padding: "12px",
            radiusRole: "md",
            fontSize: 17,
            fontWeight: 600,
            color: "#c2410c",
            background: "rgba(194,65,12,0.10)",
            borderColor: "rgba(194,65,12,0.25)",
          },
        },
        // DataTable.tsx
        "data-table": {
          body: { padding: "22px 26px" },
          titleSize: 18,
          titleWeight: 600,
          titleMarginBottom: 16,
          columnGap: 18,
          header: { fontSize: 13, tracking: "0.06em", paddingBottom: 12 },
          cell: { fontSize: 18, padding: "14px 0", color: "rgba(0,0,0,0.7)" },
        },
        // Status.tsx
        status: {
          titleSize: 19,
          titleWeight: 600,
          body: { padding: "12px 26px 22px" },
          rowPadding: "14px 0",
          rowGap: 12,
          dot: { size: 9 },
          nameSize: 18,
          badge: { fontSize: 13, tracking: "0.05em", padding: "3px 8px", radiusRole: "sm", bgAlphaHex: "1f" },
          // STATE_COLOR role mapping (state → color role / token).
          stateColor: { ok: "successGreen", syncing: "infoBlue", error: "dangerRed", idle: "textMuted" },
        },
        // Proof.tsx
        proof: {
          headerTitleSize: 18,
          headerTitleWeight: 600,
          headerPill: { fontSize: 13, fontWeight: 600, padding: "4px 10px", radiusRole: "full", tracking: "0.02em" },
          body: { padding: "22px 26px" },
          eventLineSize: 19,
          cursorSize: 16,
          divider: { height: 1, margin: "18px 0" },
          sigLabel: { fontSize: 11, fontWeight: 600, tracking: "0.08em" },
          sig: { minHeight: 56, marginTop: 8, fontSize: 18, lineHeight: "28px", tracking: "0.04em" },
          keyLine: { marginTop: 6, fontSize: 15 },
          verifyRow: { gap: 10, marginTop: 18, height: 26 },
          check: { box: 26, circleR: 11, circleStroke: 1.5, circleOpacity: 0.35, pathStroke: 2.2, len: 26 },
          verifiedSize: 17,
          verifiedWeight: 600,
        },
        // StreamResume.tsx
        "stream-resume": {
          headerTitleSize: 18,
          headerTitleWeight: 600,
          headerMetaSize: 14,
          body: { padding: "20px 26px 22px" },
          markerLabelSize: 14,
          markerGap: 12,
          chip: { fontSize: 19, fontWeight: 700, padding: "5px 12px", radiusRole: "md", tracking: "0.02em" },
          dividerMargin: "16px 0 6px",
          row: { gap: 16, padding: "12px 4px", cursorSize: 15, cursorMinWidth: 96, labelSize: 18 },
        },
        // Fork.tsx
        fork: {
          headerTitleSize: 18,
          headerTitleWeight: 600,
          headerMetaSize: 14,
          body: { padding: "24px 26px" },
          chip: { fontSize: 16, padding: "7px 12px", radiusRole: "md", orphanOpacity: 0.6 },
          chainGap: 10,
          forkRow: { gap: 12, marginTop: 16 },
          archivedBadge: { fontSize: 11, fontWeight: 600, tracking: "0.06em", padding: "3px 8px", radiusRole: "sm" },
          note: { marginTop: 18, fontSize: 22 },
        },
        // Stat.tsx
        stat: {
          body: { padding: "52px 56px" },
          value: { fontSize: 100, fontWeight: 600, tracking: "-0.03em", lineHeight: 1 },
          label: { fontSize: 24, marginTop: 14 },
          sub: { fontSize: 28, marginTop: 10 },
        },
        // Diagram.tsx
        diagram: {
          surface: "rgba(252,251,247,0.95)",
          geom: { W: 620, H: 240, NW: 132, NH: 62 },
          svgPadding: "8px",
          edge: { strokeWidth: 1.5, labelOffset: 8, labelSize: 11 },
          nodeRx: 8,
          nodeStroke: 1.5,
          nodeLabel: { fontSize: 15, fontWeight: 600, yOffset: 5 },
          // role mappings per node type for fill / stroke / text.
          nodeFill: { default: "chrome", data: "signalBlueSoft", api: "signalBlue" },
          nodeStrokeColor: { default: "hairline", data: "signalBlueBorder", api: "signalBlue" },
          nodeText: { default: "ink", data: "signalBlue", api: "paper" },
          note: { padding: "0 22px 16px", fontSize: 22 },
        },
        // Browser.tsx
        browser: {
          headerGap: 10,
          headerTitleSize: 17,
          headerTitleWeight: 600,
          headerMetaSize: 13,
          body: { padding: "6px 0 14px" },
          sectionLabel: { fontSize: 12, fontWeight: 600, tracking: "0.08em", padding: "14px 26px 6px" },
          row: { gap: 12, padding: "11px 26px", fontSize: 18, metaSize: 15 },
        },
      },
    },
    badge: {
      // ChangelogScene footer pill — fontSize is per-format (isWide ? 14 : 12)
      // and resolved at render; this is the wide value.
      size: 14,
      track: "0.08em",
      radius: 999,
      bgRole: "goldSoft",
      fgRole: "gold",
    },
    caption: {
      // ChangelogScene footer caption — sizes are per-format (isWide ? 21 : 18).
      footerSize: 21,
      subheadSize: 18,
      weight: 500,
      colorRole: "textMuted",
    },
    radius: { sm: 3, md: 6, lg: 8, xl: 10, full: 999 },
  },
  layout: {
    // Region geometry is extracted in Stage 1b; the legacy `LAYOUT` map still
    // lives in ChangelogScene for now (spec §3, Stage 1a is styling-only).
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
    cardEnter: { enter: "settle", delay: 12 }, // CARD_ENTER from useMotion.ts
    defaultEnter: "rise",
    defaultEasing: "smooth",
    enterDistance: 24,
    ease: {
      smooth: [0.19, 1, 0.22, 1], // EASE.smooth bezier
      snappy: [0.175, 0.885, 0.32, 1.1], // EASE.snappy bezier
    },
  },
  backgrounds: { default: { shapes: true } },
};
