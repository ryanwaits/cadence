import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { drawDashoffset, typewriterChars } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "proof" }>;

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

  const CHECK_LEN = 26;

  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ color: COLORS.ink, fontSize: 18, fontWeight: 600 }}>streams.consume</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.signalBlue, background: COLORS.signalBlueSoft, padding: "4px 10px", borderRadius: RADIUS.full, letterSpacing: "0.02em" }}>verify: true</span>
      </PanelHeader>

      <div style={{ padding: "22px 26px" }}>
        {/* event line + its cursor */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", opacity: eventIn, transform: `translateY(${(1 - eventIn) * 8}px)` }}>
          <span style={{ fontSize: 19, color: COLORS.ink }}>{spec.eventLine}</span>
          <span style={{ fontSize: 16, color: COLORS.textMuted, fontVariantNumeric: "tabular-nums" }}>{spec.cursor}</span>
        </div>

        <div style={{ height: 1, background: COLORS.hairline, margin: "18px 0" }} />

        {/* the signature is the hero */}
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.textMuted }}>signature · ed25519</div>
        <div style={{ minHeight: 56, marginTop: 8, fontSize: 18, lineHeight: "28px", color: COLORS.ink, fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em", whiteSpace: "pre-wrap" }}>
          {sig.slice(0, typewriterChars(sigReveal, sig.length))}
        </div>
        <div style={{ marginTop: 6, fontSize: 15, color: COLORS.textMuted }}>key {spec.keyId}</div>

        {/* verification resolves with a drawn check (reserved height, no shift) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, height: 26 }}>
          <svg width={26} height={26} viewBox="0 0 26 26">
            <circle cx={13} cy={13} r={11} fill="none" stroke={COLORS.signalBlue} strokeWidth={1.5} opacity={0.35} />
            <path d="M8 13.5 L11.5 17 L18 9.5" fill="none" stroke={COLORS.signalBlue} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={CHECK_LEN} strokeDashoffset={drawDashoffset(checkP, CHECK_LEN)} />
          </svg>
          <span style={{ fontSize: 17, fontWeight: 600, color: COLORS.signalBlue, opacity: verifiedIn }}>verified</span>
        </div>
      </div>
    </PanelCard>
  );
};
