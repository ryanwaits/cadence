/**
 * The luminist DNA preamble — constant across every "Hill Country Sublime"
 * painting. Encodes the Hudson River School lineage, the light, and the palette,
 * reconciled with the Field Notebook brand so paper/ink/Signal-Blue UI reads
 * cleanly on top. See ART-DIRECTION.md for the full rationale.
 */
export const STYLE = `A grand 19th-century Luminist landscape oil painting in the Hudson River School tradition of Albert Bierstadt, Thomas Moran, and Frederic Edwin Church. Soft painterly brushwork, deep atmospheric perspective, glowing diffuse light with a single cool source low in a clear sky, drifting haze and god-rays breaking through luminous towering clouds. Museum-quality, serene, monumental, contemplative. Palette of slate blue, steel and cerulean, cool limestone grey-white, sage and cedar green, pale periwinkle, and a luminous cobalt-to-cream sky echoing a signal blue (#2563eb) — cool, airy, and atmospheric, never garish.`;

/** Composition guidance so the painting works as a backdrop for the UI layer. */
export const COMPOSITION = {
  "16x9":
    "Compose for a wide 16:9 frame: keep the upper third a calm, uncluttered luminous sky and the lower third a still, mirror-like water plane — these are intentional areas of negative space for overlaid text and UI. The focal landform sits in the middle distance, slightly off-center.",
  "1x1":
    "Compose for a square 1:1 frame: generous calm sky filling the top half, a still water plane across the bottom, the focal landform centered in the middle distance. Leave the upper-center quiet for overlaid text.",
  "9x16":
    "Compose for a tall vertical 9:16 frame: a soaring luminous sky in the upper half, the focal landform in the middle band, and a still reflective water plane in the lower third. Keep the vertical center column calm for stacked UI overlays.",
} as const;

/** Always appended — keeps the frame clean for compositing. */
export const NEGATIVES = "No text, no lettering, no watermark, no people in the foreground, no modern vehicles, no signage, no harsh saturated colors.";
