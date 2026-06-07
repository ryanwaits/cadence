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
import { THEMES } from "../src/theme";
import { binPath, pkgFile } from "./_pkg";

const [rawSub, ...rest] = process.argv.slice(2);

// Legacy verb aliases → canonical intent verbs.
const ALIAS: Record<string, string> = { make: "create", theme: "study" };
const sub = rawSub ? (ALIAS[rawSub] ?? rawSub) : rawSub;

// Verb → script. `create` is resolved dynamically (repo flow vs. beats file).
const SCRIPTS: Record<string, string> = {
  guide: "scripts/guide.ts", // interactive walkthrough
  render: "scripts/render.ts", // a beats file → a video (create delegates here)
  storyboard: "scripts/storyboard.ts", // a beats file → a preview sheet (no MP4)
  study: "scripts/theme.ts", // brand color / URL / screenshot → a theme
  audit: "scripts/audit.ts", // check a beats file for issues
  redesign: "scripts/redesign.ts", // re-skin a beats file
  changes: "scripts/changes.ts", // a repo → an UpdateManifest
  art: "scripts/generate-art.ts", // optional painterly background pack
};

const HELP = `cadence — turn a repo / release into a changelog or announcement video.

commands:
  create     a repo OR a beats file → a video     cadence create --release owner/name --install "npm i pkg"
  storyboard a beats file → a preview sheet         cadence storyboard x.beats.ts   (or: cadence create … --dry-run)
  study      a brand color / URL → a theme         cadence study --from-url https://acme.dev --name acme
  audit      check a beats file for issues          cadence audit src/content/x.beats.ts
  redesign   re-skin a beats file (new look)        cadence redesign x.beats.ts --theme slate
  guide      interactive walkthrough (start here)   cadence guide

utilities:
  render     a beats file → a video (create delegates here for beats files)
  changes    a repo → an UpdateManifest (json)
  art        generate painterly backgrounds (optional pack, needs OPENAI_API_KEY)
  templates  list available templates
  themes     list available themes

flags shared by create/render/redesign: --format 16x9|1x1|9x16, --theme <name>, --theme-file <path>, --frame <n>, --out <dir>
outputs: written to <project>/.cadence/out when run against a repo with a .cadence/ dir, else ./out (override with --out)
preview before rendering: cadence storyboard <beats>  ·  cadence create … --dry-run  (plan + one still per beat, no MP4)`;

if (!sub || sub === "help" || sub === "--help") {
  console.log(HELP);
  process.exit(0);
}
if (sub === "templates") {
  // List the canonical kind names (the structural arcs), skipping back-compat
  // alias keys that point at an entry already shown. The CLI's kind/template
  // listing is reworked in a later stage; this keeps it behavior-equivalent.
  const seen = new Set<KindEntry>();
  const names = Object.entries(KINDS)
    .filter(([, entry]) => !seen.has(entry) && (seen.add(entry), true))
    .map(([name]) => name);
  console.log("templates:\n" + names.map((t) => `  ${t}`).join("\n"));
  process.exit(0);
}
if (sub === "themes") {
  console.log("themes:\n" + Object.keys(THEMES).map((t) => `  ${t}`).join("\n"));
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
