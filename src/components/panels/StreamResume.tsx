import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "stream-resume" }>;

const ROW_START = 40;
const ROW_STAGGER = 12;

/** The cursor is the hero: a precise resume point, items flowing past it. */
export const StreamResumePanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const chipIn = interpolate(frame, [18, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ color: COLORS.ink, fontSize: 18, fontWeight: 600 }}>streams.consume</span>
        <span style={{ fontSize: 14, color: COLORS.textMuted }}>exactly-once</span>
      </PanelHeader>

      <div style={{ padding: "20px 26px 22px" }}>
        {/* resume marker */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: chipIn, transform: `translateY(${(1 - chipIn) * 8}px)` }}>
          <span style={{ fontSize: 14, color: COLORS.textMuted }}>▸ resuming from</span>
          <span style={{ fontSize: 19, fontWeight: 700, color: COLORS.signalBlue, background: COLORS.signalBlueSoft, padding: "5px 12px", borderRadius: RADIUS.md, fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>{spec.fromCursor}</span>
        </div>

        <div style={{ height: 1, borderTop: `1px dashed ${COLORS.hairline}`, margin: "16px 0 6px" }} />

        {/* events flow in past the cursor, each tagged with its own cursor */}
        {spec.rows.map((row, i) => {
          const start = ROW_START + staggerDelay(i, ROW_STAGGER);
          const p = interpolate(frame, [start, start + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 4px", borderBottom: i < spec.rows.length - 1 ? `1px solid ${COLORS.hairline}` : "none", ...enterStyle("stagger", p) }}>
              <span style={{ fontSize: 15, color: COLORS.textMuted, fontVariantNumeric: "tabular-nums", minWidth: 96 }}>{row.cursor}</span>
              <span style={{ fontSize: 18, color: COLORS.ink }}>{row.label}</span>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};
