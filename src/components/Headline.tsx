import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../brand/tokens";
import { FONTS } from "../brand/fonts";
import { STYLES, resolveRole } from "../templates/active";
import { useMotion, type MotionSpec } from "../motion/useMotion";
import type { Format } from "../schema/beats";

// Type scale, weights, tracking, shadows, and color roles come from the active
// template (`STYLES.headline`). Eyebrow is a small tracked uppercase label (our
// signature mono label); headline is a heavy, tight grotesk in warm near-white
// with a crisp-plus-soft shadow.
const HEAD = STYLES.headline;
const HEADLINE_SHADOW = HEAD.shadows.headline;
const HEADLINE_SHADOW_LIGHT = HEAD.shadows.headlineLight;
const EYEBROW_SHADOW = HEAD.shadows.eyebrow;
const SUBHEAD_SHADOW = HEAD.shadows.subhead;

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
  const m = HEAD.scale[format];

  const eyebrowIn = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const subheadIn = interpolate(frame, [18, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  // The handwritten note "writes in": a left-to-right clip-path wipe (the writing
  // direction) over a slightly longer window than a plain fade, so a short word
  // reads as being drawn. A quick opacity ramp softens the leading ink edge.
  const noteWrite = interpolate(frame, [24, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

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
            fontWeight: HEAD.eyebrowWeight,
            letterSpacing: `${m.track}em`,
            textTransform: HEAD.eyebrowUppercase ? "uppercase" : "none",
            color: resolveRole(HEAD.eyebrowColor),
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
          fontWeight: HEAD.headlineWeight,
          letterSpacing: HEAD.headlineTracking,
          lineHeight: HEAD.headlineLineHeight,
          color: light ? resolveRole(HEAD.headlineLightColor) : resolveRole(HEAD.headlineColor),
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
            fontSize: Math.round(m.size * HEAD.subheadScale),
            fontWeight: HEAD.subheadWeight,
            marginTop: 22,
            color: light ? resolveRole("textMuted") : resolveRole(HEAD.subheadColor),
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
            fontSize: Math.round(m.size * HEAD.noteScale),
            fontWeight: HEAD.subheadWeight,
            lineHeight: HEAD.headlineLineHeight,
            marginTop: 14,
            color: resolveRole(HEAD.noteColor),
            // Reveal left→right (writing motion); the opacity ramp keeps the
            // leading edge from popping. inset clips from the right toward 0.
            clipPath: `inset(-0.15em ${(1 - noteWrite) * 100}% -0.15em 0)`,
            opacity: Math.min(1, noteWrite * 5),
            textShadow: light ? "none" : SUBHEAD_SHADOW,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
};
