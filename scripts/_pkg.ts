/**
 * Path resolution that works both in-repo (dev) and from an installed npm
 * package. The engine's own files (the Remotion entry, sibling scripts, dep
 * bins) must resolve relative to *this package*, not the user's CWD — only
 * user-supplied paths (a beats file, the `out/` dir) are CWD-relative.
 */
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute path to the engine package root (one level above `scripts/`). */
export const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Absolute path to one of the engine's own files (e.g. `src/index.ts`). */
export const pkgFile = (rel: string) => join(PKG_ROOT, rel);

/**
 * Resolve a dependency's CLI bin, robust to install layout: package-local
 * `.bin` first (dev + nested installs), then the hoisted top-level `.bin`
 * (our package living under `node_modules/<pkg>`), else assume it's on PATH.
 */
export function binPath(name: string): string {
  const local = join(PKG_ROOT, "node_modules", ".bin", name);
  if (existsSync(local)) return local;
  const hoisted = resolve(PKG_ROOT, "..", ".bin", name);
  if (existsSync(hoisted)) return hoisted;
  return name;
}
