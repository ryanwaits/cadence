import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import type { PanelSpec } from "../../schema/beats";
import { STYLES } from "../../templates/active";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "upload-progress" }>;

const S = STYLES.panel.byKind["upload-progress"] as {
  titleSize: number;
  titleWeight: number;
  pill: { fontSize: number; fontWeight: number; color: string; background: string; padding: string; radiusRole: keyof typeof RADIUS };
  body: { padding: string };
  pctRow: { marginBottom: number };
  pctSize: number;
  pctWeight: number;
  metaSize: number;
  bar: { height: number; radiusRole: keyof typeof RADIUS; track: string };
  btnRow: { gap: number; marginTop: number };
  btn: { padding: string; radiusRole: keyof typeof RADIUS; fontSize: number; fontWeight: number; color: string; background: string; borderColor: string };
};

export const UploadProgressPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const { fps } = useVideoConfig();
  // upload climbs from ~frame 40 to ~frame 130
  const pct = interpolate(frame, [40, 40 + fps * 3], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  const part = Math.round((pct / 100) * spec.parts);
  const sent = ((pct / 100) * spec.sizeMB).toFixed(0);

  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ color: COLORS.ink, fontSize: S.titleSize, fontWeight: S.titleWeight }}>↑ {spec.file}</span>
        <span style={{ fontSize: S.pill.fontSize, fontWeight: S.pill.fontWeight, color: S.pill.color, background: S.pill.background, padding: S.pill.padding, borderRadius: RADIUS[S.pill.radiusRole] }}>● Uploading…</span>
      </PanelHeader>
      <div style={{ padding: S.body.padding }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: S.pctRow.marginBottom }}>
          <span style={{ fontSize: S.pctSize, fontWeight: S.pctWeight, color: COLORS.ink, fontVariantNumeric: "tabular-nums" }}>{Math.round(pct)}%</span>
          <span style={{ fontSize: S.metaSize, color: COLORS.textMuted }}>{sent} / {spec.sizeMB} MB · part {part}/{spec.parts}</span>
        </div>
        <div style={{ height: S.bar.height, borderRadius: RADIUS[S.bar.radiusRole], background: S.bar.track, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: COLORS.signalBlue, borderRadius: RADIUS[S.bar.radiusRole] }} />
        </div>
        <div style={{ display: "flex", gap: S.btnRow.gap, marginTop: S.btnRow.marginTop }}>
          <Btn label="control.pause()" />
          <Btn label="control.resume()" ghost />
        </div>
      </div>
    </PanelCard>
  );
};

const Btn: React.FC<{ label: string; ghost?: boolean }> = ({ label, ghost }) => (
  <span style={{ flex: 1, textAlign: "center", padding: S.btn.padding, borderRadius: RADIUS[S.btn.radiusRole], fontSize: S.btn.fontSize, fontWeight: S.btn.fontWeight, color: ghost ? COLORS.textMuted : S.btn.color, background: ghost ? "transparent" : S.btn.background, border: `1px solid ${ghost ? COLORS.hairline : S.btn.borderColor}` }}>{label}</span>
);
