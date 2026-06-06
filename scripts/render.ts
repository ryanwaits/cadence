/**
 * Render a beats module to MP4. Remotion `--props` accepts JSON only, so this
 * imports the authored `.ts`, validates it against the schema, serializes to a
 * temp JSON file, and hands that to the Remotion CLI. Code tokenization +
 * duration + dimensions happen in the composition's calculateMetadata.
 *
 *   bun run render src/content/streams.beats.ts [--format 16x9|1x1|9x16] [--frame N]
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { type Format } from "../src/schema/beats";
import { stagePublicDir } from "./_assets";
import { loadBeats } from "./_beats";
import { binPath, pkgFile } from "./_pkg";
import { resolveOutDir, resolveTheme } from "./_theme";

const args = process.argv.slice(2);
const getFlag = (name: string) => {
  const eq = args.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const file = args.find((a) => !a.startsWith("-"));
if (!file) {
  console.error("usage: bun run render <beats.ts> [--format 16x9|1x1|9x16] [--frame N]");
  process.exit(1);
}

// Accept either a `.beats.ts` module or a plain `.json` beats file.
const parsed = await loadBeats(file);

const fmt = getFlag("--format") as Format | undefined;
if (fmt) parsed.format = fmt;
const frame = getFlag("--frame");
const { theme, themeFile } = resolveTheme({ theme: getFlag("--theme"), themeFile: getFlag("--theme-file"), beatsFile: file });
const env: NodeJS.ProcessEnv = { ...process.env };
if (theme) env.REMOTION_VIDEO_THEME = theme;
if (themeFile) env.REMOTION_VIDEO_THEME_JSON = readFileSync(resolve(themeFile), "utf8");

const outDir = resolveOutDir({ outFlag: getFlag("--out"), beatsFile: file });
mkdirSync(outDir, { recursive: true });
const name = basename(file).replace(/\.beats\.(ts|js|json)$/, "").replace(/\.(ts|js|json)$/, "");
const propsPath = join(outDir, `.props-${name}-${parsed.format}.json`);
writeFileSync(propsPath, JSON.stringify(parsed));

const bin = binPath("remotion");
const common = [pkgFile("src/index.ts"), "Changelog"];
const suffix = theme && theme !== "default" ? `-${theme}` : "";
// Stage a merged public dir when the project supplies its own backgrounds.
const staged = stagePublicDir({ beatsFile: file, outDir });
const pub = staged ? [`--public-dir=${staged}`] : [];
const res = frame
  ? spawnSync(bin, ["still", ...common, join(outDir, `${name}-${parsed.format}${suffix}-f${frame}.png`), `--props=${propsPath}`, `--frame=${frame}`, ...pub], { stdio: "inherit", env })
  : spawnSync(bin, ["render", ...common, join(outDir, `${name}-${parsed.format}${suffix}.mp4`), `--props=${propsPath}`, "--image-format=jpeg", ...pub], { stdio: "inherit", env });
if (staged) rmSync(staged, { recursive: true, force: true });

process.exit(res.status ?? 0);
