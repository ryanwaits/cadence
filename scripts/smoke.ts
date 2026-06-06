/**
 * Render smoke test — re-renders a matrix of key stills (panels × themes ×
 * formats) and fails if any errors. Cheap regression gate for CI. (A perceptual
 * pixel-diff against committed references is the stronger follow-up.)
 *
 *   bun run check:render
 */
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

type Case = { file: string; frame: number; theme?: string; format?: string; note: string };

const CASES: Case[] = [
  { file: "src/content/streams-launch.beats.ts", frame: 470, note: "proof panel + typed code" },
  { file: "src/content/streams-launch.beats.ts", frame: 850, note: "fork panel" },
  { file: "src/content/streams-launch.beats.ts", frame: 660, note: "stream-resume panel" },
  { file: "src/content/gradient-demo.beats.ts", frame: 230, note: "gradient pack + stat (no art)" },
  { file: "src/content/clarinet-3.18.beats.ts", frame: 320, theme: "slate", note: "status + slate code theme" },
  { file: "src/content/sdk-6.5-mempool.beats.ts", frame: 330, format: "9x16", note: "data-table, vertical reflow" },
];

const bin = resolve("node_modules/.bin/tsx");
let failed = 0;
for (const c of CASES) {
  const args = ["scripts/render.ts", c.file, "--frame", String(c.frame)];
  if (c.theme) args.push("--theme", c.theme);
  if (c.format) args.push("--format", c.format);
  process.stdout.write(`· ${c.note} … `);
  const res = spawnSync(bin, args, { stdio: ["ignore", "ignore", "pipe"], encoding: "utf8" });
  if (res.status === 0) {
    console.log("ok");
  } else {
    failed++;
    console.log("FAIL");
    console.error((res.stderr || "").split("\n").slice(-6).join("\n"));
  }
}

let total = CASES.length;

// Storyboard: the dry-run preview path (plan + one still per beat → a sheet).
// The only automated guard for the data-URI contact-sheet render.
total++;
process.stdout.write("· storyboard sheet (clarinet-3.18) … ");
const sbOut = resolve("out/clarinet-3.18.storyboard.png");
rmSync(sbOut, { force: true });
const sb = spawnSync(bin, ["scripts/storyboard.ts", "src/content/clarinet-3.18.beats.ts"], { stdio: ["ignore", "ignore", "pipe"], encoding: "utf8" });
if (sb.status === 0 && existsSync(sbOut)) {
  console.log("ok");
} else {
  failed++;
  console.log("FAIL");
  console.error((sb.stderr || "").split("\n").slice(-6).join("\n"));
}

if (failed) {
  console.error(`\n✗ ${failed}/${total} cases failed`);
  process.exit(1);
}
console.log(`\n✓ ${total} cases ok`);
