/**
 * `create` routing: a beats-like positional → render/storyboard; else the repo
 * flow (make). Extracted so the sniff is flag-aware — a *flag value* that
 * happens to end in `.json`/`.ts` (e.g. `--theme-file themes/acme.json`) must
 * never be mistaken for the beats positional (see plan 002).
 */

/** Flags that consume the next token as a value (union across all verb scripts). */
export const VALUE_FLAGS = new Set([
  "--release", "--tag", "--changelog", "--repo", "--install", "--product",
  "--kind", "--template", "--theme", "--theme-file", "--format", "--frame",
  "--out", "--name", "--headline", "--background", "--enter", "--exit",
  "--stat-value", "--stat-label", "--stat-sub", "--beat", "--poster",
]);

/** First true positional: skips flags and the value token following a VALUE_FLAG.
 * Caveat: `--poster` takes an OPTIONAL value (bare `--poster` or `--poster 150`,
 * see `scripts/render.ts`). Treating it as always value-consuming could in
 * theory swallow a positional that immediately follows a bare `--poster`, but a
 * beats positional never follows `--poster` in documented usage — accepted edge. */
export function findPositional(args: string[], test: (a: string) => boolean): string | undefined {
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("-")) {
      if (VALUE_FLAGS.has(a)) i++;
      continue;
    }
    if (test(a)) return a;
  }
  return undefined;
}

/** `create` merges the repo flow (make) and the beats-file flow (render): a
 * positional beats-like file routes to render; otherwise to make. */
export function resolveCreateScript(args: string[]): string {
  const beatsFile = findPositional(args, (a) => /\.(beats\.)?(ts|js|json)$/.test(a));
  if (beatsFile) return args.includes("--dry-run") ? "scripts/storyboard.ts" : "scripts/render.ts";
  return "scripts/make.ts";
}
