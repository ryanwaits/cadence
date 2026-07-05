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
import { ZodError } from "zod";
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

/** Print a schema/load failure as issue paths (not a raw ZodError stack) or a
 * one-line message for anything else (e.g. ENOENT). Shared by every verb so
 * bad beats files fail the same, readable way everywhere (was: only `edit`). */
export function printBeatsError(file: string, err: unknown): void {
  if (err instanceof ZodError) {
    console.error(`✗ invalid beats file ${file} — fix these:\n`);
    for (const issue of err.issues) {
      console.error(`  ${issue.path.length ? issue.path.join(".") : "(root)"}: ${issue.message}`);
    }
  } else {
    console.error(`✗ could not load ${file}: ${(err as Error).message}`);
  }
}

/** `loadBeats`, but print a formatted error and exit(1) instead of throwing —
 * for verbs that have no additional recovery to do on a load failure. */
export async function loadBeatsOrExit(file: string): Promise<ChangelogVideo> {
  try {
    return await loadBeats(file);
  } catch (err) {
    printBeatsError(file, err);
    process.exit(1);
  }
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
