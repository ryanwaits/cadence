import type { TemplateStyle } from "./types";

/**
 * INSTRUCTIONAL — a light, airy, editorial/educational explainer aesthetic
 * (Delba-style tutorial). Binds to the existing light `default` theme.
 *
 * Distinct from field-notebook by being SOFTER + LARGER + CALMER:
 * - Bigger, friendlier headline scale (lighter weight, looser line-height,
 *   gentler negative tracking) — type leads, not chrome.
 * - Generous whitespace: more region padding, larger band gaps, roomier panels.
 * - Softer, more rounded surfaces (larger radius scale, pillowy panels).
 * - Code de-emphasized: smaller `codeFont` per format so snippets sit quietly
 *   beside the prose.
 * - Annotation-forward: the handwritten note rides a touch larger.
 * - Gentler motion: longer card delay + a softer/slower `smooth` curve and a
 *   touch more travel, so things ease in rather than snap.
 *
 * SAME field shape as field-notebook (every `byKind` key for all 10 panels,
 * every `layout.regions`/`bands` per format) — only the VALUES change.
 */
export const instructional: TemplateStyle = {
  name: "instructional",
  description: "Light, airy editorial/tutorial look — big friendly headlines, generous whitespace, soft rounded surfaces, de-emphasized code. Binds to the default theme.",
  theme: "default",
  styles: {
    headline: {
      // Larger + friendlier than field-notebook; more breathing room up top.
      scale: {
        "16x9": { top: "15%", size: 80, eyebrow: 16, track: 0.14, max: "74%" },
        "1x1": { top: "7%", size: 50, eyebrow: 14, track: 0.13, max: "88%" },
        "9x16": { top: "10%", size: 58, eyebrow: 15, track: 0.13, max: "88%" },
      },
      headlineWeight: 620,
      headlineTracking: "-0.02em",
      headlineLineHeight: 1.08,
      eyebrowWeight: 600,
      eyebrowUppercase: true,
      subheadScale: 0.36,
      subheadWeight: 450,
      noteScale: 0.54,
      // Softer, lighter shadows — editorial, not dramatic.
      shadows: {
        headline:
          "0 0 1px rgba(30,41,59,0.22), 0 1px 4px rgba(30,41,59,0.16), 0 6px 28px rgba(30,41,59,0.14)",
        headlineLight: "0 1px 2px rgba(255,255,255,0.6)",
        eyebrow: "0 0 1px rgba(30,41,59,0.24), 0 1px 3px rgba(30,41,59,0.16)",
        subhead: "0 1px 5px rgba(30,41,59,0.14), 0 0 10px rgba(30,41,59,0.10)",
      },
      eyebrowColor: "gold",
      headlineColor: "titleWhite",
      headlineLightColor: "ink",
      subheadColor: "titleWhite",
      noteColor: "markerPink",
    },
    panel: {
      // Airier, more opaque paper with a softer border and roomy rounding.
      surface: "rgba(255,255,255,0.97)",
      border: "rgba(255,255,255,0.7)",
      radius: 24, // pillowy — vs field-notebook's 18
      shadowRole: "float",
      headerPadding: "24px 30px", // roomier
      headerHairlineRole: "hairline",
      bodyFontRole: "mono",
      titleSize: 20,
      titleWeight: 600,
      byKind: {
        // Feed.tsx
        feed: {
          headerGap: 14,
          titleSize: 20,
          titleWeight: 600,
          subtitleSize: 18,
          statusDot: { size: 11, opacityBase: 0.4, opacityPulse: 0.6 },
          statusSize: 19,
          statusColor: "#16a34a",
          body: { padding: "14px 16px 20px" },
          row: {
            padding: "18px 22px",
            margin: "6px 0",
            radiusRole: "lg",
            zebra: "rgba(0,0,0,0.025)",
            gap: 16,
            badgeSize: 14,
            badgeWeight: 700,
            badgePadding: "5px 11px",
            badgeRadiusBase: "md",
            badgeRadiusPlus: 6,
            badgeTracking: 0.3,
            labelColor: "rgba(0,0,0,0.68)",
            labelSize: 20,
            valueSize: 20,
            valueWeight: 600,
          },
        },
        // UploadProgress.tsx
        "upload-progress": {
          titleSize: 20,
          titleWeight: 600,
          pill: {
            fontSize: 15,
            fontWeight: 600,
            color: "#c2410c",
            background: "rgba(194,65,12,0.10)",
            padding: "6px 13px",
            radiusRole: "full",
          },
          body: { padding: "32px" },
          pctRow: { marginBottom: 18 },
          pctSize: 44,
          pctWeight: 700,
          metaSize: 18,
          bar: { height: 12, radiusRole: "full", track: "rgba(0,0,0,0.07)" },
          btnRow: { gap: 16, marginTop: 26 },
          btn: {
            padding: "14px",
            radiusRole: "lg",
            fontSize: 18,
            fontWeight: 600,
            color: "#c2410c",
            background: "rgba(194,65,12,0.10)",
            borderColor: "rgba(194,65,12,0.22)",
          },
        },
        // DataTable.tsx
        "data-table": {
          body: { padding: "28px 32px" },
          titleSize: 19,
          titleWeight: 600,
          titleMarginBottom: 20,
          columnGap: 22,
          header: { fontSize: 14, tracking: "0.05em", paddingBottom: 14 },
          cell: { fontSize: 19, padding: "16px 0", color: "rgba(0,0,0,0.68)" },
        },
        // Status.tsx
        status: {
          titleSize: 20,
          titleWeight: 600,
          body: { padding: "16px 32px 28px" },
          rowPadding: "16px 0",
          rowGap: 14,
          dot: { size: 10 },
          nameSize: 19,
          badge: { fontSize: 14, tracking: "0.04em", padding: "4px 10px", radiusRole: "md", bgAlphaHex: "1f" },
          stateColor: { ok: "successGreen", syncing: "infoBlue", error: "dangerRed", idle: "textMuted" },
        },
        // Proof.tsx
        proof: {
          headerTitleSize: 19,
          headerTitleWeight: 600,
          headerPill: { fontSize: 14, fontWeight: 600, padding: "5px 12px", radiusRole: "full", tracking: "0.02em" },
          body: { padding: "28px 32px" },
          eventLineSize: 20,
          cursorSize: 17,
          divider: { height: 1, margin: "22px 0" },
          sigLabel: { fontSize: 12, fontWeight: 600, tracking: "0.07em" },
          sig: { minHeight: 60, marginTop: 10, fontSize: 19, lineHeight: "30px", tracking: "0.04em" },
          keyLine: { marginTop: 8, fontSize: 16 },
          verifyRow: { gap: 12, marginTop: 22, height: 28 },
          check: { box: 28, circleR: 12, circleStroke: 1.5, circleOpacity: 0.35, pathStroke: 2.2, len: 28 },
          verifiedSize: 18,
          verifiedWeight: 600,
        },
        // StreamResume.tsx
        "stream-resume": {
          headerTitleSize: 19,
          headerTitleWeight: 600,
          headerMetaSize: 15,
          body: { padding: "24px 32px 26px" },
          markerLabelSize: 15,
          markerGap: 14,
          chip: { fontSize: 20, fontWeight: 700, padding: "6px 14px", radiusRole: "lg", tracking: "0.02em" },
          dividerMargin: "20px 0 8px",
          row: { gap: 18, padding: "14px 6px", cursorSize: 16, cursorMinWidth: 102, labelSize: 19 },
        },
        // Fork.tsx
        fork: {
          headerTitleSize: 19,
          headerTitleWeight: 600,
          headerMetaSize: 15,
          body: { padding: "28px 32px" },
          chip: { fontSize: 17, padding: "9px 14px", radiusRole: "lg", orphanOpacity: 0.6 },
          chainGap: 12,
          forkRow: { gap: 14, marginTop: 18 },
          archivedBadge: { fontSize: 12, fontWeight: 600, tracking: "0.05em", padding: "4px 10px", radiusRole: "md" },
          note: { marginTop: 20, fontSize: 24 },
        },
        // Stat.tsx
        stat: {
          body: { padding: "58px 62px" },
          value: { fontSize: 104, fontWeight: 600, tracking: "-0.025em", lineHeight: 1 },
          label: { fontSize: 26, marginTop: 16 },
          sub: { fontSize: 30, marginTop: 12 },
        },
        // Diagram.tsx
        diagram: {
          surface: "rgba(255,255,255,0.97)",
          geom: { W: 620, H: 240, NW: 132, NH: 62 },
          svgPadding: "10px",
          edge: { strokeWidth: 1.5, labelOffset: 8, labelSize: 12 },
          nodeRx: 12,
          nodeStroke: 1.5,
          nodeLabel: { fontSize: 15, fontWeight: 600, yOffset: 5 },
          nodeFill: { default: "chrome", data: "signalBlueSoft", api: "signalBlue" },
          nodeStrokeColor: { default: "hairline", data: "signalBlueBorder", api: "signalBlue" },
          nodeText: { default: "ink", data: "signalBlue", api: "paper" },
          note: { padding: "0 26px 18px", fontSize: 24 },
        },
        // Browser.tsx
        browser: {
          headerGap: 12,
          headerTitleSize: 18,
          headerTitleWeight: 600,
          headerMetaSize: 14,
          body: { padding: "8px 0 18px" },
          sectionLabel: { fontSize: 13, fontWeight: 600, tracking: "0.07em", padding: "18px 32px 8px" },
          row: { gap: 14, padding: "13px 32px", fontSize: 19, metaSize: 16 },
        },
      },
    },
    badge: {
      size: 15,
      track: "0.06em",
      radius: 999,
      bgRole: "goldSoft",
      fgRole: "gold",
    },
    caption: {
      footerSize: 22,
      subheadSize: 19,
      weight: 450,
      colorRole: "textMuted",
    },
    // Softer, rounder radius scale than field-notebook.
    radius: { sm: 5, md: 9, lg: 14, xl: 20, full: 999 },
  },
  layout: {
    // Roomier band geometry — bigger gaps + more side padding, sits lower so the
    // larger headline has air above it.
    regions: {
      "16x9": {
        lead: { top: "34%", bottom: "6%", dir: "row", gap: 72, pad: "0 130px" },
        footer: { bottom: "7%" },
      },
      "1x1": {
        lead: { top: "31%", bottom: "6%", dir: "column", gap: 30, pad: "0 8%" },
        footer: { bottom: "7%" },
      },
      "9x16": {
        lead: { top: "25%", bottom: "6%", dir: "column", gap: 38, pad: "0 8%" },
        footer: { bottom: "7%" },
      },
    },
    // Code is DE-EMPHASIZED — smaller codeFont per format than field-notebook.
    bands: {
      "16x9": { codeFont: 21, codeMax: 800, itemMax: 800, panelW: 640, panelMax: 640 },
      "1x1": { codeFont: 15, codeMax: 920, itemMax: 920, panelW: "100%", panelMax: 640 },
      "9x16": { codeFont: 18, codeMax: 920, itemMax: 920, panelW: "100%", panelMax: 640 },
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
    // Gentler entrances — longer card delay, more travel, eased not snapped.
    cardEnter: { enter: "settle", delay: 16 },
    defaultEnter: "rise",
    defaultEasing: "smooth",
    enterDistance: 30,
    ease: {
      // Softer/slower than field-notebook's smooth — a calm settle.
      smooth: [0.22, 1, 0.36, 1],
      snappy: [0.175, 0.885, 0.32, 1.1],
    },
    timing: { typingSpeed: 2.6, outputGap: 10, settle: 18, enterDuration: 0.55, exitDuration: 0.4 },
  },
  backgrounds: { default: { shapes: true }, heroScrim: { strength: 0.4, placement: "center" } },
};
