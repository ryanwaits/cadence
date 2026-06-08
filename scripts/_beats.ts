/**
 * Shared beats helpers: load + validate a beats module, and compute per-beat
 * timings. Used by render / audit / storyboard so the "how do I read a beats
 * file" logic lives in one place. Beats are laid end-to-end by the Changelog
 * composition (`<Series.Sequence durationInFrames>`), so a beat's start frame is
 * the running sum of prior durations — see `src/components/Changelog.tsx`.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { changelogSchema, type Beat, type ChangelogVideo } from "../src/schema/beats";
import { normalizeVideo } from "../src/schema/normalize";

export const FPS = 30;

/** Load a `.ts`/`.js` module (default export) or a `.json` file, then validate.
 * Authoring sugar is normalized to canonical nodes before parsing (the single
 * desugar step — see `src/schema/normalize.ts`). */
export async function loadBeats(file: string): Promise<ChangelogVideo> {
  const raw = file.endsWith(".json")
    ? JSON.parse(readFileSync(resolve(file), "utf8"))
    : (await import(pathToFileURL(resolve(file)).href)).default;
  return changelogSchema.parse(normalizeVideo(raw));
}

export type BeatTiming = { start: number; mid: number; dur: number };

/**
 * Per-beat `{start, mid, dur}` frames + total. `mid` (start + ⌊dur/2⌋) is the
 * representative frame for a still — entrance motion has settled by then.
 */
export function beatTimings(beats: Beat[]): { timings: BeatTiming[]; totalFrames: number } {
  let start = 0;
  const timings = beats.map((b) => {
    const dur = b.durationInFrames;
    const t = { start, mid: start + Math.floor(dur / 2), dur };
    start += dur;
    return t;
  });
  return { timings, totalFrames: start };
}
