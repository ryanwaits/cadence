/**
 * One command: a repo → a video, no LLM. Reads the latest release/changelog,
 * applies a template, and renders.
 *
 *   tsx scripts/make.ts --release stx-labs/clarinet --install "brew install clarinet"
 *   tsx scripts/make.ts --release owner/name --template changelog-reel --background "gradient:#312e81,#0b1120" --format 9x16
 *   tsx scripts/make.ts --changelog ./CHANGELOG.md --product my-pkg --install "npm i my-pkg" --frame 230
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { manifestFromChangelogText, manifestFromReleaseBody } from "../src/adapters";
import type { BackgroundSpec } from "../src/kinds";
import { KINDS } from "../src/kinds";
import { binPath, pkgFile } from "./_pkg";
import { resolveOutDir } from "./_theme";

const args = process.argv.slice(2);
const flag = (n: string) => {
  const eq = args.find((a) => a.startsWith(`${n}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(n);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : undefined;
};

function parseBackground(s?: string): BackgroundSpec | undefined {
  if (!s) return undefined;
  if (s === "shapes") return { shapes: true };
  const [kind, rest] = [s.slice(0, s.indexOf(":")), s.slice(s.indexOf(":") + 1)];
  if (kind === "gradient") {
    const [from, to] = rest.split(",");
    return { gradient: [from, to], angle: 155, treatment: "kenburns" };
  }
  if (kind === "solid") return { solid: rest, treatment: "static" };
  if (kind === "image") return { src: rest.includes("/") ? rest : `backgrounds/${rest}`, treatment: "kenburns" };
  return undefined;
}

// 1. Source → manifest
const release = flag("--release");
const changelog = flag("--changelog");
const install = flag("--install");
let manifest;
if (release) {
  const tag = flag("--tag");
  const res = spawnSync("gh", ["release", "view", ...(tag ? [tag] : []), "--repo", release, "--json", "tagName,name,publishedAt,body"], { encoding: "utf8" });
  if (res.status !== 0) { console.error(res.stderr); process.exit(1); }
  const r = JSON.parse(res.stdout);
  manifest = manifestFromReleaseBody({ product: flag("--product") ?? basename(release), version: r.tagName ?? r.name ?? "", body: r.body ?? "", date: r.publishedAt?.slice(0, 10), install, repoUrl: `https://github.com/${release}` });
} else if (changelog) {
  manifest = manifestFromChangelogText(readFileSync(changelog, "utf8"), { product: flag("--product") ?? "package", install });
} else {
  console.error("usage: make.ts --release <owner/name> | --changelog <path> [--template T] [--background B] [--format F] [--theme T] [--frame N]");
  process.exit(1);
}

// 2. Kind (structural arc) → beats
const templateName = flag("--template") ?? "changelog-reel";
const kindEntry = KINDS[templateName];
if (!kindEntry) { console.error(`unknown template "${templateName}". have: ${Object.keys(KINDS).join(", ")}`); process.exit(1); }
const template = kindEntry.fn;
const statValue = flag("--stat-value");
const beats = template(manifest, {
  format: flag("--format") as never,
  background: parseBackground(flag("--background")),
  headline: flag("--headline"),
  stat: statValue ? { value: statValue, label: flag("--stat-label") ?? "", sub: flag("--stat-sub") } : undefined,
});

console.error(`· ${manifest.product} ${manifest.version}: ${manifest.features.length} features${manifest.dropped ? ` (+${manifest.dropped} dropped)` : ""} → ${templateName}`);

// 3. Write beats JSON, then render — or, with --dry-run, storyboard it (preview
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
