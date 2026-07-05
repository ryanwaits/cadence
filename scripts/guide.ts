/**
 * Interactive walkthrough. Run on any project to (a) make a video, (b) understand
 * the pipeline as you go, (c) learn where to adjust each piece.
 *
 *   bun run cli guide
 */
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { resolve } from "node:path";
import { KINDS } from "../src/kinds";

const kindNames = Object.keys(KINDS);

const rl = createInterface({ input: process.stdin, output: process.stdout });

const cancel = () => {
  console.log("\n\n  cancelled — run `bun run cli guide` any time.\n");
  rl.close();
  process.exit(0);
};
rl.on("SIGINT", cancel);

const ask = async (q: string, def = "") => (await rl.question(`${q}${def ? ` [${def}]` : ""}: `)).trim() || def;
const say = (s = "") => console.log(s);
const rule = () => say("─".repeat(64));
const tsx = (args: string[], opts: { capture?: boolean } = {}) =>
  spawnSync(resolve("node_modules/.bin/tsx"), args, { stdio: opts.capture ? ["ignore", "pipe", "inherit"] : "inherit", encoding: "utf8" });

async function main() {
  rule();
  say("  cadence — interactive walkthrough");
  rule();
  say(`
This turns a repo / release into a changelog or announcement video. The pipeline:

   repo → [adapter] → manifest → [template] → beats → [engine] → mp4
                                      ▲             ▲
                                  themeable     honest, no LLM

We'll walk it one stage at a time. Press enter to accept the [defaults].
`);

  // ── 1. Source ────────────────────────────────────────────────────────────
  rule();
  say("STEP 1 — what changed?  (adapters: src/adapters/)");
  say("Point at a GitHub repo's latest release. The adapter parses the notes into");
  say("a normalized manifest (it strips emoji/PR-refs and reports what it dropped).\n");
  const repo = await ask("GitHub repo (owner/name)", "stx-labs/clarinet");
  const tag = await ask("release tag (blank = latest)");
  say("\n→ running: cli changes --release " + repo + (tag ? ` --tag ${tag}` : ""));
  tsx(["scripts/changes.ts", "--release", repo, ...(tag ? ["--tag", tag] : [])]);
  say("\nThat JSON is the 'UpdateManifest' — every later stage reads from it.");
  say("Tweak parsing in src/adapters/parse.ts.\n");

  // ── 2. Template ──────────────────────────────────────────────────────────
  rule();
  say("STEP 2 — the arc.  (kinds: src/kinds/)");
  say("A kind maps the manifest to beats, deterministically and honestly");
  say("(no fabricated code). Available: " + kindNames.join(", ") + ".\n");
  const template = await ask("kind", "changelog");
  const install = await ask("real install line for the closer (e.g. 'brew install clarinet')");

  // ── 3. Look ──────────────────────────────────────────────────────────────
  rule();
  say("STEP 3 — the look.  (themes: src/theme/ · style packs: Background.tsx)");
  say("Background style packs: gradient / solid / image (a painting). Theme sets");
  say("the colors, fonts, and code palette — try 'default' or 'slate', or extract");
  say("a brand's color from a URL with: cli study --from-url <site> --name <name>.\n");
  const format = await ask("format (16x9 / 1x1 / 9x16)", "16x9");
  const background = await ask("background (gradient:#a,#b | solid:#hex | image:file.png)", "gradient:#312e81,#0b1120");
  const theme = await ask("theme (default / slate)", "default");

  const makeArgs = (extra: string[]) => [
    "scripts/make.ts", "--release", repo, ...(tag ? ["--tag", tag] : []),
    "--template", template, "--format", format, "--background", background, "--theme", theme,
    ...(install ? ["--install", install] : []), ...extra,
  ];

  // ── 4. Preview ───────────────────────────────────────────────────────────
  rule();
  say("STEP 4 — preview a single frame (fast, ~5s) before the full render.\n");
  tsx(makeArgs(["--frame", "200"]));
  say("\n→ open the .png in out/ to eyeball it. Adjust the template/background/theme above if needed.");

  const again = (await ask("\nrender the full video now? (y/n)", "y")).toLowerCase();
  if (again.startsWith("y")) {
    rule();
    say("STEP 5 — full render.\n");
    tsx(makeArgs([]));
    say("\n→ the mp4 is in out/.");
  }

  // ── Close ────────────────────────────────────────────────────────────────
  rule();
  say("WHERE TO GO NEXT");
  rule();
  say(`
Understand it      WALKTHROUGH.md (architecture + how to adjust each part)
Honest code        the 'cadence' skill reads a repo's types to add real
                   code snippets (the LLM path, vs the deterministic templates here)
Add a panel        src/components/panels/  → register in panels/index.tsx + schema
Add a kind         src/kinds/              → register in kinds/index.ts
Brand colors       cli study --from-url <site> --name <n>  → --theme-file themes/<n>.json
Ship on release    docs/github-action.md   (auto-render on every release, free)

Run again any time:  bun run cli guide
`);
  rl.close();
}

main().catch((e) => {
  if (e?.code === "ABORT_ERR" || e?.name === "AbortError") cancel(); // Ctrl+C / Ctrl+D mid-prompt
  console.error(e);
  rl.close();
  process.exit(1);
});
