import type { CodeLine } from "../code/highlight";
import type { Node } from "../schema/composition";
import type { MotionSpec } from "./useMotion";

/**
 * Pure frame-timing helpers — NO Remotion import, so node scripts (storyboard) and
 * the render path share ONE source for "when does code finish typing / content
 * settle." This is the single timing path the panel-reveal coupling and the
 * `revealAfter` generalization both build on.
 */

export const CHARS_PER_FRAME = 2.6;
/** Frames a result panel waits after its source code finishes "running". */
export const OUTPUT_GAP = 10;
/** Default frames for a non-code node's entrance to settle (approximation). */
const SETTLE = 18;

export const typeStartFor = (motion?: MotionSpec) => (motion?.delay ?? 12) + 6;
export const totalChars = (tokens: CodeLine[]) =>
  tokens.reduce((n, line) => n + line.reduce((m, t) => m + t.content.length, 0) + 1, 0);

/** Frame at which the typewriter finishes — the output panel waits for this. */
export const codeTypingDoneFrame = (tokens: CodeLine[], motion?: MotionSpec) =>
  typeStartFor(motion) + Math.ceil(totalChars(tokens) / CHARS_PER_FRAME);

/** Code typing-done from tokens when present, else estimated from source length
 * (storyboard runs before `calculateMetadata` fills tokens). */
const codeDoneEstimate = (code: { tokens?: CodeLine[]; source?: string; motion?: MotionSpec }) => {
  if (code.tokens?.length) return codeTypingDoneFrame(code.tokens, code.motion);
  const chars = (code.source ?? "").length;
  return typeStartFor(code.motion) + Math.ceil(chars / CHARS_PER_FRAME);
};

/**
 * A frame by which a beat's content has "settled" — a representative still (storyboard).
 * Approximation, not the exact render-time reveal resolution: the latest code finishes
 * typing, a result panel reveals `OUTPUT_GAP` later and settles. Pure + unit-testable.
 */
export function settledFrame(nodes: Node[]): number {
  let maxCodeDone = 0;
  let anyPanel = false;
  const walk = (ns: Node[]): void => {
    for (const n of ns) {
      if (n.type === "code") maxCodeDone = Math.max(maxCodeDone, codeDoneEstimate(n.code));
      else if (n.type === "panel") anyPanel = true;
      if ("children" in n) walk(n.children);
    }
  };
  walk(nodes);
  const panelSettled = anyPanel ? maxCodeDone + OUTPUT_GAP + SETTLE : 0;
  return Math.max(SETTLE, maxCodeDone, panelSettled);
}
