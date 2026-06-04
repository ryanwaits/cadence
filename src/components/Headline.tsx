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

const HEADLINE_SHADOW = "0 1px 2px rgba(30,41,59,0.24), 0 6px 34px rgba(30,41,59,0.42)";
// On a light backdrop, a soft white halo lifts the dark headline off the field.
const HEADLINE_SHADOW_LIGHT = "0 1px 2px rgba(255,255,255,0.6)";

export const Headline: React.FC<{ eyebrow?: string; headline: string; motion?: MotionSpec; format?: Format; light?: boolean }> = ({
  eyebrow,
  headline,
  motion = { enter: "rise", delay: 8 },
  format = "16x9",
  light = false,
}) => {
  const frame = useCurrentFrame();
  const style = useMotion(motion);
  const m = H[format];

  const eyebrowIn = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });

  return (
    <div style={{ position: "absolute", top: m.top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", ...style }}>
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
            textShadow: light ? "none" : "0 1px 10px rgba(20,24,33,0.35)",
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
    </div>
  );
};
