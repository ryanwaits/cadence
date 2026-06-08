/**
 * Heuristic beats checks, as a pure function so both `cadence audit` and
 * `cadence storyboard` can surface them. Advisory only — no auto-fix. Mirrors
 * the authoring guidance in the cadence skill (3-6 beats, ~2-10s each, short
 * declarative headlines, an install/CTA closer).
 */
import type { Beat } from "../src/schema/beats";
import type { Node } from "../src/schema/composition";
import { FPS } from "./_beats";

export type Level = "error" | "warn" | "info";
export type Finding = { level: Level; msg: string };

/** Flatten a beat's composition tree to its leaf nodes (containers recursed). */
function leaves(beat: Beat): Node[] {
  const out: Node[] = [];
  const walk = (nodes: Node[]): void => {
    for (const n of nodes) {
      if ("children" in n) walk(n.children);
      else out.push(n);
    }
  };
  walk(beat.components ?? []);
  return out;
}

/** The beat's headline text — the first `title` node's text, if any. */
const titleOf = (beat: Beat): string | undefined => {
  for (const n of leaves(beat)) if (n.type === "title") return n.text;
  return undefined;
};

/** Ranked findings for a parsed beats array. */
export function auditBeats(beats: Beat[]): Finding[] {
  const findings: Finding[] = [];
  const add = (level: Level, msg: string) => findings.push({ level, msg });

  // 1. Beat count — skill guidance is to keep it tight (3-6).
  if (beats.length < 2) add("warn", `only ${beats.length} beat — most videos want 3-6`);
  if (beats.length > 7) add("warn", `${beats.length} beats — tighten toward 3-6; long videos lose attention`);

  // 2. Per-beat duration (≈2-10s at 30fps).
  beats.forEach((b, i) => {
    const s = (b.durationInFrames / FPS).toFixed(1);
    const h = titleOf(b) ?? "";
    if (b.durationInFrames < 45) add("warn", `beat ${i + 1} "${h}" is ${s}s — too short to read`);
    else if (b.durationInFrames > 360) add("warn", `beat ${i + 1} "${h}" is ${s}s — likely too long`);
  });

  // 3. Headline length — short + declarative (the beat's `title` node text).
  beats.forEach((b, i) => {
    const h = titleOf(b);
    if (h && h.length > 48) add("warn", `beat ${i + 1} headline is ${h.length} chars — shorten ("${h.slice(0, 40)}…")`);
  });

  // 4. Motion monotony — every beat whose title sets an explicit enter uses the same one.
  const enters = beats
    .map((b) => leaves(b).find((n): n is Extract<Node, { type: "title" }> => n.type === "title")?.motion?.enter)
    .filter(Boolean);
  if (enters.length >= 3 && new Set(enters).size === 1)
    add("info", `every headline uses the "${enters[0]}" enter — vary it for rhythm`);

  // 5. Install/CTA closer — heuristic: last beat is centered/hero with a bash command or a badge/caption.
  const last = beats[beats.length - 1];
  const ls = leaves(last);
  const isCloser =
    (last.layout === "center" || last.layout === "hero") &&
    (ls.some((n) => n.type === "code" && n.code.lang === "bash") || ls.some((n) => n.type === "badge") || ls.some((n) => n.type === "caption"));
  if (!isCloser) add("info", "last beat doesn't look like an install/CTA closer (centered + install command)");

  return findings;
}

const order: Record<Level, number> = { error: 0, warn: 1, info: 2 };
/** Ranked error → warn → info (stable copy). */
export const rankFindings = (findings: Finding[]): Finding[] =>
  [...findings].sort((a, b) => order[a.level] - order[b.level]);

export const ICON: Record<Level, string> = { error: "✗", warn: "▲", info: "·" };
