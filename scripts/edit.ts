/**
 * `cadence edit <file> ["<nl instruction>"]` — a DETERMINISTIC validate +
 * normalize gate. There is NO LLM here: the NL string is the SKILL's prompt, not
 * an engine input. The engine only proves the file is renderable:
 *
 *   loadBeats → changelogSchema.parse → desugarBeat (normalize) →
 *   auditBeats + rankFindings (soft warnings) →
 *     on zod error: print the issue path + message, exit NON-ZERO (skill self-corrects)
 *     on success:   print a 1-line summary + `→ cadence storyboard <file>`
 *
 *   cadence edit hero.beats.json
 *   cadence edit hero.beats.json "tighten the closer and swap to a 9:16 format"
 *   cadence edit --explain          # dump allowed component types / regions / panel kinds
 */
import { ZodError } from "zod";
import { ICON, auditBeats, rankFindings } from "./_audit";
import { FPS, loadBeats } from "./_beats";
import { explainVocabulary } from "./_explain";
import { desugarBeat } from "../src/schema/desugar";

const args = process.argv.slice(2);

// `--explain` dumps the allowed vocabulary so the skill can pre-check an edit
// before writing it (data-vs-code boundary: unknown type/region/kind ⇒ a PR).
// The vocabulary is GENERATED from the schema/registry (see `_explain.ts`) — never
// hand-maintained — so a newly-registered component/panel surfaces automatically.
if (args.includes("--explain")) {
  console.log(explainVocabulary());
  process.exit(0);
}

const file = args.find((a) => !a.startsWith("-"));
if (!file) {
  console.error('usage: cadence edit <file> ["<nl instruction>"]   (or: cadence edit --explain)');
  process.exit(1);
}

// The NL instruction (if any) is the SKILL's prompt — logged for provenance,
// never consumed by the engine.
const instruction = args.filter((a) => a !== file && !a.startsWith("-"))[1];
if (instruction) console.log(`(instruction logged: ${instruction})`);

// 1. Load + validate. loadBeats already parses with the schema; we re-parse the
//    raw file here so a schema failure surfaces the issue path/message directly
//    (loadBeats would throw the same ZodError — caught below either way).
let parsed: Awaited<ReturnType<typeof loadBeats>>;
try {
  parsed = await loadBeats(file);
} catch (err) {
  if (err instanceof ZodError) {
    console.error("✗ invalid beats file — fix these, then re-run `cadence edit`:\n");
    for (const issue of err.issues) {
      const path = issue.path.length ? issue.path.join(".") : "(root)";
      console.error(`  ${path}: ${issue.message}`);
    }
    process.exit(1);
  }
  console.error(`✗ could not load ${file}: ${(err as Error).message}`);
  process.exit(1);
}

// 2. Normalize: run desugarBeat on each beat (legacy fields → composition). This
//    proves every beat resolves to a renderable component set; a malformed
//    composition surfaces here rather than at render time.
try {
  for (const beat of parsed.beats) desugarBeat(beat);
} catch (err) {
  console.error(`✗ normalize failed: ${(err as Error).message}`);
  process.exit(1);
}

// 3. Soft warnings (advisory only — never fail the gate on these).
const findings = rankFindings(auditBeats(parsed.beats));
if (findings.length) {
  console.log("");
  for (const f of findings) console.log(`  ${ICON[f.level]} ${f.msg}`);
}

// 4. Success: 1-line summary + the next step.
const totalFrames = parsed.beats.reduce((n, b) => n + b.durationInFrames, 0);
console.log(
  `\n✓ ${parsed.beats.length} beats · ${(totalFrames / FPS).toFixed(1)}s · ${parsed.format}${parsed.template ? ` · template ${parsed.template}` : ""}`,
);
console.log(`\n→ cadence storyboard ${file}\n`);
