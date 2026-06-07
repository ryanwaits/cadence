/**
 * `cadence new <kind> …` — build a DURABLE beats file from a kind + source, then
 * STOP (no render). The user owns the written file; the next step is a preview.
 *
 *   cadence new launch --release owner/name --install "npm i pkg"
 *   cadence new changelog --changelog ./CHANGELOG.md --format 9x16
 *   cadence new announcement                       # no source ⇒ honest placeholder
 *
 * Output path: `--out <dir>/<slug>.beats.json` if given; else a project's
 * `.cadence/<slug>.beats.json` when a `.cadence/` dir is discoverable; else
 * `./<slug>.beats.json`. Distinct from `make` (ephemeral repo→MP4) and `create`
 * (beats→MP4) — `new` produces a source file the skill / user iterates on.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { author, parseBackground } from "./_author";
import { findCadenceDir } from "./_theme";

const args = process.argv.slice(2);
const flag = (n: string) => {
  const eq = args.find((a) => a.startsWith(`${n}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(n);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : undefined;
};

/** First positional (the kind name). */
const kind = args.find((a) => !a.startsWith("-"));
if (!kind) {
  console.error(
    "usage: cadence new <kind> [--release o/n | --changelog <path> | --repo <path>] [--install '<cmd>']\n" +
      "                  [--template <style>] [--theme <name>] [--format 16x9|1x1|9x16] [--headline '<h>'] [--name <slug>] [--out <dir>]",
  );
  process.exit(1);
}

/** A filesystem-safe slug from a freeform name. */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "video";

const statValue = flag("--stat-value");
const { beats, kind: resolvedKind, manifest } = author({
  kind,
  source: {
    release: flag("--release"),
    tag: flag("--tag"),
    changelog: flag("--changelog"),
    repo: flag("--repo"),
    install: flag("--install"),
    product: flag("--product"),
  },
  template: flag("--template"),
  authorOpts: {
    format: flag("--format") as never,
    background: parseBackground(flag("--background")),
    headline: flag("--headline"),
    stat: statValue ? { value: statValue, label: flag("--stat-label") ?? "", sub: flag("--stat-sub") } : undefined,
  },
});

// --theme isn't a doc field (env/.cadence-resolved). Surface it so the choice
// isn't silently dropped — it applies at render/storyboard time, not in data.
const theme = flag("--theme");
if (theme) console.error(`· note: --theme ${theme} applies at render time (pass it to storyboard/create); it is not stored in the beats file`);

// Output path: --name overrides the slug; the kind + product form the default.
const slug = slugify(flag("--name") ?? `${manifest.product}-${resolvedKind}`);
const filename = `${slug}.beats.json`;

const outFlag = flag("--out");
let outPath: string;
if (outFlag) {
  const dir = resolve(outFlag);
  mkdirSync(dir, { recursive: true });
  outPath = join(dir, filename);
} else {
  const cad = findCadenceDir(process.cwd());
  if (cad) {
    mkdirSync(cad, { recursive: true });
    outPath = join(cad, filename);
  } else {
    outPath = resolve(filename);
  }
}

writeFileSync(outPath, `${JSON.stringify(beats, null, 2)}\n`);

console.log(`\nwrote ${outPath}`);
console.log(`  ${beats.beats.length} beats · ${beats.format ?? "16x9"} · kind ${resolvedKind}${beats.template ? ` · template ${beats.template}` : ""}`);
console.log(`\n→ cadence storyboard ${outPath}\n`);
