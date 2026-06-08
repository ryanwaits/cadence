import type { CodeLine } from "../code/highlight";
import type { Node } from "../schema/composition";
import { MOTION } from "../templates/active";
import type { TimingTokens } from "../templates/types";
import type { MotionSpec } from "./useMotion";

/**
 * Pure frame-timing helpers — NO Remotion import, so node scripts (storyboard) and
 * the render path share ONE source for "when does code finish typing / content
 * settle." This is the single timing path the panel-reveal coupling and the
 * `revealAfter` generalization both build on.
 *
 * Typing speed, the output gap, and settle are TEMPLATE tokens (`MOTION.timing`),
 * not hardcoded constants — every helper takes an optional `timing` override
 * (default = the active template) so it stays pure + unit-testable.
 */

/** Active template's timing tokens — the default for every helper below. */
const TIMING: TimingTokens = MOTION.timing;

export const typeStartFor = (motion?: MotionSpec) => (motion?.delay ?? 12) + 6;
export const totalChars = (tokens: CodeLine[]) =>
  tokens.reduce((n, line) => n + line.reduce((m, t) => m + t.content.length, 0) + 1, 0);

/** Frame at which the typewriter finishes — the output panel waits for this. */
export const codeTypingDoneFrame = (tokens: CodeLine[], motion?: MotionSpec, timing: TimingTokens = TIMING) =>
  typeStartFor(motion) + Math.ceil(totalChars(tokens) / timing.typingSpeed);

/** Frame a code node finishes typing — from `tokens` when present (the render path),
 * else estimated from `source` length (storyboard/inspect run before `calculateMetadata`
 * fills tokens). Identical to `codeTypingDoneFrame` once tokens exist, so the renderer
 * stays byte-identical while the read-only verbs get a sensible estimate. */
export const codeDoneFrame = (code: { tokens?: CodeLine[]; source?: string; motion?: MotionSpec }, timing: TimingTokens = TIMING) => {
  if (code.tokens?.length) return codeTypingDoneFrame(code.tokens, code.motion, timing);
  const chars = (code.source ?? "").length;
  return typeStartFor(code.motion) + Math.ceil(chars / timing.typingSpeed);
};

/**
 * A frame by which a beat's content has "settled" — a representative still (storyboard).
 * Approximation, not the exact render-time reveal resolution: the latest code finishes
 * typing, a result panel reveals `timing.outputGap` later and settles. Pure + unit-testable.
 */
export function settledFrame(nodes: Node[], timing: TimingTokens = TIMING): number {
  let maxCodeDone = 0;
  let anyPanel = false;
  const walk = (ns: Node[]): void => {
    for (const n of ns) {
      if (n.type === "code") maxCodeDone = Math.max(maxCodeDone, codeDoneFrame(n.code, timing));
      else if (n.type === "panel") anyPanel = true;
      if ("children" in n) walk(n.children);
    }
  };
  walk(nodes);
  const panelSettled = anyPanel ? maxCodeDone + timing.outputGap + timing.settle : 0;
  return Math.max(timing.settle, maxCodeDone, panelSettled);
}
