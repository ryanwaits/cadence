import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BACKDROP, COLORS } from "../brand/tokens";
import type { Beat } from "../schema/beats";

type BG = Beat["background"];

/** hex (#abc | #aabbcc) → rgba string with alpha. */
const hexA = (hex: string, a: number) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

/**
 * Backdrop style packs. The default (no `background`, or `shapes`) is a procedural,
 * theme-colored field of soft curved arcs — no asset, no API key. Other packs: an
 * `image` (optional painterly pack, Ken Burns + haze), an AI-free `gradient`, or a
 * `solid`. All add a soft vignette + slow drift so they're never flat.
 */
export const Background: React.FC<{ bg?: BG }> = ({ bg }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Default backdrop: procedural soft arcs tinted from the active theme.
  if (!bg || bg.shapes) {
    const drift = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
    const a = COLORS.signalBlue;
    // A soft arc band centered off-canvas: transparent core → faint accent ring → fade.
    const arc = (cx: number, cy: number, r: number, alpha: number) =>
      `radial-gradient(circle at ${cx}% ${cy}%, transparent ${r}%, ${hexA(a, alpha)} ${r + 1}%, ${hexA(a, alpha * 0.35)} ${r + 9}%, transparent ${r + 18}%)`;
    return (
      <AbsoluteFill style={{ opacity }}>
        <AbsoluteFill style={{ background: `linear-gradient(160deg, ${BACKDROP[0]} 0%, ${BACKDROP[1]} 100%)` }} />
        <AbsoluteFill
          style={{
            background: [arc(114, 94, 40, 0.32), arc(90, 24, 32, 0.22), arc(-8, 110, 30, 0.18)].join(","),
            transform: `translateY(${interpolate(drift, [0, 1], [0, -14])}px) scale(${interpolate(drift, [0, 1], [1, 1.05])})`,
          }}
        />
        {/* gentle top wash so headlines stay legible */}
        <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 14%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 55%)" }} />
      </AbsoluteFill>
    );
  }

  if (bg.solid || bg.gradient) {
    const drift = interpolate(frame, [0, durationInFrames], [0, 1.04], { extrapolateRight: "clamp" });
    const fill = bg.solid
      ? bg.solid
      : `linear-gradient(${bg.angle}deg, ${bg.gradient![0]} 0%, ${bg.gradient![1]} 100%)`;
    return (
      <AbsoluteFill style={{ opacity }}>
        <AbsoluteFill style={{ background: fill, transform: `scale(${drift})` }} />
        {/* soft vignette so panels read + the fill has depth */}
        <AbsoluteFill style={{ background: "radial-gradient(120% 100% at 50% 30%, rgba(255,255,255,0.10), rgba(0,0,0,0.10) 100%)" }} />
      </AbsoluteFill>
    );
  }

  const kb = bg.treatment === "kenburns";
  const scale = kb ? interpolate(frame, [0, durationInFrames], [1, 1.08], { extrapolateRight: "clamp" }) : 1;
  const translateY = kb ? interpolate(frame, [0, durationInFrames], [-12, 0], { extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.chrome, opacity }}>
      <Img
        src={staticFile(bg.src!)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale}) translateY(${translateY}px)` }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 16%, rgba(250,248,242,0.58) 0%, rgba(250,248,242,0.18) 40%, rgba(230,235,240,0) 72%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(248,246,240,0.35) 0%, rgba(248,246,240,0) 22%, rgba(40,55,70,0.10) 100%)" }} />
    </AbsoluteFill>
  );
};
