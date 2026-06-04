/**
 * `cadence audit <beats>` — static, heuristic checks on a beats file. Advisory
 * only: ranked findings, no auto-fix (edit content by hand; use `redesign` to
 * re-skin). Mirrors the authoring guidance in the cadence skill.
 *
 *   cadence audit src/content/streams-launch.beats.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { changelogSchema } from "../src/schema/beats";

const file = process.argv.slice(2).find((a) => !a.startsWith("-"));
if (!file) {
  console.error("usage: cadence audit <beats.ts|.json>");
  process.exit(1);
}

const raw = file.endsWith(".json")
  ? JSON.parse(readFileSync(resolve(file), "utf8"))
  : (await import(pathToFileURL(resolve(file)).href)).default;
const parsed = changelogSchema.parse(raw);
const beats = parsed.beats;
const FPS = 30;

type Level = "error" | "warn" | "info";
const findings: { level: Level; msg: string }[] = [];
const add = (level: Level, msg: string) => findings.push({ level, msg });

// 1. Beat count — skill guidance is to keep it tight (3-6).
if (beats.length < 2) add("warn", `only ${beats.length} beat — most videos want 3-6`);
if (beats.length > 7) add("warn", `${beats.length} beats — tighten toward 3-6; long videos lose attention`);

// 2. Per-beat duration (≈2-10s at 30fps).
beats.forEach((b, i) => {
  const s = (b.durationInFrames / FPS).toFixed(1);
  if (b.durationInFrames < 45) add("warn", `beat ${i + 1} "${b.headline}" is ${s}s — too short to read`);
  else if (b.durationInFrames > 360) add("warn", `beat ${i + 1} "${b.headline}" is ${s}s — likely too long`);
});

// 3. Headline length — short + declarative.
beats.forEach((b, i) => {
  if (b.headline.length > 48)
    add("warn", `beat ${i + 1} headline is ${b.headline.length} chars — shorten ("${b.headline.slice(0, 40)}…")`);
});

// 4. Motion monotony — every beat with an explicit enter uses the same one.
const enters = beats.map((b) => b.headlineMotion?.enter).filter(Boolean);
if (enters.length >= 3 && new Set(enters).size === 1)
  add("info", `every headline uses the "${enters[0]}" enter — vary it for rhythm`);

// 5. Install/CTA closer — heuristic: last beat centered with a bash command or a badge/caption.
const last = beats[beats.length - 1];
const isCloser = last.layout === "center" && (last.code?.lang === "bash" || !!last.badge || !!last.caption);
if (!isCloser) add("info", "last beat doesn't look like an install/CTA closer (centered + install command)");

// Report, ranked: error → warn → info. "Issues" = error+warn; info are notes.
const order: Record<Level, number> = { error: 0, warn: 1, info: 2 };
findings.sort((a, b) => order[a.level] - order[b.level]);
const icon: Record<Level, string> = { error: "✗", warn: "▲", info: "·" };
const issues = findings.filter((f) => f.level !== "info").length;

if (issues === 0) {
  const notes = findings.length ? ` (${findings.length} note${findings.length > 1 ? "s" : ""} below)` : "";
  console.log(`✓ ${file}: no issues across ${beats.length} beats${notes}`);
} else {
  console.log(`${file}: ${issues} issue${issues > 1 ? "s" : ""} across ${beats.length} beats`);
}
for (const f of findings) console.log(`  ${icon[f.level]} ${f.msg}`);
