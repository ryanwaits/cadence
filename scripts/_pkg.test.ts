import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveBin } from "./_pkg";

/**
 * `resolveBin` must find the hoisted `.bin` regardless of how deep the package
 * is nested. An unscoped install sits at `node_modules/<pkg>` (hoist one level
 * up); a scoped install sits at `node_modules/@scope/<pkg>` (hoist TWO up) — the
 * layout that used to silently break the global CLI.
 */
const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

/** Build a fake install tree; returns the package root and the hoisted `.bin` path. */
function makeInstall(pkgRel: string, bin: string): { root: string; hoistedBin: string } {
  const tmp = mkdtempSync(join(tmpdir(), "cadence-pkg-"));
  dirs.push(tmp);
  const hoistDir = join(tmp, "node_modules", ".bin");
  mkdirSync(hoistDir, { recursive: true });
  writeFileSync(join(hoistDir, bin), "#!/bin/sh\n");
  const root = join(tmp, "node_modules", pkgRel);
  mkdirSync(root, { recursive: true });
  return { root, hoistedBin: join(hoistDir, bin) };
}

describe("resolveBin", () => {
  test("resolves the hoisted bin for an unscoped install", () => {
    const { root, hoistedBin } = makeInstall("cadence", "remotion");
    expect(resolveBin(root, "remotion")).toBe(hoistedBin);
  });

  test("resolves the hoisted bin for a scoped install", () => {
    const { root, hoistedBin } = makeInstall(join("@waits", "cadence"), "tsx");
    expect(resolveBin(root, "tsx")).toBe(hoistedBin);
  });

  test("prefers a package-local bin over the hoist", () => {
    const { root } = makeInstall("cadence", "tsx");
    const localBin = join(root, "node_modules", ".bin");
    mkdirSync(localBin, { recursive: true });
    writeFileSync(join(localBin, "tsx"), "#!/bin/sh\n");
    expect(resolveBin(root, "tsx")).toBe(join(localBin, "tsx"));
  });

  test("falls back to the bare name when nothing is found", () => {
    const { root } = makeInstall("cadence", "tsx");
    expect(resolveBin(root, "remotion")).toBe("remotion");
  });
});
