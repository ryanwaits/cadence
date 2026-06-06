/**
 * Project-local `.cadence/` resolution shared by render / storyboard / make.
 *
 * A repo captures its own cadence setup under `<project>/.cadence/`:
 *   - `theme.json` — brand (colors, mono font, code syntax theme, code chrome)
 * cadence discovers it automatically when run against the project, and writes
 * **outputs alongside it** (`<project>/.cadence/out/`) so renders are anchored to
 * the project, not the current directory. No project-specific files live in the
 * cadence engine itself.
 *
 * Theme precedence:  --theme-file  >  --theme <name>  >  .cadence/theme.json  >  default.
 * Output dir:        --out <dir>   >  <project>/.cadence/out               >  ./out.
 */
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { THEMES } from "../src/theme";

/** Walk up from `start` (max 6 levels) for a `.cadence` directory. */
export function findCadenceDir(start: string): string | undefined {
  let dir = resolve(start);
  for (let i = 0; i < 6; i++) {
    const p = join(dir, ".cadence");
    if (existsSync(p)) return p;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

/** A project's `.cadence/theme.json`, if one exists near `start`. */
export function discoverProjectTheme(start: string): string | undefined {
  const cad = findCadenceDir(start);
  if (!cad) return undefined;
  const p = join(cad, "theme.json");
  return existsSync(p) ? p : undefined;
}

/**
 * Where renders are written. Precedence: an explicit `--out <dir>` > a project's
 * `<project>/.cadence/out` (so outputs are anchored to the project regardless of
 * cwd) > `./out`. `beatsFile` (when present) anchors discovery near the beats
 * file; otherwise discovery starts from the current directory.
 */
export function resolveOutDir(opts: { outFlag?: string; beatsFile?: string }): string {
  if (opts.outFlag) return resolve(opts.outFlag);
  const start = opts.beatsFile ? dirname(resolve(opts.beatsFile)) : process.cwd();
  const cad = findCadenceDir(start);
  return cad ? join(cad, "out") : "out";
}

/**
 * Resolve which theme to use. Returns the (possibly auto-discovered) `themeFile`
 * and/or named `theme`. Exits on an unknown named theme. Logs when a project
 * theme is auto-discovered so it's never a silent surprise.
 */
export function resolveTheme(opts: { theme?: string; themeFile?: string; beatsFile?: string }): {
  theme?: string;
  themeFile?: string;
} {
  let { theme, themeFile } = opts;
  if (!themeFile && !theme && opts.beatsFile) {
    const found = discoverProjectTheme(dirname(resolve(opts.beatsFile)));
    if (found) {
      themeFile = found;
      console.error(`· using project theme ${found}`);
    }
  }
  if (theme && !themeFile && !THEMES[theme]) {
    console.error(`unknown --theme "${theme}". have: ${Object.keys(THEMES).join(", ")}`);
    process.exit(1);
  }
  return { theme, themeFile };
}
