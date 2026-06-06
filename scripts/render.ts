/**
 * Render a beats module to MP4. Remotion `--props` accepts JSON only, so this
 * imports the authored `.ts`, validates it against the schema, serializes to a
 * temp JSON file, and hands that to the Remotion CLI. Code tokenization +
 * duration + dimensions happen in the composition's calculateMetadata.
 *
 *   bun run render src/content/streams.beats.ts [--format 16x9|1x1|9x16] [--frame N]
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { type Format } from "../src/schema/beats";
import { THEMES } from "../src/theme";
import { loadBeats } from "./_beats";
import { binPath, pkgFile } from "./_pkg";

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
const theme = getFlag("--theme");
const themeFile = getFlag("--theme-file");
if (theme && !themeFile && !THEMES[theme]) {
  console.error(`unknown --theme "${theme}". have: ${Object.keys(THEMES).join(", ")}`);
  process.exit(1);
}
const env: NodeJS.ProcessEnv = { ...process.env };
if (theme) env.REMOTION_VIDEO_THEME = theme;
if (themeFile) env.REMOTION_VIDEO_THEME_JSON = readFileSync(resolve(themeFile), "utf8");

mkdirSync("out", { recursive: true });
const name = basename(file).replace(/\.beats\.(ts|js|json)$/, "").replace(/\.(ts|js|json)$/, "");
const propsPath = join("out", `.props-${name}-${parsed.format}.json`);
writeFileSync(propsPath, JSON.stringify(parsed));

const bin = binPath("remotion");
const common = [pkgFile("src/index.ts"), "Changelog"];
const suffix = theme && theme !== "default" ? `-${theme}` : "";
const res = frame
  ? spawnSync(bin, ["still", ...common, join("out", `${name}-${parsed.format}${suffix}-f${frame}.png`), `--props=${propsPath}`, `--frame=${frame}`], { stdio: "inherit", env })
  : spawnSync(bin, ["render", ...common, join("out", `${name}-${parsed.format}${suffix}.mp4`), `--props=${propsPath}`, "--image-format=jpeg"], { stdio: "inherit", env });

process.exit(res.status ?? 0);
