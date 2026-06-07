import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { STYLES, resolveRole } from "../../templates/active";
import type { ColorRole } from "../../templates/types";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "status" }>;

const S = STYLES.panel.byKind.status as {
  titleSize: number;
  titleWeight: number;
  body: { padding: string };
  rowPadding: string;
  rowGap: number;
  dot: { size: number };
  nameSize: number;
  badge: { fontSize: number; tracking: string; padding: string; radiusRole: keyof typeof RADIUS; bgAlphaHex: string };
  stateColor: Record<Spec["services"][number]["state"], ColorRole>;
};

const STATE_COLOR: Record<Spec["services"][number]["state"], string> = {
  ok: resolveRole(S.stateColor.ok),
  syncing: resolveRole(S.stateColor.syncing),
  error: resolveRole(S.stateColor.error),
  idle: resolveRole(S.stateColor.idle),
};

export const StatusPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ color: COLORS.ink, fontSize: S.titleSize, fontWeight: S.titleWeight }}>{spec.title}</span>
      </PanelHeader>
      <div style={{ padding: S.body.padding }}>
        {spec.services.map((s, i) => {
          const start = staggerDelay(i, 9);
          const p = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
          return (
            <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: S.rowPadding, borderBottom: i < spec.services.length - 1 ? `1px solid ${COLORS.hairline}` : "none", ...enterStyle("stagger", p) }}>
              <div style={{ display: "flex", alignItems: "center", gap: S.rowGap }}>
                <span style={{ width: S.dot.size, height: S.dot.size, borderRadius: "50%", background: STATE_COLOR[s.state] }} />
                <span style={{ fontSize: S.nameSize, color: COLORS.ink }}>{s.name}</span>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: S.badge.fontSize, textTransform: "uppercase", letterSpacing: S.badge.tracking, color: STATE_COLOR[s.state], background: `${STATE_COLOR[s.state]}${S.badge.bgAlphaHex}`, padding: S.badge.padding, borderRadius: RADIUS[S.badge.radiusRole] }}>{s.detail ?? s.state}</span>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};
