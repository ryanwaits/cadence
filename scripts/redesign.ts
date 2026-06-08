/**
 * `cadence redesign <beats>` — re-skin an existing beats file: override the
 * background / motion fingerprint and theme while preserving all content
 * (headlines, code, panels). Writes a new beats JSON to out/ and renders it.
 *
 *   cadence redesign src/content/mainnet-launch.beats.ts --theme slate
 *   cadence redesign x.beats.ts --background "gradient:#312e81,#0b1120" --enter rise
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { changelogSchema, type Beat } from "../src/schema/beats";
import type { Node } from "../src/schema/composition";
import { normalizeVideo } from "../src/schema/normalize";
import { ENTER_PRESETS, EXIT_PRESETS } from "../src/motion/names";
import { binPath, pkgFile } from "./_pkg";

const args = process.argv.slice(2);
const flag = (n: string) => {
  const eq = args.find((a) => a.startsWith(`${n}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(n);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : undefined;
};

const file = args.find((a) => !a.startsWith("-"));
if (!file) {
  console.error("usage: cadence redesign <beats.ts|.json> [--background B] [--enter E] [--exit X] [--theme T] [--format F] [--frame N]");
  process.exit(1);
}

// Same background mini-DSL as `make`: gradient:#a,#b | solid:#hex | image:file.png
function parseBackground(s: string): Beat["background"] {
  if (s === "shapes") return { shapes: true, treatment: "static", angle: 160 };
  const kind = s.slice(0, s.indexOf(":"));
  const rest = s.slice(s.indexOf(":") + 1);
  if (kind === "gradient") {
    const [from, to] = rest.split(",");
    return { gradient: [from, to], angle: 155, treatment: "kenburns" };
  }
  if (kind === "solid") return { solid: rest, angle: 160, treatment: "static" };
  if (kind === "image") return { src: rest.includes("/") ? rest : `backgrounds/${rest}`, angle: 160, treatment: "kenburns" };
  console.error(`unknown --background "${s}" (gradient:#a,#b | solid:#hex | image:file.png)`);
  process.exit(1);
}

const bg = flag("--background");
const bgSpec = bg ? parseBackground(bg) : undefined;
const enter = flag("--enter");
const exit = flag("--exit");
if (enter && !(ENTER_PRESETS as readonly string[]).includes(enter)) {
  console.error(`unknown --enter "${enter}". have: ${ENTER_PRESETS.join(", ")}`);
  process.exit(1);
}
if (exit && !(EXIT_PRESETS as readonly string[]).includes(exit)) {
  console.error(`unknown --exit "${exit}". have: ${EXIT_PRESETS.join(", ")}`);
  process.exit(1);
}

const raw = file.endsWith(".json")
  ? JSON.parse(readFileSync(resolve(file), "utf8"))
  : (await import(pathToFileURL(resolve(file)).href)).default;
const parsed = changelogSchema.parse(normalizeVideo(raw));

// Re-skin: override style fields, preserve content (the `components` tree).
const enterVal = enter as (typeof ENTER_PRESETS)[number] | undefined;
const exitVal = exit as (typeof EXIT_PRESETS)[number] | undefined;

/** Merge the enter/exit override onto the FIRST `title` node in the tree. */
function setTitleMotion(nodes: Node[]): Node[] {
  let done = false;
  const walk = (ns: Node[]): Node[] =>
    ns.map((n) => {
      if (done) return n;
      if (n.type === "title") {
        done = true;
        return { ...n, motion: { ...(n.motion ?? {}), ...(enterVal ? { enter: enterVal } : {}), ...(exitVal ? { exit: exitVal } : {}) } };
      }
      if ("children" in n) return { ...n, children: walk(n.children) };
      return n;
    });
  return walk(nodes);
}

parsed.beats = parsed.beats.map((b) => {
  const beat: Beat = bgSpec ? { ...b, background: bgSpec } : { ...b };
  if (enterVal || exitVal) beat.components = setTitleMotion(beat.components ?? []);
  return beat;
});

mkdirSync("out", { recursive: true });
const name = basename(file).replace(/\.beats\.(ts|js|json)$/, "").replace(/\.(ts|js|json)$/, "");
const outBeats = join("out", `${name}.redesign.beats.json`);
writeFileSync(outBeats, JSON.stringify(parsed));
console.error(`· redesigned ${name} → ${outBeats}`);

const passthru = ["--theme", "--theme-file", "--format", "--frame"].flatMap((f) => (flag(f) ? [f, flag(f)!] : []));
const res = spawnSync(binPath("tsx"), [pkgFile("scripts/render.ts"), outBeats, ...passthru], { stdio: "inherit" });
process.exit(res.status ?? 0);
