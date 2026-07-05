import { describe, expect, test } from "bun:test";
import { resolveCreateScript } from "./_route";

/**
 * `create` routing must be flag-aware: a beats-like *value* following a
 * VALUE_FLAG (e.g. `--theme-file themes/acme.json`) must not be mistaken for
 * the beats positional — that was the bug this suite guards against.
 */
describe("resolveCreateScript", () => {
  test("a .json flag VALUE does not misroute to render (the bug this plan fixes)", () => {
    expect(resolveCreateScript(["--release", "o/n", "--theme-file", "themes/acme.json"])).toBe("scripts/make.ts");
  });

  test("a real beats positional routes to render", () => {
    expect(resolveCreateScript(["x.beats.json"])).toBe("scripts/render.ts");
  });

  test("a beats positional + --dry-run routes to storyboard", () => {
    expect(resolveCreateScript(["x.beats.json", "--dry-run"])).toBe("scripts/storyboard.ts");
  });

  test("no positional → repo flow (make)", () => {
    expect(resolveCreateScript(["--release", "o/n"])).toBe("scripts/make.ts");
  });

  test("repo flow + --dry-run stays on make (make handles its own dry-run)", () => {
    expect(resolveCreateScript(["--release", "o/n", "--dry-run"])).toBe("scripts/make.ts");
  });

  test("a plain .json positional after a flag still routes to render", () => {
    expect(resolveCreateScript(["--out", "dir", "demo.json"])).toBe("scripts/render.ts");
  });
});
