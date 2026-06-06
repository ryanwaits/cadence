/**
 * Stage a merged public dir for a project render. Remotion's `--public-dir` is a
 * single replacement dir (not an overlay), and the engine's own `public/` holds
 * assets shipped beats reference (`mountains.jpg`, built-in `backgrounds/*.png`).
 * So when a project supplies its own art in `<project>/.cadence/backgrounds/`, we
 * merge the engine's `public/*` with the project's `backgrounds/` into a temp dir
 * and point `--public-dir` there — both built-in and project images resolve.
 *
 * `_candidates/` is excluded (the unpromoted generation pile — not for rendering).
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pkgFile } from "./_pkg";
import { findCadenceDir } from "./_theme";

const noCandidates = (src: string) => !src.includes(`${join("backgrounds", "_candidates")}`);

/** Returns an absolute staged public dir, or undefined when there's no project art. */
export function stagePublicDir(opts: { beatsFile?: string; outDir: string }): string | undefined {
  const start = opts.beatsFile ? dirname(resolve(opts.beatsFile)) : process.cwd();
  const cad = findCadenceDir(start);
  const projBg = cad ? join(cad, "backgrounds") : undefined;
  if (!projBg || !existsSync(projBg)) return undefined;

  const staged = resolve(opts.outDir, ".pub");
  rmSync(staged, { recursive: true, force: true });
  mkdirSync(staged, { recursive: true });
  cpSync(pkgFile("public"), staged, { recursive: true, filter: noCandidates });
  cpSync(projBg, join(staged, "backgrounds"), { recursive: true, filter: noCandidates });
  return staged;
}
