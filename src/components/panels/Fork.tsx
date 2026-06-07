import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, RADIUS } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { enterStyle, staggerDelay } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { STYLES } from "../../templates/active";
import { PanelCard, PanelHeader } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "fork" }>;
type Block = Spec["blocks"][number];

const S = STYLES.panel.byKind.fork as {
  headerTitleSize: number;
  headerTitleWeight: number;
  headerMetaSize: number;
  body: { padding: string };
  chip: { fontSize: number; padding: string; radiusRole: keyof typeof RADIUS; orphanOpacity: number };
  chainGap: number;
  forkRow: { gap: number; marginTop: number };
  archivedBadge: { fontSize: number; fontWeight: number; tracking: string; padding: string; radiusRole: keyof typeof RADIUS };
  note: { marginTop: number; fontSize: number };
};

const Chip: React.FC<{ block: Block; style?: React.CSSProperties }> = ({ block, style }) => {
  const orphaned = block.state === "orphaned";
  const isNew = block.state === "new";
  return (
    <span
      style={{
        fontFamily: FONTS.mono,
        fontSize: S.chip.fontSize,
        fontVariantNumeric: "tabular-nums",
        padding: S.chip.padding,
        borderRadius: RADIUS[S.chip.radiusRole],
        whiteSpace: "nowrap",
        background: isNew ? COLORS.signalBlueSoft : COLORS.chrome,
        border: `1px solid ${isNew ? COLORS.signalBlueBorder : COLORS.hairline}`,
        color: isNew ? COLORS.signalBlue : orphaned ? COLORS.textMuted : COLORS.ink,
        textDecoration: orphaned ? "line-through" : "none",
        opacity: orphaned ? S.chip.orphanOpacity : 1,
        ...style,
      }}
    >
      {block.height} · {block.hash}
    </span>
  );
};

/** An honest fork: the canonical chain forks, the orphan is archived, the new tip lights up. */
export const ForkPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const canonical = spec.blocks.filter((b) => b.state === "canonical");
  const orphan = spec.blocks.find((b) => b.state === "orphaned");
  const newTip = spec.blocks.find((b) => b.state === "new");

  const forkIn = interpolate(frame, [54, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
  const noteIn = interpolate(frame, [76, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  return (
    <PanelCard motion={spec.motion}>
      <PanelHeader>
        <span style={{ color: COLORS.ink, fontSize: S.headerTitleSize, fontWeight: S.headerTitleWeight }}>onReorg</span>
        <span style={{ fontSize: S.headerMetaSize, color: COLORS.textMuted }}>archive-on-reorg</span>
      </PanelHeader>

      <div style={{ padding: S.body.padding }}>
        {/* canonical chain */}
        <div style={{ display: "flex", alignItems: "center", gap: S.chainGap, flexWrap: "wrap" }}>
          {canonical.map((b, i) => {
            const start = staggerDelay(i, 9);
            const p = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
            return (
              <span key={b.height} style={{ display: "inline-flex", alignItems: "center", gap: 10, ...enterStyle("stagger", p) }}>
                {i > 0 && <span style={{ color: COLORS.textMuted }}>→</span>}
                <Chip block={b} />
              </span>
            );
          })}
        </div>

        {/* the fork: orphan archived, new canonical lit */}
        <div style={{ display: "flex", alignItems: "center", gap: S.forkRow.gap, marginTop: S.forkRow.marginTop, opacity: forkIn, transform: `translateY(${(1 - forkIn) * 8}px)` }}>
          {orphan && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Chip block={orphan} />
              <span style={{ fontFamily: FONTS.mono, fontSize: S.archivedBadge.fontSize, fontWeight: S.archivedBadge.fontWeight, textTransform: "uppercase", letterSpacing: S.archivedBadge.tracking, color: COLORS.gold, background: COLORS.goldSoft, padding: S.archivedBadge.padding, borderRadius: RADIUS[S.archivedBadge.radiusRole] }}>archived</span>
            </span>
          )}
          {orphan && newTip && <span style={{ color: COLORS.textMuted }}>↳</span>}
          {newTip && <Chip block={newTip} />}
        </div>

        <div style={{ marginTop: S.note.marginTop, fontFamily: FONTS.note, fontSize: S.note.fontSize, color: COLORS.signalBlue, opacity: noteIn }}>
          rewound to {spec.rewindTo} — archived, never lost
        </div>
      </div>
    </PanelCard>
  );
};
