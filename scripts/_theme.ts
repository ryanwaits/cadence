/**
 * Theme resolution shared by render / storyboard. Precedence:
 *   explicit --theme-file  >  --theme <name>  >  a project-local
 *   `.cadence/theme.json` (discovered near the beats file)  >  default.
 *
 * The project-local convention lets a repo capture its own brand (colors, mono
 * font, code syntax theme, code-window chrome) in `<project>/.cadence/theme.json`
 * — cadence picks it up automatically when run against that project, with no
 * brand-specific files living in the cadence engine itself.
 */
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { THEMES } from "../src/theme";

/** Walk up from `start` (max 6 levels) for a `.cadence/theme.json`. */
export function discoverProjectTheme(start: string): string | undefined {
  let dir = resolve(start);
  for (let i = 0; i < 6; i++) {
    const p = join(dir, ".cadence", "theme.json");
    if (existsSync(p)) return p;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
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
