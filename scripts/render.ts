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
import { TEMPLATES } from "../src/templates/registry";
import { stagePublicDir } from "./_assets";
import { loadBeatsOrExit } from "./_beats";
import { binPath, pkgFile } from "./_pkg";
import { assertTemplate, resolveOutDir, resolveTheme } from "./_theme";

const args = process.argv.slice(2);
const getFlag = (name: string) => {
  const eq = args.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const file = args.find((a) => !a.startsWith("-"));
if (!file) {
  console.error("usage: cadence render <beats.ts|.json> [--format 16x9|1x1|9x16] [--frame N]");
  process.exit(1);
}

// Accept either a `.beats.ts` module or a plain `.json` beats file.
const parsed = await loadBeatsOrExit(file);

const fmt = getFlag("--format") as Format | undefined;
if (fmt) parsed.format = fmt;
const frame = getFlag("--frame");

// Template (stylistic layer): `--template` wins; else the doc's `template` field.
const templateName = assertTemplate(getFlag("--template") ?? parsed.template);
if (templateName) parsed.template = templateName;

const rawTheme = getFlag("--theme");
const rawThemeFile = getFlag("--theme-file");
const { theme, themeFile } = resolveTheme({ theme: rawTheme, themeFile: rawThemeFile, beatsFile: file });
const env: NodeJS.ProcessEnv = { ...process.env };
if (templateName) env.REMOTION_VIDEO_TEMPLATE = templateName;
// Seed the theme from the template's bound theme when none was given — an
// explicit `--theme`/`--theme-file` (or an auto-discovered project theme) wins.
if (templateName && !theme && !themeFile && TEMPLATES[templateName]) {
  env.REMOTION_VIDEO_THEME = TEMPLATES[templateName].theme;
}
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

// A launch failure (e.g. remotion binary missing) must never read as a silent
// success — res.status would be null, and `?? 0` would exit green.
if (res.error) {
  console.error(`✗ failed to launch remotion: ${res.error.message}`);
  process.exit(1);
}

// `--poster [frame]` renders a still for the social thumbnail (most platforms
// otherwise grab frame 0). Default to a settled frame near the end of the first
// beat, where its content has fully revealed — never frame 0.
const posterFlag = getFlag("--poster");
if (!frame && args.includes("--poster") && res.status === 0) {
  const firstDur = parsed.beats[0]?.durationInFrames ?? 60;
  const total = parsed.beats.reduce((n, b) => n + b.durationInFrames, 0);
  const posterFrame =
    posterFlag && /^\d+$/.test(posterFlag) ? Number(posterFlag) : Math.max(1, Math.min(firstDur - 8, total - 1));
  spawnSync(
    bin,
    ["still", ...common, join(outDir, `${name}-${parsed.format}${suffix}-poster.png`), `--props=${propsPath}`, `--frame=${posterFrame}`, ...pub],
    { stdio: "inherit", env },
  );
}
if (staged) rmSync(staged, { recursive: true, force: true });

process.exit(res.status ?? 1);
