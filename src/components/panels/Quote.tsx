import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "quote" }>;

/** A pull-quote / testimonial card. Added purely as a registry entry (schema +
 * this component + one PANEL_REGISTRY line) — no renderer or union edits. */
export const QuotePanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const inn = interpolate(frame, [6, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  return (
    <PanelCard motion={spec.motion}>
      <div style={{ padding: "30px 34px", opacity: inn }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 600, lineHeight: 1.32, color: COLORS.ink }}>“{spec.text}”</div>
        {(spec.author || spec.role) && (
          <div style={{ fontFamily: FONTS.body, fontSize: 15, color: COLORS.textMuted, marginTop: 18 }}>
            {spec.author}
            {spec.author && spec.role ? " · " : ""}
            {spec.role}
          </div>
        )}
      </div>
    </PanelCard>
  );
};
