/**
 * `cadence fork <file> …` — copy an existing beats file with overrides applied
 * as pure DATA rewrites, then STOP (no render). A restyle / retarget verb: same
 * arc, new look / format / opener.
 *
 *   cadence fork hero.beats.json --template terminal --format 9x16
 *   cadence fork hero.beats.json --headline "Now in beta" --name hero-beta
 *
 * Overrides:
 *   --template <style>  → set the top-level `template` doc field (one look/video)
 *   --format <f>        → set the top-level `format`
 *   --headline "<h>"    → overwrite the opener beat's headline (legacy or `title`)
 *   --theme <name>      → NOT a doc field (env/.cadence-resolved); surfaced as a hint
 *   --kind <k>          → re-derive the arc — needs a source, so use `cadence new`
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { loadBeats } from "./_beats";
import { assertTemplate, findCadenceDir } from "./_theme";
import type { Format } from "../src/schema/beats";

const args = process.argv.slice(2);
const flag = (n: string) => {
  const eq = args.find((a) => a.startsWith(`${n}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(n);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : undefined;
};

const file = args.find((a) => !a.startsWith("-"));
if (!file) {
  console.error(
    "usage: cadence fork <file> [--kind <k>] [--template <style>] [--theme <name>]\n" +
      "                   [--format 16x9|1x1|9x16] [--headline '<h>'] [--name <slug>] [--out <dir>]",
  );
  process.exit(1);
}

// `--kind` re-derives the structural arc, which requires a manifest source. Fork
// has none (it's a restyle of existing beats), so there's no lossy reverse path —
// changing the kind means re-running `new` with a source. Fail clearly.
const kind = flag("--kind");
if (kind) {
  console.error(
    `--kind changes the structural arc, which needs a source. Re-run with:\n` +
      `  cadence new ${kind} --release <owner/name> | --changelog <path> | --repo <path>`,
  );
  process.exit(1);
}

const parsed = await loadBeats(file);

// --template → top-level doc field (one look per video, mirrors --format).
const template = assertTemplate(flag("--template"));
if (template) parsed.template = template;

// --format → top-level doc field.
const format = flag("--format") as Format | undefined;
if (format) parsed.format = format;

// --headline → overwrite the opener beat's `title` node (adding one if absent).
const headline = flag("--headline");
if (headline) {
  const opener = parsed.beats[0];
  if (opener) {
    const title = opener.components.find((c) => c.type === "title");
    if (title && title.type === "title") title.text = headline;
    else opener.components.unshift({ type: "title", placement: {}, text: headline });
  }
}

// --theme isn't a doc field (env/.cadence-resolved). Surface the choice so it
// isn't silently dropped — it applies at render/storyboard time.
const theme = flag("--theme");
if (theme) console.error(`· note: --theme ${theme} applies at render time (pass it to storyboard/create); it is not stored in the beats file`);

/** A filesystem-safe slug from a freeform name. */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "video";

// Output: --name overrides; default derives from the source filename + "-fork".
const baseName = basename(file).replace(/\.beats\.(ts|js|json)$/, "").replace(/\.(ts|js|json)$/, "");
const slug = slugify(flag("--name") ?? `${baseName}-fork`);
const filename = `${slug}.beats.json`;

const outFlag = flag("--out");
let outPath: string;
if (outFlag) {
  const dir = resolve(outFlag);
  mkdirSync(dir, { recursive: true });
  outPath = join(dir, filename);
} else {
  // Anchor on the source file's directory: a project's `.cadence/` if one is
  // discoverable from there, else alongside the source file.
  const sourceDir = dirname(resolve(file));
  const cad = findCadenceDir(sourceDir);
  if (cad) {
    mkdirSync(cad, { recursive: true });
    outPath = join(cad, filename);
  } else {
    outPath = join(sourceDir, filename);
  }
}

writeFileSync(outPath, `${JSON.stringify(parsed, null, 2)}\n`);

console.log(`\nwrote ${outPath}`);
console.log(`  ${parsed.beats.length} beats · ${parsed.format} · forked from ${basename(file)}${parsed.template ? ` · template ${parsed.template}` : ""}`);
console.log(`\n→ cadence storyboard ${outPath}\n`);
