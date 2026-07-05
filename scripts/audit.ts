/**
 * `cadence audit <beats>` — static, heuristic checks on a beats file. Advisory
 * only: ranked findings, no auto-fix (edit content by hand; use `redesign` to
 * re-skin). The checks live in `_audit.ts` so `storyboard` can reuse them.
 *
 *   cadence audit src/content/streams-launch.beats.ts
 */
import { loadBeatsOrExit } from "./_beats";
import { auditBeats, ICON, rankFindings } from "./_audit";

const file = process.argv.slice(2).find((a) => !a.startsWith("-"));
if (!file) {
  console.error("usage: cadence audit <beats.ts|.json>");
  process.exit(1);
}

const parsed = await loadBeatsOrExit(file);
const beats = parsed.beats;
const findings = rankFindings(auditBeats(beats));
const issues = findings.filter((f) => f.level !== "info").length;

if (issues === 0) {
  const notes = findings.length ? ` (${findings.length} note${findings.length > 1 ? "s" : ""} below)` : "";
  console.log(`✓ ${file}: no issues across ${beats.length} beats${notes}`);
} else {
  console.log(`${file}: ${issues} issue${issues > 1 ? "s" : ""} across ${beats.length} beats`);
}
for (const f of findings) console.log(`  ${ICON[f.level]} ${f.msg}`);
