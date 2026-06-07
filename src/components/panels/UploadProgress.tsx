import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "upload-progress" }>;

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
        <span style={{ color: COLORS.ink, fontSize: 19, fontWeight: 600 }}>↑ {spec.file}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#c2410c", background: "rgba(194,65,12,0.10)", padding: "5px 11px", borderRadius: RADIUS.full }}>● Uploading…</span>
      </PanelHeader>
      <div style={{ padding: "26px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: COLORS.ink, fontVariantNumeric: "tabular-nums" }}>{Math.round(pct)}%</span>
          <span style={{ fontSize: 17, color: COLORS.textMuted }}>{sent} / {spec.sizeMB} MB · part {part}/{spec.parts}</span>
        </div>
        <div style={{ height: 10, borderRadius: RADIUS.full, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: COLORS.signalBlue, borderRadius: RADIUS.full }} />
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          <Btn label="control.pause()" />
          <Btn label="control.resume()" ghost />
        </div>
      </div>
    </PanelCard>
  );
};

const Btn: React.FC<{ label: string; ghost?: boolean }> = ({ label, ghost }) => (
  <span style={{ flex: 1, textAlign: "center", padding: "12px", borderRadius: RADIUS.md, fontSize: 17, fontWeight: 600, color: ghost ? COLORS.textMuted : "#c2410c", background: ghost ? "transparent" : "rgba(194,65,12,0.10)", border: `1px solid ${ghost ? COLORS.hairline : "rgba(194,65,12,0.25)"}` }}>{label}</span>
);
