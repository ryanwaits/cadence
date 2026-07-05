/**
 * `cadence study` — brand extraction → a theme. Give a brand accent (or a URL to
 * guess it from), get a full ThemeConfig JSON (+ a portable design.md) you render
 * with `--theme-file`.
 *
 *   cadence study --accent "#10b981" --name emerald
 *   cadence study --from-url https://example.com --name acme
 *   cadence create <beats> --theme-file themes/emerald.json
 *
 * Screenshot → theme: this script extracts from a hex/URL only. To build a theme
 * from a screenshot, hand the image to your agent (Claude/Cursor/Codex) — it reads
 * the palette and writes a themes/<name>.json. See the cadence skill.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { deriveTheme } from "../src/theme/derive";
import { findCadenceDir } from "./_theme";

const args = process.argv.slice(2);
const flag = (n: string) => {
  const eq = args.find((a) => a.startsWith(`${n}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(n);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : undefined;
};

const parseHex = (hex: string) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
};
const saturated = (hex: string) => {
  const { r, g, b } = parseHex(hex);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  return mx - mn > 55 && l > 40 && l < 220;
};

async function accentFromUrl(url: string): Promise<string | undefined> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    console.error(`couldn't reach ${url}: ${res.status} ${res.statusText}`);
    return undefined;
  }
  const html = await res.text();
  const meta = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-fA-F]{3,6})["']/i);
  if (meta) return meta[1].toLowerCase();
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
    const h = "#" + m[1].toLowerCase();
    if (saturated(h)) counts.set(h, (counts.get(h) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

let accent = flag("--accent");
const fromUrl = flag("--from-url");
if (!accent && fromUrl) {
  try {
    accent = await accentFromUrl(fromUrl);
  } catch (e) {
    console.error(`couldn't reach ${fromUrl}: ${(e as Error).message}`);
    process.exit(1);
  }
  console.error(accent ? `· extracted accent ${accent} from ${fromUrl}` : `· couldn't find an accent at ${fromUrl}`);
}
if (!accent) {
  console.error("usage: cadence study --accent '#10b981' [--ink #0f172a] [--paper #f6f7f9] [--gold #c08a2e] --name <name>");
  console.error("   or: cadence study --from-url https://example.com --name <name>");
  process.exit(1);
}

if (!/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(accent)) {
  console.error(`✗ --accent must be a hex color (e.g. "#10b981"), got "${accent}"`);
  process.exit(1);
}
if (!accent.startsWith("#")) accent = `#${accent}`;

const name = flag("--name") ?? "brand";
const theme = deriveTheme({ name, accent, ink: flag("--ink"), paper: flag("--paper"), gold: flag("--gold") });

const cad = findCadenceDir(process.cwd());
const out = flag("--out") ?? (cad ? join(cad, "theme.json") : join("themes", `${name}.json`));
if (existsSync(out)) console.error(`· replacing existing ${out}`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(theme, null, 2));

// Portable design summary — a human-readable companion to the JSON.
const c = theme.colors;
const designMd = `# ${name} — design

Extracted accent: \`${accent}\`

## Palette
| role | color |
|------|-------|
| accent (signal) | \`${c.signalBlue}\` |
| ink (text) | \`${c.ink}\` |
| paper (bg) | \`${c.paper}\` |
| marker | \`${c.markerPink}\` |
| gold (version) | \`${c.gold}\` |
| success / warning / danger | \`${c.successGreen}\` / \`${c.warningYellow}\` / \`${c.dangerRed}\` |

## Fonts
- display: ${theme.fonts.display}
- body: ${theme.fonts.body}
- mono: ${theme.fonts.mono}

## Use
\`\`\`
cadence create <beats> --theme-file ${out}
\`\`\`
`;
const designOut = out.replace(/\.json$/, ".design.md");
writeFileSync(designOut, designMd);

const usageHint =
  cad && out === join(cad, "theme.json")
    ? "auto-discovered — cadence create/storyboard will pick it up with no --theme-file needed"
    : `render with:  cadence create <beats> --theme-file ${out}`;
console.log(`✓ ${name} theme (accent ${accent}) → ${out}\n  design summary → ${designOut}\n  ${usageHint}`);
