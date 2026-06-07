import type { TemplateStyle } from "./types";
import { fieldNotebook } from "./field-notebook";
import { terminal } from "./terminal";
import { instructional } from "./instructional";

/**
 * Registry of built-in templates (the stylistic layer). `field-notebook` is the
 * current look (extracted, byte-identical); `terminal` (dark monospace IDE,
 * bound to the midnight theme) and `instructional` (light airy tutorial, bound
 * to default) prove the styling layer isn't special-cased. Adding a template is
 * a code change (styling + layout + motion bundle).
 */
export const TEMPLATES: Record<string, TemplateStyle> = {
  "field-notebook": fieldNotebook,
  terminal,
  instructional,
};
