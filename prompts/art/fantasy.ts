/**
 * The fantasy dial. Grounded keeps it plausibly Texan; Heightened is the default
 * launch register (recognizable but sublime); Mythic goes full Bierstadt fever-
 * dream. Same landmark, escalating wilderness around it.
 */
export const FANTASY = {
  grounded:
    "Keep the landmark and Texas Hill Country terrain recognizable and naturalistic — only the light is idealized: a glowing, atmospheric golden hour.",
  heightened:
    "Heighten the drama: exaggerate the scale of the cliffs and sky, widen the river into a grand basin, add distant snow-dusted Southwest peaks and deeper atmospheric haze — recognizable but sublime.",
  mythic:
    "Full sublime fantasy: impossible towering mesas and spires, a vast alpine-scale lake, layered floating mist, cathedral shafts of light — a dreamlike, mythic grandeur while the landmark remains just identifiable.",
} as const;

export type FantasyLevel = keyof typeof FANTASY;
