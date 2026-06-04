import type { Format } from "../../src/schema/beats";
import { COMPOSITION, NEGATIVES, STYLE } from "./style";
import { LANDMARKS, type LandmarkKey } from "./landmarks";
import { FANTASY, type FantasyLevel } from "./fantasy";

/** Build the full image-gen prompt for a landmark × fantasy level × format. */
export function composePrompt(landmark: LandmarkKey, level: FantasyLevel, format: Format): string {
  return [
    STYLE,
    `Subject: ${LANDMARKS[landmark].subject}.`,
    FANTASY[level],
    COMPOSITION[format],
    NEGATIVES,
  ].join(" ");
}

export { LANDMARKS, FANTASY };
export type { LandmarkKey, FantasyLevel };
