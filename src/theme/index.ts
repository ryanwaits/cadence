import type { ThemeConfig } from "./types";
import { defaultTheme } from "./default";
import { slateTheme } from "./slate";
import { LIBRARY } from "./library";

export type { ThemeConfig, ThemeColors } from "./types";

/** Registry of built-in themes. Add a brand's extracted theme here (or load it). */
export const THEMES: Record<string, ThemeConfig> = {
  default: defaultTheme,
  slate: slateTheme,
  ...LIBRARY,
};

/**
 * The active theme, selected at bundle time (env vars Remotion inlines into the
 * bundle). A full extracted theme can be injected as JSON via
 * `REMOTION_VIDEO_THEME_JSON`; otherwise a named preset via `REMOTION_VIDEO_THEME`.
 * `scripts/render.ts` sets these from `--theme-file` / `--theme`; Studio → `default`.
 */
function resolveActiveTheme(): ThemeConfig {
  const json = process.env.REMOTION_VIDEO_THEME_JSON;
  if (json) {
    try {
      return JSON.parse(json) as ThemeConfig;
    } catch {
      /* fall through to a named preset */
    }
  }
  return THEMES[process.env.REMOTION_VIDEO_THEME ?? "default"] ?? defaultTheme;
}

export const activeTheme: ThemeConfig = resolveActiveTheme();
