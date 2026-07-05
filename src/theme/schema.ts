import { z } from "zod";
import { COLOR_ROLES, type ThemeConfig } from "./types";

/**
 * Runtime validator for a `ThemeConfig` (a hand-written or extracted theme
 * JSON) — the artifact `cadence study` produces and agents are told to
 * hand-write directly. Built from `COLOR_ROLES` (the same runtime list that
 * keeps `ThemeColors` in sync via the `_RolesMatch` assertion in `./types`),
 * so a new color role flows into this schema automatically; a new top-level
 * `ThemeConfig` field needs a line here (the round-trip check below fails
 * tsc until it's added).
 */
const colorsShape = Object.fromEntries(COLOR_ROLES.map((r) => [r, z.string()])) as Record<
  (typeof COLOR_ROLES)[number],
  z.ZodString
>;

export const themeConfigSchema = z
  .object({
    name: z.string(),
    colors: z.object(colorsShape).strict(),
    fonts: z
      .object({
        display: z.string(),
        body: z.string(),
        mono: z.string(),
        note: z.string(),
      })
      .strict(),
    floatShadow: z.string(),
    codeBg: z.string(),
    caretBg: z.string(),
    codeTheme: z
      .object({
        fg: z.string(),
        kw: z.string(),
        nw: z.string(),
        str: z.string(),
        num: z.string(),
        fn: z.string(),
        punct: z.string(),
        comment: z.string(),
      })
      .strict(),
    codeChrome: z.enum(["window", "minimal"]).optional(),
    backdrop: z.tuple([z.string(), z.string()]).optional(),
  })
  .strict();

// Compile-time round-trip check: the schema's inferred type must match
// `ThemeConfig` exactly (both directions) — else tsc fails here.
type _Inferred = z.infer<typeof themeConfigSchema>;
type _SchemaMatchesConfig = [ThemeConfig] extends [_Inferred] ? ([_Inferred] extends [ThemeConfig] ? true : never) : never;
const _schemaMatchesConfig: _SchemaMatchesConfig = true;
void _schemaMatchesConfig;
