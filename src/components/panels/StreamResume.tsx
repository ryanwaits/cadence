import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { STYLES } from "../../templates/active";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "stream-resume" }>;

const S = STYLES.panel.byKind["stream-resume"] as {
  headerTitleSize: number;
  headerTitleWeight: number;
  headerMetaSize: number;
  body: { padding: string };
  markerLabelSize: number;
  markerGap: number;
  chip: { fontSize: number; fontWeight: number; padding: string; radiusRole: keyof typeof RADIUS; tracking: string };
  dividerMargin: string;
  row: { gap: number; padding: string; cursorSize: number; cursorMinWidth: number; labelSize: number };
};

const ROW_START = 40;
const ROW_STAGGER = 12;

/** The cursor is the hero: a precise resume point, items flowing past it. */
export const StreamResumePanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const chipIn = interpolate(frame, [18, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ color: COLORS.ink, fontSize: S.headerTitleSize, fontWeight: S.headerTitleWeight }}>streams.consume</span>
        <span style={{ fontSize: S.headerMetaSize, color: COLORS.textMuted }}>exactly-once</span>
      </PanelHeader>

      <div style={{ padding: S.body.padding }}>
        {/* resume marker */}
        <div style={{ display: "flex", alignItems: "center", gap: S.markerGap, opacity: chipIn, transform: `translateY(${(1 - chipIn) * 8}px)` }}>
          <span style={{ fontSize: S.markerLabelSize, color: COLORS.textMuted }}>▸ resuming from</span>
          <span style={{ fontSize: S.chip.fontSize, fontWeight: S.chip.fontWeight, color: COLORS.signalBlue, background: COLORS.signalBlueSoft, padding: S.chip.padding, borderRadius: RADIUS[S.chip.radiusRole], fontVariantNumeric: "tabular-nums", letterSpacing: S.chip.tracking }}>{spec.fromCursor}</span>
        </div>

        <div style={{ height: 1, borderTop: `1px dashed ${COLORS.hairline}`, margin: S.dividerMargin }} />

        {/* events flow in past the cursor, each tagged with its own cursor */}
        {spec.rows.map((row, i) => {
          const start = ROW_START + staggerDelay(i, ROW_STAGGER);
          const p = interpolate(frame, [start, start + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: S.row.gap, padding: S.row.padding, borderBottom: i < spec.rows.length - 1 ? `1px solid ${COLORS.hairline}` : "none", ...enterStyle("stagger", p) }}>
              <span style={{ fontSize: S.row.cursorSize, color: COLORS.textMuted, fontVariantNumeric: "tabular-nums", minWidth: S.row.cursorMinWidth }}>{row.cursor}</span>
              <span style={{ fontSize: S.row.labelSize, color: COLORS.ink }}>{row.label}</span>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};
