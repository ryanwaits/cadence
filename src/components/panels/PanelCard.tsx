import type { CSSProperties, ReactNode } from "react";
import { COLORS, FLOAT_SHADOW, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { CARD_ENTER, useMotion, type MotionSpec } from "../../motion/useMotion";

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
        borderRadius: RADIUS.xl + 8,
        background: "rgba(252,251,247,0.95)",
        boxShadow: FLOAT_SHADOW,
        border: "1px solid rgba(255,255,255,0.6)",
        overflow: "hidden",
        fontFamily: FONTS.mono,
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
      padding: "20px 26px",
      borderBottom: `1px solid ${COLORS.hairline}`,
    }}
  >
    {children}
  </div>
);
