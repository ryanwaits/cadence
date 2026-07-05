import { describe, expect, test } from "bun:test";
import { THEMES } from "./index";
import { themeConfigSchema } from "./schema";

describe("themeConfigSchema", () => {
  test("every built-in theme parses", () => {
    for (const [name, t] of Object.entries(THEMES)) {
      const result = themeConfigSchema.safeParse(t);
      expect(result.success).toBe(true);
      if (!result.success) console.error(name, result.error.issues);
    }
  });

  test("a minimal object fails with an issue path starting at colors", () => {
    const result = themeConfigSchema.safeParse({ name: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "colors")).toBe(true);
    }
  });

  test("an extra unknown top-level key fails (strict)", () => {
    const valid = THEMES.default;
    const result = themeConfigSchema.safeParse({ ...valid, extraUnknownField: true });
    expect(result.success).toBe(false);
  });
});
