/**
 * Background painting generator. Builds a prompt from the art system (prompts/art/*)
 * and calls OpenAI gpt-image-1 (base64 → PNG), then updates a manifest the
 * ContactSheet reads. Freeform `--prompt` generates anything; with no prompt it
 * pulls subjects from the built-in pack (the "Hill Country Sublime" landmarks).
 *
 * Output is project-local: run against a repo with a `.cadence/` dir and art lands
 * in `<project>/.cadence/backgrounds/` (candidates under `_candidates/`); otherwise
 * the cadence engine's own `public/backgrounds/`.
 *
 *   bun run art --prompt "misty redwood coastline at dawn" --name redwood
 *   bun run art --all --level heightened --format 16x9       # every built-in subject
 *   bun run art --promote redwood                            # candidate(s) → backgrounds/
 *
 * Requires OPENAI_API_KEY (except --promote, which only moves files).
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { composePrompt, LANDMARKS, type FantasyLevel } from "../prompts/art/compose";
import type { Format } from "../src/schema/beats";
import { findCadenceDir } from "./_theme";

const SIZE: Record<Format, string> = { "16x9": "1536x1024", "1x1": "1024x1024", "9x16": "1024x1536" };

const args = process.argv.slice(2);
const flag = (name: string, def?: string) => {
  const eq = args.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(name);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : def;
};
const has = (name: string) => args.includes(name);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// T4: project-local art base. A project's `.cadence/backgrounds/` if present
// (discovered from cwd), else the engine's committed `public/backgrounds/`.
const cad = findCadenceDir(process.cwd());
const ART_BASE = cad ? join(cad, "backgrounds") : "public/backgrounds";
const CANDIDATES = join(ART_BASE, "_candidates");
const MANIFEST = join(CANDIDATES, "manifest.json");

const level = flag("--level", "heightened") as FantasyLevel;
const format = flag("--format", "16x9") as Format;
const quality = flag("--quality", "medium")!;

type Entry = { file: string; subject: string; level: string; format: string; name: string };
mkdirSync(CANDIDATES, { recursive: true });
const manifest: Entry[] = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];

// T6: promote — move a chosen candidate (by slug or filename) to backgrounds/,
// and drop it from the candidates manifest (its path would otherwise go stale).
const promote = flag("--promote");
if (promote) {
  const key = slugify(promote);
  const matches = manifest.filter((m) => m.name === promote || m.name.startsWith(`${key}-`));
  if (!matches.length) {
    console.error(`✗ no candidate matching "${promote}" in ${CANDIDATES}`);
    process.exit(1);
  }
  mkdirSync(ART_BASE, { recursive: true });
  for (const m of matches) {
    const from = join(CANDIDATES, m.name);
    if (existsSync(from)) {
      renameSync(from, join(ART_BASE, m.name));
      console.log(`✓ promoted ${m.name} → ${ART_BASE}/  (reference as image:${m.name})`);
    }
  }
  const promoted = new Set(matches.map((m) => m.name));
  writeFileSync(MANIFEST, JSON.stringify(manifest.filter((m) => !promoted.has(m.name)), null, 2));
  process.exit(0);
}

// Subject source: a user-supplied pack (`--pack file.json`) or the built-in
// landmark pack. A pack may also override the style/negatives (else engine defaults).
type Pack = { style?: string; negatives?: string; subjects: Record<string, { name: string; subject: string }> };
const packFile = flag("--pack");
const pack: Pack = packFile ? JSON.parse(readFileSync(packFile, "utf8")) : { subjects: LANDMARKS };
const styleFile = flag("--style-file");
const style = styleFile ? readFileSync(styleFile, "utf8") : pack.style;
const negatives = pack.negatives;

// A job = one image to generate. Freeform `--prompt` (needs `--name`) wins;
// otherwise pull subjects from the pack via --landmark/--all.
type Job = { subject: string; slug: string; label: string };
const promptText = flag("--prompt");
let jobs: Job[];
if (promptText) {
  const name = flag("--name");
  if (!name) {
    console.error("✗ --prompt requires --name <slug> (used for the filename + manifest label)");
    process.exit(1);
  }
  jobs = [{ subject: promptText, slug: slugify(name), label: name }];
} else {
  const keys = has("--all") ? Object.keys(pack.subjects) : [flag("--landmark", Object.keys(pack.subjects)[0])!];
  jobs = keys.map((k) => {
    const s = pack.subjects[k];
    if (!s) {
      console.error(`✗ "${k}" not in pack (have: ${Object.keys(pack.subjects).join(", ")})`);
      process.exit(1);
    }
    return { subject: s.subject, slug: k, label: s.name };
  });
}

// Cost guard: batch runs cost real money — require explicit --yes after an estimate.
const COST: Record<string, number> = { low: 0.02, medium: 0.06, high: 0.19 }; // ~USD/image, approx
if (jobs.length > 1 && !has("--yes")) {
  const est = (COST[quality] ?? 0.06) * jobs.length;
  console.error(`⚠ ${jobs.length} images at quality "${quality}" ≈ $${est.toFixed(2)} (approx). Re-run with --yes to proceed.`);
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error("✗ OPENAI_API_KEY not set");
  process.exit(1);
}

async function generate(job: Job) {
  const prompt = composePrompt({ subject: job.subject, level, format, style, negatives });
  const fname = `${job.slug}-${level}-${format}.png`;
  process.stdout.write(`· ${fname} … `);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: SIZE[format], quality, n: 1 }),
  });
  if (!res.ok) {
    console.log("FAILED");
    console.error(await res.text());
    return;
  }
  const json = await res.json();
  const b64 = json.data[0].b64_json as string;
  writeFileSync(join(CANDIDATES, fname), Buffer.from(b64, "base64"));
  const entry: Entry = { file: `backgrounds/_candidates/${fname}`, subject: job.label, level, format, name: fname };
  const idx = manifest.findIndex((m) => m.name === fname);
  if (idx >= 0) manifest[idx] = entry;
  else manifest.push(entry);
  console.log("ok");
}

for (const job of jobs) {
  await generate(job);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\n✓ ${jobs.length} image(s) → ${CANDIDATES}/  (manifest: ${manifest.length} total)`);
