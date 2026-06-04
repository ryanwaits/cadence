import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "feed" }>;

const ROW_START = 26;
const ROW_STAGGER = 11;
const ROW_DUR = 16;

export const FeedPanel: React.FC<{ spec: Spec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: COLORS.ink, fontSize: 19, fontWeight: 600 }}>{spec.title}</span>
          {spec.subtitle && <span style={{ color: COLORS.textMuted, fontSize: 17 }}>{spec.subtitle}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.successGreen, opacity: 0.4 + 0.6 * pulse }} />
          <span style={{ color: "#16a34a", fontSize: 18, fontFamily: FONTS.note }}>{spec.status}</span>
        </div>
      </PanelHeader>
      <div style={{ padding: "10px 12px 16px" }}>
        {spec.rows.map((row, i) => {
          const start = ROW_START + staggerDelay(i, ROW_STAGGER);
          const p = interpolate(frame, [start, start + ROW_DUR], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", margin: "4px 0", borderRadius: RADIUS.md, background: i % 2 === 0 ? "rgba(0,0,0,0.035)" : "transparent", ...enterStyle("stagger", p) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.signalBlue, background: COLORS.signalBlueSoft, padding: "4px 9px", borderRadius: RADIUS.sm + 4, letterSpacing: 0.3 }}>{row.badge}</span>
                <span style={{ color: "rgba(0,0,0,0.7)", fontSize: 19 }}>→ {row.label}</span>
              </div>
              <span style={{ color: COLORS.ink, fontSize: 19, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};
