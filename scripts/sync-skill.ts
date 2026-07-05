/**
 * Sync the canonical skill to the formats other editors expect, so there's one
 * source of truth and no hand-maintained copies.
 *
 *   source:  .claude/skills/cadence/   (Claude Code; what you edit)
 *   →  skills/cadence/                  (the `npx skills add <repo>` layout)
 *   →  .cursor/rules/cadence.mdc        (Cursor rule)
 *
 * Codex reads the same `skills/<name>/` layout via `npx skills add`, so no separate
 * copy is committed. Run after editing the skill:  bun run sync-skill
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PKG_ROOT } from "./_pkg";
import { containerTypes, leafTypes, regions } from "./_explain";
import { buildCapabilities } from "./_capabilities";

const NAME = "cadence";
const SRC = join(PKG_ROOT, ".claude/skills", NAME);
const SKILL_PATH = join(SRC, "SKILL.md");
const CHECK = process.argv.includes("--check");

// The GENERATED:vocabulary block in SKILL.md is filled from `cadence capabilities`
// (the same manifest the agent reads — generated FROM the zod schemas/registries),
// so the skill's tables can never drift from the engine. The embedded `schemaDigest`
// makes drift a hard failure: change a schema → the digest changes → the committed
// block is stale → `sync-skill --check` fails CI until the skill is regenerated.
const cap = buildCapabilities();
const VOCAB = [
  `**Components (leaves):** ${leafTypes().map((t) => `\`${t}\``).join(", ")}`,
  `**Layout containers:** ${containerTypes().map((t) => `\`${t}\``).join(", ")}`,
  `**Regions:** ${regions().map((t) => `\`${t}\``).join(", ")}`,
  "",
  "**Panel kinds** (`panel.kind` — pick by what the change produces):",
  cap.panels.kinds.map((k) => `- \`${k.kind}\` — ${k.use}`).join("\n"),
  "",
  "**Motion presets** (per-node `motion.enter` / `.exit`):",
  `- enter: ${cap.motion.enter.values.map((v) => `\`${v.value}\` (${v.feel})`).join(" · ")}`,
  `- exit: ${cap.motion.exit.values.map((v) => `\`${v.value}\` (${v.feel})`).join(" · ")}`,
  "",
  "**Timing tokens** (template `motion.timing` — every temporal DOF; per-element `motion` overrides win):",
  `- ${Object.entries(cap.theme.timing).map(([k, t]) => `${k} ${(t as { value: number; unit?: string }).value}${(t as { unit?: string }).unit ? ` ${(t as { unit?: string }).unit}` : ""}`).join(" · ")}`,
  "",
  `> Full machine vocabulary (every prop with type/default/range/example): \`cadence capabilities\`. Engine ${cap.engine.schemaDigest}`,
].join("\n");

// Same drift-lock story as VOCAB: the panel-picker table in SKILL.md is filled
// from the registry (`cap.panels.kinds`), so a new panel kind can't go missing
// from the hand-facing docs without also failing `sync-skill --check`.
const PANEL_PICKER = [
  "| kind | use for |",
  "|------|---------|",
  ...cap.panels.kinds.map((k) => `| \`${k.kind}\` | ${k.use} |`),
].join("\n");

const fillBlock = (md: string, name: string, content: string): string =>
  md.replace(
    new RegExp(`(<!-- BEGIN GENERATED:${name}[^>]*-->)[\\s\\S]*?(<!-- END GENERATED:${name} -->)`),
    `$1\n${content}\n$2`,
  );

const canonical = readFileSync(SKILL_PATH, "utf8");
const filled = fillBlock(fillBlock(canonical, "vocabulary", VOCAB), "panel-picker", PANEL_PICKER);

if (CHECK) {
  if (filled !== canonical) {
    console.error("✗ SKILL.md GENERATED block(s) are stale — run `bun run sync-skill`.");
    process.exit(1);
  }
  console.log("✓ SKILL.md generated block(s) are in sync with the registry.");
  process.exit(0);
}

// Regenerate the block(s) in the canonical SKILL.md before syncing copies.
if (filled !== canonical) {
  writeFileSync(SKILL_PATH, filled);
  console.log("✓ regenerated SKILL.md GENERATED block(s)");
}

// 1. Frontmatter (name, description) + body from the canonical SKILL.md.
const skill = readFileSync(SKILL_PATH, "utf8");
const fm = skill.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!fm) {
  console.error("✗ SKILL.md is missing frontmatter");
  process.exit(1);
}
const description = (fm[1].match(/^description:\s*(.*)$/m)?.[1] ?? "").trim();
const body = fm[2].trimStart();

// 2. Distribution copy at the repo-root `skills/<name>/` layout.
const distDir = join(PKG_ROOT, "skills", NAME);
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(SRC, distDir, { recursive: true });
console.log(`✓ skills/${NAME}/  (npx skills add layout)`);

// 3. Cursor rule — an agent-requested rule carrying the same body.
const cursorDir = join(PKG_ROOT, ".cursor/rules");
mkdirSync(cursorDir, { recursive: true });
const mdc = `---\ndescription: ${description}\nalwaysApply: false\n---\n\n${body}`;
writeFileSync(join(cursorDir, `${NAME}.mdc`), mdc);
console.log(`✓ .cursor/rules/${NAME}.mdc`);

console.log("\nEdit the skill in .claude/skills/, then re-run `bun run sync-skill`.");
