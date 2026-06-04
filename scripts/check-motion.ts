/**
 * Parity guard: every preset in names.ts must be documented in MOTION.md, and
 * every preset named in MOTION.md's Enter/Exit tables must exist in names.ts.
 * Run: `bun run check:motion` (or `tsx scripts/check-motion.ts`).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ENTER_PRESETS, EXIT_PRESETS } from "../src/motion/names";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const doc = readFileSync(join(root, "MOTION.md"), "utf8");
const all = [...ENTER_PRESETS, ...EXIT_PRESETS];
const errors: string[] = [];

// forward: each name appears as `name` in the doc
for (const name of all) {
  if (!doc.includes(`\`${name}\``)) errors.push(`MOTION.md is missing preset \`${name}\``);
}

// backward: first-column backticked names in the two preset tables exist in names.ts
const tableNames = new Set<string>();
for (const section of ["## Enter presets", "## Exit presets"]) {
  const start = doc.indexOf(section);
  if (start === -1) { errors.push(`MOTION.md missing section "${section}"`); continue; }
  const body = doc.slice(start, doc.indexOf("\n## ", start + 1) === -1 ? undefined : doc.indexOf("\n## ", start + 1));
  for (const m of body.matchAll(/^\|\s*`([a-z]+)`\s*\|/gm)) tableNames.add(m[1]);
}
for (const name of tableNames) {
  if (!(all as string[]).includes(name)) errors.push(`MOTION.md documents unknown preset \`${name}\``);
}

if (errors.length) {
  console.error("✗ motion parity failed:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ motion parity: ${all.length} presets documented (${tableNames.size} in tables)`);
