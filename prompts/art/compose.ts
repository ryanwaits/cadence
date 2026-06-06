import type { Format } from "../../src/schema/beats";
import { COMPOSITION, NEGATIVES, STYLE } from "./style";
import { LANDMARKS, type LandmarkKey } from "./landmarks";
import { FANTASY, type FantasyLevel } from "./fantasy";

/**
 * Build the full image-gen prompt for a freeform subject × fantasy level × format.
 * `style`/`negatives` default to the built-in luminist look; a pack or `--style-file`
 * can override them. `COMPOSITION` (UI-safe framing) is always engine-supplied.
 * `brand` (from `--brand`, a project's theme palette) appends a last, explicit
 * palette nudge so it dominates any color the base style mentions.
 */
export function composePrompt(opts: {
  subject: string;
  level: FantasyLevel;
  style?: string;
  negatives?: string;
  format: Format;
  brand?: { accent?: string; paper?: string };
}): string {
  const brand = opts.brand?.accent
    ? `Tune the palette toward the brand: a ${opts.brand.accent} accent${opts.brand.paper ? ` over ${opts.brand.paper}-toned light` : ""} — cohesive and harmonious, never garish.`
    : "";
  return [
    opts.style ?? STYLE,
    `Subject: ${opts.subject}.`,
    FANTASY[opts.level],
    COMPOSITION[opts.format],
    brand,
    opts.negatives ?? NEGATIVES,
  ]
    .filter(Boolean)
    .join(" ");
}

export { LANDMARKS, FANTASY };
export type { LandmarkKey, FantasyLevel };
