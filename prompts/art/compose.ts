import type { Format } from "../../src/schema/beats";
import { COMPOSITION, NEGATIVES, STYLE } from "./style";
import { LANDMARKS, type LandmarkKey } from "./landmarks";
import { FANTASY, type FantasyLevel } from "./fantasy";

/**
 * Build the full image-gen prompt for a freeform subject × fantasy level × format.
 * `style`/`negatives` default to the built-in luminist look; a pack or `--style-file`
 * can override them. `COMPOSITION` (UI-safe framing) is always engine-supplied.
 */
export function composePrompt(opts: {
  subject: string;
  level: FantasyLevel;
  format: Format;
  style?: string;
  negatives?: string;
}): string {
  return [
    opts.style ?? STYLE,
    `Subject: ${opts.subject}.`,
    FANTASY[opts.level],
    COMPOSITION[opts.format],
    opts.negatives ?? NEGATIVES,
  ].join(" ");
}

export { LANDMARKS, FANTASY };
export type { LandmarkKey, FantasyLevel };
