#!/usr/bin/env node
/**
 * npm bin launcher. node can't execute TypeScript directly, so this resolves
 * the `tsx` runner (package-local `.bin`, then the hoisted top-level `.bin`
 * when we're installed under `node_modules/<pkg>`, else PATH) and runs the
 * TS CLI. Mirrors `scripts/_pkg.ts#binPath` — kept in JS so the bin needs no
 * transpile step.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tsxCandidates = [
  join(root, "node_modules/.bin/tsx"),
  resolve(root, "../.bin/tsx"),
  resolve(root, "../../.bin/tsx"),
];
const tsx = tsxCandidates.find(existsSync) ?? "tsx";

const res = spawnSync(tsx, [join(root, "scripts/cli.ts"), ...process.argv.slice(2)], {
  stdio: "inherit",
});
// Don't swallow a failed launch: spawnSync sets `error` (and leaves `status`
// null) when the runner can't be found/executed. `?? 0` there would exit 0 and
// look like a silent no-op, so surface it and exit non-zero.
if (res.error) {
  console.error(`cadence: could not launch the CLI runner (${tsx}): ${res.error.message}`);
  process.exit(1);
}
process.exit(res.status ?? 1);
