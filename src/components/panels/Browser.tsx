import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "browser" }>;

const ROW_START = 24;

/** A Finder-style listing: folder rows (amber glyph + chevron) and file rows
 * (paper glyph + right-aligned size), grouped into optional labeled sections. */
export const BrowserPanel: React.FC<{ spec: Spec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  // Flat row index across sections so the reveal staggers top-to-bottom.
  let row = 0;
  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, fontWeight: 600, color: COLORS.ink }}>
          <FolderGlyph />
          {spec.title}
        </span>
        {spec.meta && <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted }}>{spec.meta}</span>}
      </PanelHeader>
      <div style={{ padding: "6px 0 14px" }}>
        {spec.sections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.textMuted, padding: "14px 26px 6px" }}>
                {section.label}
              </div>
            )}
            {section.rows.map((r, ri) => {
              const start = ROW_START + staggerDelay(row++, 7);
              const p = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
              return (
                <div key={ri} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 26px", fontFamily: FONTS.mono, fontSize: 18, color: COLORS.ink, ...enterStyle("stagger", p) }}>
                  {r.type === "folder" ? <FolderGlyph /> : <FileGlyph />}
                  <span style={{ flex: 1 }}>{r.name}</span>
                  {r.meta && <span style={{ color: COLORS.textMuted, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{r.meta}</span>}
                  {r.type === "folder" && !r.meta && <Chevron />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </PanelCard>
  );
};

const FolderGlyph: React.FC = () => (
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden style={{ flexShrink: 0 }}>
    <path d="M1 3.2c0-1 .8-1.8 1.8-1.8h4.3l1.7 1.8h8.4c1 0 1.8.8 1.8 1.8v8.2c0 1-.8 1.8-1.8 1.8H2.8C1.8 15 1 14.2 1 13.2V3.2Z" fill={COLORS.gold} />
  </svg>
);

const FileGlyph: React.FC = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden style={{ flexShrink: 0 }}>
    <path d="M2 1.6c0-.6.5-1.1 1.1-1.1h6.3L14.5 5v11.4c0 .6-.5 1.1-1.1 1.1H3.1c-.6 0-1.1-.5-1.1-1.1V1.6Z" fill="rgba(0,0,0,0.14)" />
    <path d="M9.4.5 14.5 5H10c-.3 0-.6-.3-.6-.6V.5Z" fill="rgba(0,0,0,0.28)" />
  </svg>
);

const Chevron: React.FC = () => (
  <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden style={{ flexShrink: 0 }}>
    <path d="M1.5 1.5 6 6.5l-4.5 5" stroke={COLORS.textMuted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
