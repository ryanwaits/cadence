import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { STYLES } from "../../templates/active";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "feed" }>;

const S = STYLES.panel.byKind.feed as {
  headerGap: number;
  titleSize: number;
  titleWeight: number;
  subtitleSize: number;
  statusDot: { size: number; opacityBase: number; opacityPulse: number };
  statusSize: number;
  statusColor: string;
  body: { padding: string };
  row: {
    padding: string;
    margin: string;
    radiusRole: keyof typeof RADIUS;
    zebra: string;
    gap: number;
    badgeSize: number;
    badgeWeight: number;
    badgePadding: string;
    badgeRadiusBase: keyof typeof RADIUS;
    badgeRadiusPlus: number;
    badgeTracking: number;
    labelColor: string;
    labelSize: number;
    valueSize: number;
    valueWeight: number;
  };
};

const ROW_START = 26;
const ROW_STAGGER = 11;
const ROW_DUR = 16;

export const FeedPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const pulse = 0.5 + 0.5 * Math.sin(useCurrentFrame() / 6);
  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <div style={{ display: "flex", alignItems: "center", gap: S.headerGap }}>
          <span style={{ color: COLORS.ink, fontSize: S.titleSize, fontWeight: S.titleWeight }}>{spec.title}</span>
          {spec.subtitle && <span style={{ color: COLORS.textMuted, fontSize: S.subtitleSize }}>{spec.subtitle}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: S.statusDot.size, height: S.statusDot.size, borderRadius: "50%", background: COLORS.successGreen, opacity: S.statusDot.opacityBase + S.statusDot.opacityPulse * pulse }} />
          <span style={{ color: S.statusColor, fontSize: S.statusSize, fontFamily: FONTS.note }}>{spec.status}</span>
        </div>
      </PanelHeader>
      <div style={{ padding: S.body.padding }}>
        {spec.rows.map((row, i) => {
          const start = ROW_START + staggerDelay(i, ROW_STAGGER);
          const p = interpolate(frame, [start, start + ROW_DUR], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: S.row.padding, margin: S.row.margin, borderRadius: RADIUS[S.row.radiusRole], background: i % 2 === 0 ? S.row.zebra : "transparent", ...enterStyle("stagger", p) }}>
              <div style={{ display: "flex", alignItems: "center", gap: S.row.gap }}>
                <span style={{ fontSize: S.row.badgeSize, fontWeight: S.row.badgeWeight, color: COLORS.signalBlue, background: COLORS.signalBlueSoft, padding: S.row.badgePadding, borderRadius: RADIUS[S.row.badgeRadiusBase] + S.row.badgeRadiusPlus, letterSpacing: S.row.badgeTracking }}>{row.badge}</span>
                <span style={{ color: S.row.labelColor, fontSize: S.row.labelSize }}>→ {row.label}</span>
              </div>
              <span style={{ color: COLORS.ink, fontSize: S.row.valueSize, fontWeight: S.row.valueWeight, fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};
