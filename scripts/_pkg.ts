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
 * Resolve a dependency's CLI bin under `root`, robust to install layout:
 * package-local `.bin` first (dev + nested installs), then the hoisted
 * top-level `.bin`. The hoist sits one level above an unscoped package
 * (`node_modules/<pkg>`) but TWO levels above a scoped one
 * (`node_modules/@scope/<pkg>`), so both depths are checked; else assume PATH.
 */
export function resolveBin(root: string, name: string): string {
  const candidates = [
    join(root, "node_modules", ".bin", name),
    resolve(root, "..", ".bin", name),
    resolve(root, "..", "..", ".bin", name),
  ];
  return candidates.find(existsSync) ?? name;
}

/** Resolve a dependency's CLI bin relative to the engine package root. */
export function binPath(name: string): string {
  return resolveBin(PKG_ROOT, name);
}
