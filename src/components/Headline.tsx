import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../brand/tokens";
import { FONTS } from "../brand/fonts";
import { useMotion, type MotionSpec } from "../motion/useMotion";
import type { Format } from "../schema/beats";

// Per-format type scale. Eyebrow is a small tracked uppercase gold label (our
// signature mono label = the reference's "NEW IN 1.7"); headline is a heavy,
// tight Sora grotesk in warm near-white with a crisp-plus-soft shadow.
const H = {
  "16x9": { top: "13%", size: 72, eyebrow: 15, track: 0.18, max: "70%" },
  "1x1": { top: "6%", size: 44, eyebrow: 13, track: 0.16, max: "86%" },
  "9x16": { top: "8%", size: 52, eyebrow: 14, track: 0.16, max: "86%" },
} as const;

// Layered "scrim glow": tight 0-offset halos hug the glyphs so white text reads
// over BRIGHT painterly skies (where a single soft drop-shadow washes out), plus
// offset blurs for depth. Tinted slate (#1e293b) at ~half strength — present but
// soft, not a heavy black outline.
const HEADLINE_SHADOW =
  "0 0 1px rgba(30,41,59,0.33), 0 0 4px rgba(30,41,59,0.28), 0 0 16px rgba(30,41,59,0.24), 0 2px 8px rgba(30,41,59,0.28), 0 10px 44px rgba(30,41,59,0.22)";
// On a light backdrop, a soft white halo lifts the dark headline off the field.
const HEADLINE_SHADOW_LIGHT = "0 1px 2px rgba(255,255,255,0.6)";
// Smaller text needs tighter halos (a large blur smears glyphs at 15-23px).
const EYEBROW_SHADOW = "0 0 1px rgba(30,41,59,0.35), 0 0 7px rgba(30,41,59,0.28), 0 1px 3px rgba(30,41,59,0.25)";
const SUBHEAD_SHADOW = "0 0 2px rgba(30,41,59,0.28), 0 0 11px rgba(30,41,59,0.22), 0 2px 8px rgba(30,41,59,0.24)";

export const Headline: React.FC<{
  eyebrow?: string;
  headline: string;
  /** Optional sub-tagline rendered directly under the headline (hero/title cards). */
  subhead?: string;
  /** Optional handwritten flourish under the headline (FONTS.note, marker color). */
  note?: string;
  /** `"top"` (default) anchors near the top; `"center"` vertically centers the block. */
  place?: "top" | "center";
  motion?: MotionSpec;
  format?: Format;
  light?: boolean;
}> = ({ eyebrow, headline, subhead, note, place = "top", motion = { enter: "rise", delay: 8 }, format = "16x9", light = false }) => {
  const frame = useCurrentFrame();
  const style = useMotion(motion);
  const m = H[format];

  const eyebrowIn = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const subheadIn = interpolate(frame, [18, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  const noteIn = interpolate(frame, [24, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  const placement: React.CSSProperties =
    place === "center"
      ? { top: 0, bottom: 0, justifyContent: "center" }
      : { top: m.top };

  return (
    <div style={{ position: "absolute", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", ...placement, ...style }}>
      {eyebrow && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: m.eyebrow,
            fontWeight: 600,
            letterSpacing: `${m.track}em`,
            textTransform: "uppercase",
            color: COLORS.gold,
            opacity: eyebrowIn,
            marginBottom: 16,
            textShadow: light ? "none" : EYEBROW_SHADOW,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: m.size,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1.0,
          color: light ? COLORS.ink : COLORS.titleWhite,
          textShadow: light ? HEADLINE_SHADOW_LIGHT : HEADLINE_SHADOW,
          maxWidth: m.max,
          textWrap: "balance",
        }}
      >
        {headline}
      </div>
      {subhead && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: Math.round(m.size * 0.32),
            fontWeight: 500,
            marginTop: 22,
            color: light ? COLORS.textMuted : COLORS.titleWhite,
            opacity: (light ? 1 : 0.9) * subheadIn,
            textShadow: light ? "none" : SUBHEAD_SHADOW,
            maxWidth: m.max,
            textWrap: "balance",
          }}
        >
          {subhead}
        </div>
      )}
      {note && (
        <div
          style={{
            fontFamily: FONTS.note,
            fontSize: Math.round(m.size * 0.5),
            fontWeight: 500,
            lineHeight: 1.0,
            marginTop: 14,
            color: COLORS.markerPink,
            opacity: noteIn,
            textShadow: light ? "none" : SUBHEAD_SHADOW,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
};
