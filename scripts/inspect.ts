/**
 * `cadence inspect <beats> [--beat <id>] [--json]` — the VERIFY half of the agent
 * loop. `capabilities` says what a beat CAN express; `inspect` says what an authored
 * beat DID resolve to: per-beat regions (which node lands where), per-element reveal
 * timings (when the panel appears relative to the code typing-done), and resolved
 * colors (role → hex). Computed by the same pure resolver the renderer uses
 * (`src/resolve.ts`), so what you inspect is what renders.
 *
 *   cadence inspect src/content/streams.beats.ts                 # every beat
 *   cadence inspect src/content/streams-launch.beats.ts --beat cta
 */
import { type Format } from "../src/schema/beats";
import { resolveBeat } from "../src/resolve";
import { loadBeats } from "./_beats";

const args = process.argv.slice(2);
const getFlag = (name: string) => {
  const eq = args.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const file = args.find((a) => !a.startsWith("-"));
if (!file) {
  console.error("usage: cadence inspect <beats.ts|.json> [--beat <id>] [--format 16x9|1x1|9x16]");
  process.exit(1);
}

const parsed = await loadBeats(file);
const format = (getFlag("--format") as Format | undefined) ?? parsed.format;
const beatId = getFlag("--beat");

const beats = beatId ? parsed.beats.filter((b) => b.id === beatId) : parsed.beats;
if (beatId && !beats.length) {
  console.error(`✗ no beat with id "${beatId}". have: ${parsed.beats.map((b) => b.id).join(", ")}`);
  process.exit(1);
}

const out = { format, beats: beats.map((b) => resolveBeat(b, format)) };
console.log(JSON.stringify(out, null, 2));
