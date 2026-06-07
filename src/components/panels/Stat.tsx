import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { countValue } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "stat" }>;

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
      <div style={{ padding: "52px 56px", textAlign: "center" }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 100, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1, color: COLORS.ink, fontVariantNumeric: "tabular-nums" }}>{display}</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 24, color: COLORS.textMuted, marginTop: 14 }}>{spec.label}</div>
        {spec.sub && <div style={{ fontFamily: FONTS.note, fontSize: 28, color: COLORS.signalBlue, marginTop: 10 }}>{spec.sub}</div>}
      </div>
    </PanelCard>
  );
};
