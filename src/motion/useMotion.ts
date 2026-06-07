import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CSSProperties } from "react";
import { EASE } from "../brand/tokens";
import type { EnterPreset, ExitPreset } from "./names";
import { enterStyle, exitStyle } from "./presets";

/**
 * Shared default entrance for the two floating cards — the code window and the
 * result panel — so they animate in on the same frame. Both `CodeWindow` and
 * `PanelCard` default to this; change it here, not in two component defaults that
 * can drift apart. (Panel *content* reveal is timed separately via `reveal`.)
 */
export const CARD_ENTER: MotionSpec = { enter: "settle", delay: 12 };

/** Declarative motion for one element. Mirrored as zod in `src/schema/beats.ts`. */
export type MotionSpec = {
  enter?: EnterPreset;
  exit?: ExitPreset;
  easing?: "smooth" | "snappy";
  /** frames to wait before entering */
  delay?: number;
  /** frames the entrance takes (default ~0.55s) */
  durationInFrames?: number;
  /** px travel for rise (default 24) */
  distance?: number;
};

/**
 * Resolves a MotionSpec to a style for the current frame, composing the entrance
 * (from `delay`) with an exit ramp in the sequence's final ~0.4s. `smooth` is the
 * default entrance easing; `snappy` (slight settle) is opt-in for state pops.
 */
export const useMotion = (spec: MotionSpec = {}, opts: { reduced?: boolean } = {}): CSSProperties => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const reduced = opts.reduced ?? false;

  const easing = EASE[spec.easing ?? "smooth"];
  const delay = spec.delay ?? 0;
  const enterDur = spec.durationInFrames ?? Math.round(fps * 0.55);

  const ep = interpolate(frame, [delay, delay + enterDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
  const enterFrag = enterStyle(spec.enter ?? "rise", ep, { distance: spec.distance, reduced });

  let opacity = enterFrag.opacity;
  const transforms: string[] = [];
  if (enterFrag.transform !== "none") transforms.push(enterFrag.transform);

  if (spec.exit) {
    const exitDur = Math.round(fps * 0.4);
    const xStart = durationInFrames - exitDur;
    const xp = interpolate(frame, [xStart, durationInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE.smooth,
    });
    const exitFrag = exitStyle(spec.exit, xp, { reduced });
    opacity *= exitFrag.opacity;
    if (exitFrag.transform !== "none") transforms.push(exitFrag.transform);
  }

  return {
    opacity,
    transform: transforms.length ? transforms.join(" ") : undefined,
    filter: enterFrag.filter,
  };
};
