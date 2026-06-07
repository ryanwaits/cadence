import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "data-table" }>;

const ROW_START = 24;

export const DataTablePanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  return (
    <PanelCard motion={spec.motion}>
      <div style={{ padding: "22px 26px" }}>
        {spec.title && <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.ink, marginBottom: 16 }}>{spec.title}</div>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${spec.columns.length}, 1fr)`, columnGap: 18 }}>
          {spec.columns.map((c) => (
            <div key={c} style={{ fontFamily: FONTS.mono, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.textMuted, paddingBottom: 12, borderBottom: `1px solid ${COLORS.hairline}` }}>{c}</div>
          ))}
          {spec.rows.map((row, ri) => {
            const start = ROW_START + staggerDelay(ri, 8);
            const p = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
            const st = enterStyle("stagger", p);
            return row.map((cell, ci) => (
              <div key={`${ri}-${ci}`} style={{ fontFamily: FONTS.mono, fontSize: 18, color: ci === 0 ? COLORS.ink : "rgba(0,0,0,0.7)", padding: "14px 0", borderBottom: `1px solid ${COLORS.hairline}`, fontVariantNumeric: "tabular-nums", ...st }}>{cell}</div>
            ));
          })}
        </div>
      </div>
    </PanelCard>
  );
};
