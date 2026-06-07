/**
 * One command: a repo → a video, no LLM. Reads the latest release/changelog,
 * applies a kind (structural arc), and renders.
 *
 *   tsx scripts/make.ts --release stx-labs/clarinet --install "brew install clarinet"
 *   tsx scripts/make.ts --release owner/name --template changelog-reel --background "gradient:#312e81,#0b1120" --format 9x16
 *   tsx scripts/make.ts --changelog ./CHANGELOG.md --product my-pkg --install "npm i my-pkg" --frame 230
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { author, parseBackground } from "./_author";
import { binPath, pkgFile } from "./_pkg";
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
  console.error("usage: make.ts --release <owner/name> | --changelog <path> [--template T] [--background B] [--format F] [--theme T] [--frame N]");
  process.exit(1);
}

const statValue = flag("--stat-value");
const { beats, kind, manifest } = author({
  kind: flag("--template") ?? "changelog",
  source: { release, tag: flag("--tag"), changelog, install: flag("--install"), product: flag("--product") },
  authorOpts: {
    format: flag("--format") as never,
    background: parseBackground(flag("--background")),
    headline: flag("--headline"),
    stat: statValue ? { value: statValue, label: flag("--stat-label") ?? "", sub: flag("--stat-sub") } : undefined,
  },
});

console.error(`· ${manifest.product} ${manifest.version}: ${manifest.features.length} features${manifest.dropped ? ` (+${manifest.dropped} dropped)` : ""} → ${kind}`);

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
  const res = spawnSync(binPath("tsx"), [pkgFile("scripts/storyboard.ts"), jsonPath, ...passthru, ...outArgs], { stdio: "inherit" });
  process.exit(res.status ?? 0);
}

const passthru = ["--format", "--theme", "--frame"].flatMap((f) => (flag(f) ? [f, flag(f)!] : []));
const res = spawnSync(binPath("tsx"), [pkgFile("scripts/render.ts"), jsonPath, ...passthru, ...outArgs], { stdio: "inherit" });
process.exit(res.status ?? 0);
