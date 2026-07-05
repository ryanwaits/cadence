import { describe, expect, test } from "bun:test";
import { deriveTheme } from "./derive";
import { themeConfigSchema } from "./schema";

describe("deriveTheme", () => {
  test("valid accent produces colors that are hex or rgba, and round-trips through the schema", () => {
    const theme = deriveTheme({ accent: "#10b981" });
    for (const value of Object.values(theme.colors)) {
      expect(value).toMatch(/^(#[0-9a-f]{6}|rgba\(.+\))$/i);
    }
    const json = JSON.parse(JSON.stringify(theme));
    expect(themeConfigSchema.safeParse(json).success).toBe(true);
  });

  test("invalid accent throws instead of producing NaN colors", () => {
    expect(() => deriveTheme({ accent: "blue" })).toThrow();
  });

  test("3-digit hex accent works", () => {
    const theme = deriveTheme({ accent: "#0f0" });
    expect(theme.colors.signalBlue).toBe("#0f0");
    expect(themeConfigSchema.safeParse(theme).success).toBe(true);
  });
});
