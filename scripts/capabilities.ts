/**
 * `cadence capabilities [--json]` — the machine-readable vocabulary of everything
 * a beat can express: every node type, panel kind, motion preset, placement option,
 * background + scrim, and theme/timing token, with types, defaults, ranges, and
 * "feel"/"use" notes. Generated FROM the zod schemas + registries (see
 * `_capabilities.ts`), so it can't drift from the engine.
 *
 * The agent loop: `capabilities` answers "what can I change + what are the legal
 * values" → it edits the beats JSON → `inspect`/`storyboard` answer "what did that
 * produce". This is the read surface that makes the model fully introspectable.
 *
 *   cadence capabilities            # the full manifest (JSON)
 *   cadence capabilities --digest   # just the schemaDigest (drift check)
 */
import { buildCapabilities } from "./_capabilities";

const args = process.argv.slice(2);
const manifest = buildCapabilities();

if (args.includes("--digest")) {
  console.log(manifest.engine.schemaDigest);
} else {
  // `--json` is the canonical (and only) form — it's a machine surface.
  console.log(JSON.stringify(manifest, null, 2));
}
