/**
 * One command: a repo → a video, no LLM. Reads the latest release/changelog,
 * applies a kind (structural arc), and renders.
 *
 *   tsx scripts/make.ts --release stx-labs/clarinet --install "brew install clarinet"
 *   tsx scripts/make.ts --release owner/name --kind launch --template terminal --format 9x16
 *   tsx scripts/make.ts --changelog ./CHANGELOG.md --product my-pkg --install "npm i my-pkg" --frame 230
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { author, parseBackground } from "./_author";
import { KINDS } from "../src/kinds";
import { runScript } from "./_pkg";
import { resolveOutDir } from "./_theme";

const args = process.argv.slice(2);
const flag = (n: string) => {
  const eq = args.find((a) => a.startsWith(`${n}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(n);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : undefined;
};

// 1. Source → manifest → kind → beats (the shared authoring pipeline).
const release = flag("--release");
const changelog = flag("--changelog");
if (!release && !changelog) {
  console.error("usage: cadence create --release <owner/name> | --changelog <path> [--kind K] [--template <style>] [--background B] [--format F] [--theme T] [--frame N]");
  process.exit(1);
}

// `--kind` (the structural arc) vs `--template` (the styling layer) — the same split
// as the rest of the CLI. `--template` historically named the ARC; keep that working
// as a DEPRECATED alias when its value is a known kind, otherwise it's the styling
// template (stamped into the beats so the look travels with them).
const kindFlag = flag("--kind");
const templateFlag = flag("--template");
let kind = kindFlag;
let styleTemplate = templateFlag;
if (!kindFlag && templateFlag && KINDS[templateFlag]) {
  console.error("· note: --template naming the arc is deprecated — use --kind (treating it as the kind)");
  kind = templateFlag;
  styleTemplate = undefined;
}

const statValue = flag("--stat-value");
const { beats, kind: resolvedKind, manifest } = author({
  kind: kind ?? "changelog",
  template: styleTemplate,
  source: { release, tag: flag("--tag"), changelog, install: flag("--install"), product: flag("--product") },
  authorOpts: {
    format: flag("--format") as never,
    background: parseBackground(flag("--background")),
    headline: flag("--headline"),
    stat: statValue ? { value: statValue, label: flag("--stat-label") ?? "", sub: flag("--stat-sub") } : undefined,
  },
});

console.error(`· ${manifest.product} ${manifest.version}: ${manifest.features.length} features${manifest.dropped ? ` (+${manifest.dropped} dropped)` : ""} → ${resolvedKind}`);

// 2. Write beats JSON, then render — or, with --dry-run, storyboard it (preview
// sheet + plan, no MP4). Outputs go to the project's .cadence/out (or --out).
const outDir = resolveOutDir({ outFlag: flag("--out") });
mkdirSync(outDir, { recursive: true });
const jsonPath = join(outDir, `make-${manifest.product}.beats.json`);
writeFileSync(jsonPath, JSON.stringify(beats));
// Pin the child to the same out dir so beats + renders colocate.
const outArgs = ["--out", outDir];

if (args.includes("--dry-run")) {
  // repo → storyboard. --frame is meaningless here; --theme-file is supported.
  const passthru = ["--format", "--theme", "--theme-file"].flatMap((f) => (flag(f) ? [f, flag(f)!] : []));
  runScript("scripts/storyboard.ts", [jsonPath, ...passthru, ...outArgs]);
}

const passthru = ["--format", "--theme", "--frame"].flatMap((f) => (flag(f) ? [f, flag(f)!] : []));
runScript("scripts/render.ts", [jsonPath, ...passthru, ...outArgs]);
