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
import { containerTypes, leafTypes, panelKinds, regions } from "./_explain";

const NAME = "cadence";
const SRC = join(PKG_ROOT, ".claude/skills", NAME);
const SKILL_PATH = join(SRC, "SKILL.md");
const CHECK = process.argv.includes("--check");

// The GENERATED:vocabulary block in SKILL.md is filled from the schema/registry
// (single source — see `_explain.ts`), so the closed sets can never drift from the
// engine. `sync-skill --check` fails CI if the committed block is stale.
const VOCAB = [
  `**Components (leaves):** ${leafTypes().map((t) => `\`${t}\``).join(", ")}`,
  `**Layout containers:** ${containerTypes().map((t) => `\`${t}\``).join(", ")}`,
  `**Regions:** ${regions().map((t) => `\`${t}\``).join(", ")}`,
  `**Panel kinds:** ${panelKinds().map((t) => `\`${t}\``).join(", ")}`,
].join("\n\n");

const fillVocabulary = (md: string): string =>
  md.replace(
    /(<!-- BEGIN GENERATED:vocabulary[^>]*-->)[\s\S]*?(<!-- END GENERATED:vocabulary -->)/,
    `$1\n${VOCAB}\n$2`,
  );

const canonical = readFileSync(SKILL_PATH, "utf8");
const filled = fillVocabulary(canonical);

if (CHECK) {
  if (filled !== canonical) {
    console.error("✗ SKILL.md GENERATED:vocabulary block is stale — run `bun run sync-skill`.");
    process.exit(1);
  }
  console.log("✓ SKILL.md generated block is in sync with the registry.");
  process.exit(0);
}

// Regenerate the block in the canonical SKILL.md before syncing copies.
if (filled !== canonical) {
  writeFileSync(SKILL_PATH, filled);
  console.log("✓ regenerated SKILL.md GENERATED:vocabulary block");
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
