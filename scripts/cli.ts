/**
 * Unified front door. `cadence <command> …` dispatches to the pieces.
 *
 *   cadence create --release stx-labs/clarinet --install "brew install clarinet"
 *   cadence create src/content/x.beats.ts --format 9x16   # a beats file → video
 *   cadence study --from-url https://acme.dev --name acme
 *   cadence edit src/content/x.beats.ts
 *   cadence fork src/content/x.beats.ts --theme slate
 */
import { KINDS } from "../src/kinds";
import { TEMPLATES } from "../src/templates/registry";
import { THEMES } from "../src/theme";
import { runScript } from "./_pkg";
import { resolveCreateScript } from "./_route";

const [rawSub, ...rest] = process.argv.slice(2);

// Legacy verb aliases → canonical intent verbs.
const ALIAS: Record<string, string> = { make: "create", theme: "study", audit: "edit", redesign: "fork" };
const sub = rawSub ? (ALIAS[rawSub] ?? rawSub) : rawSub;
if (rawSub && ALIAS[rawSub]) {
  console.error(
    `· note: "cadence ${rawSub}" is deprecated — use "cadence ${ALIAS[rawSub]}"${rawSub === "redesign" ? ' (then `cadence create <file>` to render)' : ""}`,
  );
}

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
  changes: "scripts/changes.ts", // a repo → an UpdateManifest
  art: "scripts/generate-art.ts", // optional painterly background pack
  capabilities: "scripts/capabilities.ts", // the machine-readable beat vocabulary (json)
};

const HELP = `cadence — turn a repo / release into a changelog or announcement video.

author (kind → a durable beats file, no render):
  new        a kind + source → a beats file you own   cadence new launch --release owner/name --install "npm i pkg"
  fork       a beats file → a restyled/retargeted copy cadence fork x.beats.json --template terminal --format 9x16
  edit       validate + normalize + heuristic checks   cadence edit x.beats.json   (the skill supplies the NL edit)

render:
  create     a repo OR a beats file → a video     cadence create --release owner/name --install "npm i pkg"
  storyboard a beats file → a preview sheet         cadence storyboard x.beats.json (or: cadence create … --dry-run)
  inspect    computed regions/timings/colors (json)  cadence inspect x.beats.json --beat <id>

setup + checks:
  study      a brand color / URL → a theme         cadence study --from-url https://acme.dev --name acme
  capabilities  the full beat vocabulary (json)     cadence capabilities   (every node/panel/token/preset + defaults)
  guide      interactive walkthrough (start here)   cadence guide

utilities:
  changes    a repo → an UpdateManifest (json)
  art        generate painterly backgrounds (optional pack, needs OPENAI_API_KEY)
  kinds      list structural arcs (launch, changelog, milestone, …)
  templates  list stylistic templates (look + bound theme)
  themes     list token themes (colors/fonts)

axes: kind = which beats in what order · template = how it looks · theme = colors/fonts
flags shared by create/render/fork: --format 16x9|1x1|9x16, --template <style>, --theme <name>, --theme-file <path>, --frame <n>, --out <dir>
outputs: new/fork write to <project>/.cadence/<slug>.beats.json (else ./); renders to <project>/.cadence/out (else ./out). override with --out
preview before rendering: cadence storyboard <beats>  ·  cadence create … --dry-run  (plan + one still per beat, no MP4)`;

if (!sub || sub === "help" || sub === "--help") {
  console.log(HELP);
  process.exit(0);
}
if (sub === "kinds") {
  // Structural arcs (which beats, what order). Print each entry's listing metadata.
  console.log("kinds (structural arcs — which beats, what order):\n");
  for (const e of Object.values(KINDS)) {
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

const script = sub === "create" ? resolveCreateScript(rest) : SCRIPTS[sub];
if (!script) {
  console.error(`unknown command "${rawSub}".\n\n${HELP}`);
  process.exit(1);
}
runScript(script, rest);
