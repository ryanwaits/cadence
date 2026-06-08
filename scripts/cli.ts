/**
 * Unified front door. `cadence <command> …` dispatches to the pieces.
 *
 *   cadence create --release stx-labs/clarinet --install "brew install clarinet"
 *   cadence create src/content/x.beats.ts --format 9x16   # a beats file → video
 *   cadence study --from-url https://acme.dev --name acme
 *   cadence audit src/content/x.beats.ts
 *   cadence redesign src/content/x.beats.ts --theme slate
 */
import { spawnSync } from "node:child_process";
import { type KindEntry, KINDS } from "../src/kinds";
import { TEMPLATES } from "../src/templates/registry";
import { THEMES } from "../src/theme";
import { binPath, pkgFile } from "./_pkg";

const [rawSub, ...rest] = process.argv.slice(2);

// Legacy verb aliases → canonical intent verbs.
const ALIAS: Record<string, string> = { make: "create", theme: "study" };
const sub = rawSub ? (ALIAS[rawSub] ?? rawSub) : rawSub;

// Verb → script. `create` is resolved dynamically (repo flow vs. beats file).
const SCRIPTS: Record<string, string> = {
  new: "scripts/new.ts", // kind + source → a durable beats file (no render)
  fork: "scripts/fork.ts", // a beats file → a restyled/retargeted copy (no render)
  edit: "scripts/edit.ts", // validate + normalize a beats file (deterministic gate)
  guide: "scripts/guide.ts", // interactive walkthrough
  render: "scripts/render.ts", // a beats file → a video (create delegates here)
  storyboard: "scripts/storyboard.ts", // a beats file → a preview sheet (no MP4)
  inspect: "scripts/inspect.ts", // a beats file → computed regions/timings/colors (json)
  study: "scripts/theme.ts", // brand color / URL / screenshot → a theme
  audit: "scripts/audit.ts", // check a beats file for issues
  redesign: "scripts/redesign.ts", // re-skin a beats file
  changes: "scripts/changes.ts", // a repo → an UpdateManifest
  art: "scripts/generate-art.ts", // optional painterly background pack
  capabilities: "scripts/capabilities.ts", // the machine-readable beat vocabulary (json)
};

const HELP = `cadence — turn a repo / release into a changelog or announcement video.

author (kind → a durable beats file, no render):
  new        a kind + source → a beats file you own   cadence new launch --release owner/name --install "npm i pkg"
  fork       a beats file → a restyled/retargeted copy cadence fork x.beats.json --template terminal --format 9x16
  edit       validate + normalize a beats file (gate)  cadence edit x.beats.json   (the skill supplies the NL edit)

render:
  create     a repo OR a beats file → a video     cadence create --release owner/name --install "npm i pkg"
  storyboard a beats file → a preview sheet         cadence storyboard x.beats.json (or: cadence create … --dry-run)
  inspect    computed regions/timings/colors (json)  cadence inspect x.beats.json --beat <id>
  redesign   re-skin a beats file (new look)        cadence redesign x.beats.json --theme slate

setup + checks:
  study      a brand color / URL → a theme         cadence study --from-url https://acme.dev --name acme
  audit      check a beats file for issues          cadence audit x.beats.json
  capabilities  the full beat vocabulary (json)     cadence capabilities   (every node/panel/token/preset + defaults)
  guide      interactive walkthrough (start here)   cadence guide

utilities:
  render     a beats file → a video (create delegates here for beats files)
  changes    a repo → an UpdateManifest (json)
  art        generate painterly backgrounds (optional pack, needs OPENAI_API_KEY)
  kinds      list structural arcs (launch, changelog, milestone, …)
  templates  list stylistic templates (look + bound theme)
  themes     list token themes (colors/fonts)

axes: kind = which beats in what order · template = how it looks · theme = colors/fonts
flags shared by create/render/redesign: --format 16x9|1x1|9x16, --template <style>, --theme <name>, --theme-file <path>, --frame <n>, --out <dir>
outputs: new/fork write to <project>/.cadence/<slug>.beats.json (else ./); renders to <project>/.cadence/out (else ./out). override with --out
preview before rendering: cadence storyboard <beats>  ·  cadence create … --dry-run  (plan + one still per beat, no MP4)`;

if (!sub || sub === "help" || sub === "--help") {
  console.log(HELP);
  process.exit(0);
}
if (sub === "kinds") {
  // Structural arcs (which beats, what order). Dedupe back-compat alias keys
  // that point at an entry already shown; print each entry's listing metadata.
  const seen = new Set<KindEntry>();
  const entries = Object.values(KINDS).filter((e) => !seen.has(e) && (seen.add(e), true));
  console.log("kinds (structural arcs — which beats, what order):\n");
  for (const e of entries) {
    console.log(`  ${e.meta.name.padEnd(14)} ${e.meta.description}`);
    console.log(`  ${" ".repeat(14)} when: ${e.meta.whenToUse}\n`);
  }
  process.exit(0);
}
if (sub === "templates") {
  // Stylistic templates (the NEW styling registry): look + bound default theme.
  console.log("templates (stylistic layer — how it looks):\n");
  for (const [name, t] of Object.entries(TEMPLATES)) {
    console.log(`  ${name.padEnd(16)} ${t.description}`);
    console.log(`  ${" ".repeat(16)} theme: ${t.theme}\n`);
  }
  process.exit(0);
}
if (sub === "themes") {
  console.log("themes (tokens — colors/fonts):\n" + Object.keys(THEMES).map((t) => `  ${t}`).join("\n"));
  process.exit(0);
}

// `create` merges the repo flow (make) and the beats-file flow (render): a
// positional beats-like file routes to render; otherwise to make.
function resolveScript(verb: string, args: string[]): string | undefined {
  if (verb === "create") {
    const beatsFile = args.find((a) => !a.startsWith("-") && /\.(beats\.)?(ts|js|json)$/.test(a));
    const dryRun = args.includes("--dry-run");
    // beats-file flow: --dry-run → storyboard (preview sheet), else render (MP4).
    if (beatsFile) return dryRun ? "scripts/storyboard.ts" : "scripts/render.ts";
    // repo flow: make.ts handles --dry-run itself (generates beats → storyboard).
    return "scripts/make.ts";
  }
  return SCRIPTS[verb];
}

const script = resolveScript(sub, rest);
if (!script) {
  console.error(`unknown command "${rawSub}".\n\n${HELP}`);
  process.exit(1);
}
const res = spawnSync(binPath("tsx"), [pkgFile(script), ...rest], { stdio: "inherit" });
process.exit(res.status ?? 0);
