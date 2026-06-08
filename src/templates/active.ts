import { activeTheme } from "../theme";
import type { ColorRole, TemplateStyle } from "./types";
import { fieldNotebook } from "./field-notebook";
import { TEMPLATES } from "./registry";

/**
 * The active template, selected at bundle time (env vars Remotion inlines into
 * the bundle) — an exact mirror of `activeTheme` (see `src/theme/index.ts`). A
 * full template can be injected as JSON via `REMOTION_VIDEO_TEMPLATE_JSON`;
 * otherwise a named preset via `REMOTION_VIDEO_TEMPLATE`. `scripts/render.ts`
 * sets these alongside `--theme`; Studio → `field-notebook`.
 */
function resolveActiveTemplate(): TemplateStyle {
  const json = process.env.REMOTION_VIDEO_TEMPLATE_JSON;
  if (json) {
    try {
      return JSON.parse(json) as TemplateStyle;
    } catch {
      /* fall through to a named preset */
    }
  }
  return TEMPLATES[process.env.REMOTION_VIDEO_TEMPLATE ?? "field-notebook"] ?? fieldNotebook;
}

export const activeTemplate: TemplateStyle = resolveActiveTemplate();

export const STYLES = activeTemplate.styles;
export const MOTION = activeTemplate.motion;
export const LAYOUT_MODEL = activeTemplate.layout;

/**
 * role → theme token; the only template↔theme coupling (spec §4). An optional
 * per-node `override` role wins over the template's default role — the resolution
 * chain for node `style.color`/`bg` (T8). Both are ROLES (never raw hex), so a node
 * override still re-colors on a theme swap. `undefined` override → the base role.
 */
export const resolveRole = (r: ColorRole, override?: ColorRole) => activeTheme.colors[override ?? r];
