import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { countValue } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { STYLES } from "../../templates/active";
import { PanelCard } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "stat" }>;

const S = STYLES.panel.byKind.stat as {
  body: { padding: string };
  value: { fontSize: number; fontWeight: number; tracking: string; lineHeight: number };
  label: { fontSize: number; marginTop: number };
  sub: { fontSize: number; marginTop: number };
};

/** A big headline number — the core announcement primitive. Counts up when the
 * value is purely numeric ("10,000,000"); otherwise reveals as-is ("live"). */
export const StatPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const clean = spec.value.replace(/[, ]/g, "");
  const isNumeric = /^\d+(\.\d+)?$/.test(clean);
  const p = interpolate(frame, [18, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  const display = isNumeric ? Math.round(countValue(p, Number(clean))).toLocaleString() : spec.value;

  return (
    <PanelCard motion={spec.motion}>
      <div style={{ padding: S.body.padding, textAlign: "center" }}>
        <div style={{ fontFamily: FONTS.display, fontSize: S.value.fontSize, fontWeight: S.value.fontWeight, letterSpacing: S.value.tracking, lineHeight: S.value.lineHeight, color: COLORS.ink, fontVariantNumeric: "tabular-nums" }}>{display}</div>
        <div style={{ fontFamily: FONTS.body, fontSize: S.label.fontSize, color: COLORS.textMuted, marginTop: S.label.marginTop }}>{spec.label}</div>
        {spec.sub && <div style={{ fontFamily: FONTS.note, fontSize: S.sub.fontSize, color: COLORS.signalBlue, marginTop: S.sub.marginTop }}>{spec.sub}</div>}
      </div>
    </PanelCard>
  );
};
