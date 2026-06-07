import type { CSSProperties, ReactNode } from "react";
import { FLOAT_SHADOW } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { CARD_ENTER, useMotion, type MotionSpec } from "../../motion/useMotion";
import { STYLES, resolveRole } from "../../templates/active";

/** Floating Field Notebook panel shell (translucent paper, hairline, float shadow). */
export const PanelCard: React.FC<{ motion?: MotionSpec; style?: CSSProperties; children: ReactNode }> = ({
  // Match the code window's entrance so both cards appear on the same frame.
  motion = CARD_ENTER,
  style,
  children,
}) => {
  const m = useMotion(motion);
  return (
    <div
      style={{
        width: "100%",
        borderRadius: STYLES.panel.radius,
        background: STYLES.panel.surface,
        boxShadow: FLOAT_SHADOW,
        border: `1px solid ${STYLES.panel.border}`,
        overflow: "hidden",
        fontFamily: FONTS[STYLES.panel.bodyFontRole],
        ...m,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const PanelHeader: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: STYLES.panel.headerPadding,
      borderBottom: `1px solid ${resolveRole(STYLES.panel.headerHairlineRole)}`,
    }}
  >
    {children}
  </div>
);
