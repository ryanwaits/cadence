import { AbsoluteFill } from "remotion";

/**
 * A dark legibility wash rendered behind a beat's content (in `ChangelogScene`, so
 * it's scoped per beat — the backdrop layer is continuous and shared across same-bg
 * beats). Fixes white centered/hero titles over bright paintings. Driven by the
 * beat's `background.scrim` (or a template default for hero-over-image, T2.6).
 * `strength` 0 ⇒ nothing renders, so non-scrim beats stay byte-identical.
 */
export type ScrimSpec = { strength: number; placement: "center" | "top" | "bottom" | "full" };

const scrimBackground = ({ strength: a, placement }: ScrimSpec): string => {
  switch (placement) {
    case "full":
      return `rgba(0,0,0,${a})`;
    case "top":
      return `linear-gradient(180deg, rgba(0,0,0,${a}) 0%, rgba(0,0,0,0) 55%)`;
    case "bottom":
      return `linear-gradient(0deg, rgba(0,0,0,${a}) 0%, rgba(0,0,0,0) 55%)`;
    default: // center — a soft dark vignette behind centered/hero text
      return `radial-gradient(ellipse 85% 65% at 50% 50%, rgba(0,0,0,${a}) 0%, rgba(0,0,0,${a * 0.5}) 45%, rgba(0,0,0,0) 75%)`;
  }
};

export const Scrim: React.FC<{ scrim?: ScrimSpec }> = ({ scrim }) =>
  scrim && scrim.strength > 0 ? <AbsoluteFill style={{ background: scrimBackground(scrim) }} /> : null;
