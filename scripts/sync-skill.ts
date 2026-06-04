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

const NAME = "cadence";
const SRC = join(PKG_ROOT, ".claude/skills", NAME);

// 1. Frontmatter (name, description) + body from the canonical SKILL.md.
const skill = readFileSync(join(SRC, "SKILL.md"), "utf8");
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
