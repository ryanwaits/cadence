import type { TemplateStyle } from "./types";
import { fieldNotebook } from "./field-notebook";

/**
 * Registry of built-in templates (the stylistic layer). Phase 1 ships only
 * `field-notebook` (the current look, extracted); a second template proves the
 * seam but isn't required for the rewrite (OD #4 — deferred). Adding a template
 * is a code change (styling + layout + motion bundle).
 */
export const TEMPLATES: Record<string, TemplateStyle> = {
  "field-notebook": fieldNotebook,
};
