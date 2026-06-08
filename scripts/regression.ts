/**
 * Byte-identical render gate. Renders a still at every beat's mid frame, across
 * every `src/content/*.beats.ts` × format, hashes the PNG bytes, and diffs the
 * hashes against a committed baseline (`.regression/golden.json`). This is the
 * "perceptual pixel-diff against committed references" that `smoke.ts` names as
 * the missing follow-up — the hard gate the Composition v2 refactor renders
 * against (legacy output must stay byte-identical through the renderer rewrite).
 *
 *   bun run check:render            # diff against the baseline, exit 1 on drift
 *   tsx scripts/regression.ts --update   # (re)capture the baseline
 *   tsx scripts/regression.ts --quick    # 16x9 only (fast local loop)
 *
 * Only the hash manifest is committed (small JSON); the PNGs render to a temp dir
 * and are discarded. Remotion stills are deterministic for a fixed (props, frame,
 * scale, version), so sha256 of the bytes is a strict equality check. If renderer
 * version bumps legitimately change output, re-run with --update and review the diff.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Format } from "../src/schema/beats";
import { TEMPLATES } from "../src/templates/registry";
import { beatTimings, loadBeats } from "./_beats";
import { binPath, pkgFile, PKG_ROOT } from "./_pkg";

const args = process.argv.slice(2);
const has = (f: string) => args.includes(f);
const UPDATE = has("--update");
const QUICK = has("--quick");
const SCALE = (args.find((a) => a.startsWith("--scale="))?.split("=")[1]) ?? "0.5";
/** Restrict to content files whose name contains this substring (local loop). Skips baseline writes. */
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1];

const FORMATS: Format[] = QUICK ? ["16x9"] : ["16x9", "1x1", "9x16"];
const CONTENT_DIR = pkgFile("src/content");
const GOLDEN = join(PKG_ROOT, ".regression", "golden.json");

const bin = binPath("remotion");
const entry = pkgFile("src/index.ts");

const sha = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

/** Render one still and return its hash, or null on render failure. */
function renderHash(propsPath: string, frame: number, out: string, env: NodeJS.ProcessEnv): string | null {
  const res = spawnSync(
    bin,
    ["still", entry, "Changelog", out, `--props=${propsPath}`, `--frame=${frame}`, `--scale=${SCALE}`],
    { stdio: ["ignore", "ignore", "pipe"], env, encoding: "utf8" },
  );
  if (res.status !== 0 || !existsSync(out) || statSync(out).size === 0) {
    process.stderr.write((res.stderr || "").split("\n").slice(-4).join("\n") + "\n");
    return null;
  }
  return sha(out);
}

const files = readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith(".beats.ts"))
  .filter((f) => !ONLY || f.includes(ONLY))
  .sort();

if (UPDATE && (ONLY || QUICK)) {
  console.error("✗ refusing to write a partial baseline — drop --only/--quick when using --update");
  process.exit(1);
}

const tmp = join(PKG_ROOT, "out", ".regression-tmp");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const hashes: Record<string, string> = {};
let failed = 0;

for (const f of files) {
  const name = f.replace(/\.beats\.ts$/, "");
  for (const format of FORMATS) {
    const parsed = await loadBeats(join(CONTENT_DIR, f));
    parsed.format = format;

    // Mirror render.ts env wiring: template field + its bound default theme.
    const env: NodeJS.ProcessEnv = { ...process.env };
    if (parsed.template) {
      env.REMOTION_VIDEO_TEMPLATE = parsed.template;
      if (TEMPLATES[parsed.template]) env.REMOTION_VIDEO_THEME = TEMPLATES[parsed.template].theme;
    }

    const propsPath = join(tmp, `props-${name}-${format}.json`);
    writeFileSync(propsPath, JSON.stringify(parsed));

    const { timings } = beatTimings(parsed.beats);
    timings.forEach((t, i) => {
      const key = `${name}/${format}/beat-${i}@${t.mid}`;
      const out = join(tmp, `${name}-${format}-${i}.png`);
      process.stdout.write(`· ${key} … `);
      const h = renderHash(propsPath, t.mid, out, env);
      if (h === null) {
        failed++;
        console.log("RENDER FAIL");
      } else {
        hashes[key] = h;
        console.log("ok");
      }
    });
  }
}

rmSync(tmp, { recursive: true, force: true });

if (failed) {
  console.error(`\n✗ ${failed} stills failed to render — cannot ${UPDATE ? "capture baseline" : "run gate"}`);
  process.exit(1);
}

const sorted = Object.fromEntries(Object.keys(hashes).sort().map((k) => [k, hashes[k]]));

if (UPDATE) {
  mkdirSync(join(PKG_ROOT, ".regression"), { recursive: true });
  writeFileSync(GOLDEN, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\n✓ baseline captured — ${Object.keys(sorted).length} stills → ${GOLDEN}`);
  process.exit(0);
}

if (!existsSync(GOLDEN)) {
  console.error(`\n✗ no baseline at ${GOLDEN} — run \`tsx scripts/regression.ts --update\` first`);
  process.exit(1);
}

const golden: Record<string, string> = JSON.parse(readFileSync(GOLDEN, "utf8"));
const changed: string[] = [];
const missing: string[] = []; // in baseline, not rendered now
const added: string[] = []; // rendered now, not in baseline

for (const k of Object.keys(sorted)) {
  if (!(k in golden)) added.push(k);
  else if (golden[k] !== sorted[k]) changed.push(k);
}
// A partial run (--only / --quick) renders a subset, so absent baseline keys are
// expected, not drift — only a full run can assert completeness.
const partial = !!ONLY || QUICK;
if (!partial) for (const k of Object.keys(golden)) if (!(k in sorted)) missing.push(k);

if (changed.length || missing.length || added.length) {
  console.error(`\n✗ render drift vs baseline:`);
  for (const k of changed) console.error(`  ~ changed: ${k}`);
  for (const k of missing) console.error(`  - missing: ${k}`);
  for (const k of added) console.error(`  + new:     ${k}`);
  console.error(`\nIf intentional, review then re-run with --update.`);
  process.exit(1);
}

console.log(`\n✓ ${Object.keys(sorted).length} stills byte-identical to baseline`);
