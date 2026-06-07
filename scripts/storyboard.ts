/**
 * `cadence storyboard <beats>` — a dry-run / mock: print the whole video plan
 * (beat-by-beat outline + pacing) AND render a single contact-sheet PNG with one
 * representative still per beat — no MP4. The cheap artifact a user + the skill
 * iterate on (features, theme, background) before committing to a full render.
 *
 * Per-beat stills are rendered at the beat's mid frame (entrance motion settled),
 * downscaled, encoded as data URIs, and laid into the `Storyboard` composition —
 * data URIs (not staticFile/public) so it works from a global install too.
 *
 *   cadence storyboard src/content/streams-launch.beats.ts [--theme slate] [--format 9x16]
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { type Beat, type Format } from "../src/schema/beats";
import type { StoryboardCell, StoryboardProps } from "../src/components/Storyboard";
import { stagePublicDir } from "./_assets";
import { auditBeats, ICON, rankFindings } from "./_audit";
import { beatTimings, FPS, loadBeats } from "./_beats";
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
  console.error("usage: cadence storyboard <beats.ts|.json> [--theme <name>] [--theme-file <path>] [--format 16x9|1x1|9x16]");
  process.exit(1);
}

const { theme, themeFile } = resolveTheme({ theme: getFlag("--theme"), themeFile: getFlag("--theme-file"), beatsFile: file });

/** Short label for a beat's backdrop (omitted background = the procedural default). */
const bgTag = (b: Beat): string => {
  const bg = b.background;
  if (!bg) return "shapes";
  if (bg.src) return "image";
  if (bg.gradient) return "gradient";
  if (bg.solid) return "solid";
  return "shapes";
};

const parsed = await loadBeats(file);
const fmt = (getFlag("--format") as Format | undefined) ?? parsed.format;
parsed.format = fmt;
const themeLabel = themeFile ? `custom (${basename(themeFile)})` : (theme ?? "default");
const { timings, totalFrames } = beatTimings(parsed.beats);
const name = basename(file).replace(/\.beats\.(ts|js|json)$/, "").replace(/\.(ts|js|json)$/, "");

// --- 1. The plan (text) ---
console.log(`\nstoryboard: ${file}`);
console.log(`  ${parsed.beats.length} beats · ${(totalFrames / FPS).toFixed(1)}s · ${fmt} · theme ${themeLabel}\n`);

parsed.beats.forEach((b, i) => {
  const t = timings[i];
  const start = `${(t.start / FPS).toFixed(1)}s`.padStart(6);
  const dur = `${(t.dur / FPS).toFixed(1)}s`.padStart(5);
  const layout = b.layout.padEnd(6);
  const panel = (b.panel?.kind ?? "—").padEnd(14);
  const bg = bgTag(b).padEnd(8);
  console.log(`  ${String(i + 1).padStart(2)}  @${start}  ${dur}  ${layout}  ${panel}  ${bg}  ${b.headline}`);
});

const findings = rankFindings(auditBeats(parsed.beats));
if (findings.length) {
  console.log("");
  for (const f of findings) console.log(`  ${ICON[f.level]} ${f.msg}`);
}

// --- 2. The sheet (one still per beat → a single PNG) ---
const env: NodeJS.ProcessEnv = { ...process.env };
if (theme) env.REMOTION_VIDEO_THEME = theme;
if (themeFile) env.REMOTION_VIDEO_THEME_JSON = readFileSync(themeFile, "utf8");

const outDir = resolveOutDir({ outFlag: getFlag("--out"), beatsFile: file });
mkdirSync(outDir, { recursive: true });
const tmp = join(outDir, `.sb-${name}`);
mkdirSync(tmp, { recursive: true });
const propsPath = join(tmp, "props.json");
writeFileSync(propsPath, JSON.stringify(parsed));

const bin = binPath("remotion");
const entry = pkgFile("src/index.ts");
// Stage a merged public dir so project backgrounds resolve in the per-beat stills.
const staged = stagePublicDir({ beatsFile: file, outDir });
const pub = staged ? [`--public-dir=${staged}`] : [];
const TRANSPARENT_PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";

console.log(`\nrendering ${parsed.beats.length} stills…`);
const cells: StoryboardCell[] = parsed.beats.map((b, i) => {
  const out = join(tmp, `beat-${i}.png`);
  const res = spawnSync(
    bin,
    ["still", entry, "Changelog", out, `--props=${propsPath}`, `--frame=${timings[i].mid}`, "--scale=0.33", ...pub],
    { stdio: ["ignore", "ignore", "inherit"], env },
  );
  let img = TRANSPARENT_PX;
  if (res.status === 0 && existsSync(out) && statSync(out).size > 0) {
    img = `data:image/png;base64,${readFileSync(out).toString("base64")}`;
  } else {
    console.warn(`  ! beat ${i + 1} still failed — placeholder used`);
  }
  return { img, headline: b.headline ?? "", panel: b.panel?.kind ?? "—", seconds: `${(b.durationInFrames / FPS).toFixed(1)}s` };
});

const sheetProps: StoryboardProps = { format: fmt, name, cells };
const sheetPropsPath = join(tmp, "sheet.json");
writeFileSync(sheetPropsPath, JSON.stringify(sheetProps));

const outPng = join(outDir, `${name}.storyboard.png`);
const sheet = spawnSync(bin, ["still", entry, "Storyboard", outPng, `--props=${sheetPropsPath}`], {
  stdio: ["ignore", "ignore", "inherit"],
  env,
});
rmSync(tmp, { recursive: true, force: true });
if (staged) rmSync(staged, { recursive: true, force: true });

if (sheet.status !== 0) {
  console.error("\n✗ storyboard sheet render failed");
  process.exit(sheet.status ?? 1);
}
console.log(`\n→ ${outPng}\n`);
