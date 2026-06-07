import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { drawDashoffset, typewriterChars } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { STYLES } from "../../templates/active";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "proof" }>;

const S = STYLES.panel.byKind.proof as {
  headerTitleSize: number;
  headerTitleWeight: number;
  headerPill: { fontSize: number; fontWeight: number; padding: string; radiusRole: keyof typeof RADIUS; tracking: string };
  body: { padding: string };
  eventLineSize: number;
  cursorSize: number;
  divider: { height: number; margin: string };
  sigLabel: { fontSize: number; fontWeight: number; tracking: string };
  sig: { minHeight: number; marginTop: number; fontSize: number; lineHeight: string; tracking: string };
  keyLine: { marginTop: number; fontSize: number };
  verifyRow: { gap: number; marginTop: number; height: number };
  check: { box: number; circleR: number; circleStroke: number; circleOpacity: number; pathStroke: number; len: number };
  verifiedSize: number;
  verifiedWeight: number;
};

/** Group a hex signature into 4-char blocks; truncate the middle to a receipt line. */
const formatSig = (hex: string) => {
  const clean = hex.replace(/[^0-9a-f]/gi, "");
  const head = clean.slice(0, 24).match(/.{1,4}/g)?.join(" ") ?? clean;
  const tail = clean.slice(-8).match(/.{1,4}/g)?.join(" ") ?? "";
  return `${head} … ${tail}`;
};

/** ed25519 signature as the hero — an honest cryptographic receipt, not a sticker. */
export const ProofPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const sig = formatSig(spec.signature);

  const eventIn = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  const sigReveal = interpolate(frame, [40, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  const checkP = interpolate(frame, [82, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  const verifiedIn = interpolate(frame, [92, 104], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  const CHECK_LEN = S.check.len;

  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ color: COLORS.ink, fontSize: S.headerTitleSize, fontWeight: S.headerTitleWeight }}>streams.consume</span>
        <span style={{ fontSize: S.headerPill.fontSize, fontWeight: S.headerPill.fontWeight, color: COLORS.signalBlue, background: COLORS.signalBlueSoft, padding: S.headerPill.padding, borderRadius: RADIUS[S.headerPill.radiusRole], letterSpacing: S.headerPill.tracking }}>verify: true</span>
      </PanelHeader>

      <div style={{ padding: S.body.padding }}>
        {/* event line + its cursor */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", opacity: eventIn, transform: `translateY(${(1 - eventIn) * 8}px)` }}>
          <span style={{ fontSize: S.eventLineSize, color: COLORS.ink }}>{spec.eventLine}</span>
          <span style={{ fontSize: S.cursorSize, color: COLORS.textMuted, fontVariantNumeric: "tabular-nums" }}>{spec.cursor}</span>
        </div>

        <div style={{ height: S.divider.height, background: COLORS.hairline, margin: S.divider.margin }} />

        {/* the signature is the hero */}
        <div style={{ fontSize: S.sigLabel.fontSize, fontWeight: S.sigLabel.fontWeight, letterSpacing: S.sigLabel.tracking, textTransform: "uppercase", color: COLORS.textMuted }}>signature · ed25519</div>
        <div style={{ minHeight: S.sig.minHeight, marginTop: S.sig.marginTop, fontSize: S.sig.fontSize, lineHeight: S.sig.lineHeight, color: COLORS.ink, fontVariantNumeric: "tabular-nums", letterSpacing: S.sig.tracking, whiteSpace: "pre-wrap" }}>
          {sig.slice(0, typewriterChars(sigReveal, sig.length))}
        </div>
        <div style={{ marginTop: S.keyLine.marginTop, fontSize: S.keyLine.fontSize, color: COLORS.textMuted }}>key {spec.keyId}</div>

        {/* verification resolves with a drawn check (reserved height, no shift) */}
        <div style={{ display: "flex", alignItems: "center", gap: S.verifyRow.gap, marginTop: S.verifyRow.marginTop, height: S.verifyRow.height }}>
          <svg width={S.check.box} height={S.check.box} viewBox="0 0 26 26">
            <circle cx={13} cy={13} r={S.check.circleR} fill="none" stroke={COLORS.signalBlue} strokeWidth={S.check.circleStroke} opacity={S.check.circleOpacity} />
            <path d="M8 13.5 L11.5 17 L18 9.5" fill="none" stroke={COLORS.signalBlue} strokeWidth={S.check.pathStroke} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={CHECK_LEN} strokeDashoffset={drawDashoffset(checkP, CHECK_LEN)} />
          </svg>
          <span style={{ fontSize: S.verifiedSize, fontWeight: S.verifiedWeight, color: COLORS.signalBlue, opacity: verifiedIn }}>verified</span>
        </div>
      </div>
    </PanelCard>
  );
};
