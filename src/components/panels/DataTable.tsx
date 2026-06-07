import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { STYLES } from "../../templates/active";
import { PanelCard } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "data-table" }>;

const S = STYLES.panel.byKind["data-table"] as {
  body: { padding: string };
  titleSize: number;
  titleWeight: number;
  titleMarginBottom: number;
  columnGap: number;
  header: { fontSize: number; tracking: string; paddingBottom: number };
  cell: { fontSize: number; padding: string; color: string };
};

const ROW_START = 24;

export const DataTablePanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  return (
    <PanelCard motion={spec.motion}>
      <div style={{ padding: S.body.padding }}>
        {spec.title && <div style={{ fontSize: S.titleSize, fontWeight: S.titleWeight, color: COLORS.ink, marginBottom: S.titleMarginBottom }}>{spec.title}</div>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${spec.columns.length}, 1fr)`, columnGap: S.columnGap }}>
          {spec.columns.map((c) => (
            <div key={c} style={{ fontFamily: FONTS.mono, fontSize: S.header.fontSize, textTransform: "uppercase", letterSpacing: S.header.tracking, color: COLORS.textMuted, paddingBottom: S.header.paddingBottom, borderBottom: `1px solid ${COLORS.hairline}` }}>{c}</div>
          ))}
          {spec.rows.map((row, ri) => {
            const start = ROW_START + staggerDelay(ri, 8);
            const p = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
            const st = enterStyle("stagger", p);
            return row.map((cell, ci) => (
              <div key={`${ri}-${ci}`} style={{ fontFamily: FONTS.mono, fontSize: S.cell.fontSize, color: ci === 0 ? COLORS.ink : S.cell.color, padding: S.cell.padding, borderBottom: `1px solid ${COLORS.hairline}`, fontVariantNumeric: "tabular-nums", ...st }}>{cell}</div>
            ));
          })}
        </div>
      </div>
    </PanelCard>
  );
};
