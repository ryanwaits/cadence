/**
 * "Hill Country Sublime" painting generator. Builds a prompt from the art system
 * (prompts/art/*) and calls OpenAI gpt-image-1 (base64 response → PNG). Writes to
 * public/backgrounds/_candidates/ and updates a manifest the ContactSheet reads.
 *
 *   bun run art --landmark pennybacker --level heightened [--format 16x9] [--quality high]
 *   bun run art --all --level heightened --format 16x9      # every landmark
 *
 * Requires OPENAI_API_KEY. Chosen winners get moved to public/backgrounds/ (committed).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { composePrompt, LANDMARKS, type FantasyLevel, type LandmarkKey } from "../prompts/art/compose";
import type { Format } from "../src/schema/beats";

const SIZE: Record<Format, string> = { "16x9": "1536x1024", "1x1": "1024x1024", "9x16": "1024x1536" };
const CANDIDATES = "public/backgrounds/_candidates";
const MANIFEST = join(CANDIDATES, "manifest.json");

const args = process.argv.slice(2);
const flag = (name: string, def?: string) => {
  const eq = args.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(name);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : def;
};
const has = (name: string) => args.includes(name);

const level = (flag("--level", "heightened") as FantasyLevel);
const format = (flag("--format", "16x9") as Format);
const quality = flag("--quality", "high")!;
const landmarks: LandmarkKey[] = has("--all")
  ? (Object.keys(LANDMARKS) as LandmarkKey[])
  : [(flag("--landmark", "pennybacker") as LandmarkKey)];

if (!process.env.OPENAI_API_KEY) {
  console.error("✗ OPENAI_API_KEY not set");
  process.exit(1);
}

mkdirSync(CANDIDATES, { recursive: true });
type Entry = { file: string; landmark: string; level: string; format: string; name: string };
const manifest: Entry[] = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];

async function generate(landmark: LandmarkKey) {
  const prompt = composePrompt(landmark, level, format);
  const fname = `${landmark}-${level}-${format}.png`;
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
  const entry: Entry = { file: `backgrounds/_candidates/${fname}`, landmark: LANDMARKS[landmark].name, level, format, name: fname };
  const idx = manifest.findIndex((m) => m.name === fname);
  if (idx >= 0) manifest[idx] = entry; else manifest.push(entry);
  console.log("ok");
}

for (const lm of landmarks) {
  await generate(lm);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\n✓ ${landmarks.length} image(s) → ${CANDIDATES}/  (manifest: ${manifest.length} total)`);
