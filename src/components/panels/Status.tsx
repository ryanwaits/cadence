import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "status" }>;

const STATE_COLOR: Record<Spec["services"][number]["state"], string> = {
  ok: COLORS.successGreen,
  syncing: COLORS.infoBlue,
  error: COLORS.dangerRed,
  idle: COLORS.textMuted as string,
};

export const StatusPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ color: COLORS.ink, fontSize: 19, fontWeight: 600 }}>{spec.title}</span>
      </PanelHeader>
      <div style={{ padding: "12px 26px 22px" }}>
        {spec.services.map((s, i) => {
          const start = staggerDelay(i, 9);
          const p = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
          return (
            <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < spec.services.length - 1 ? `1px solid ${COLORS.hairline}` : "none", ...enterStyle("stagger", p) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: STATE_COLOR[s.state] }} />
                <span style={{ fontSize: 18, color: COLORS.ink }}>{s.name}</span>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: STATE_COLOR[s.state], background: `${STATE_COLOR[s.state]}1f`, padding: "3px 8px", borderRadius: RADIUS.sm }}>{s.detail ?? s.state}</span>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};
