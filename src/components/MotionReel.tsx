import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, FLOAT_SHADOW, RADIUS } from "../brand/tokens";
import { FONTS } from "../brand/fonts";
import { ENTER_PRESETS, type EnterPreset } from "../motion/names";
import { countValue, drawDashoffset, enterStyle, staggerDelay, typewriterChars } from "../motion/presets";

const LOOP = 90; // each preset replays every 3s
const DUR = 22; // entrance length in frames

const NOTES: Record<EnterPreset, string> = {
  rise: "headlines",
  settle: "windows + panels",
  bloom: "backgrounds",
  type: "code + terminal",
  stagger: "list rows",
  draw: "diagrams + badge",
  count: "metrics",
};

/** Pure eased 0→1 progress within the current loop (no hooks). */
const reveal = (frame: number, delay = 0, dur = DUR) =>
  interpolate(frame % LOOP, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });

const Tile: React.FC<{ name: EnterPreset; children: React.ReactNode }> = ({ name, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: 28,
      borderRadius: RADIUS.lg,
      background: COLORS.paperElevated,
      border: `1px solid ${COLORS.hairline}`,
    }}
  >
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.ink }}>{name}</span>
      <span style={{ fontFamily: FONTS.note, fontSize: 22, color: COLORS.textMuted }}>{NOTES[name]}</span>
    </div>
  </div>
);

/** A small mock "window" used by the transform presets. */
const MockCard: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={{ width: 180, height: 96, borderRadius: RADIUS.md, background: COLORS.paper, border: `1px solid ${COLORS.hairline}`, boxShadow: FLOAT_SHADOW, ...style }}>
    <div style={{ height: 22, borderBottom: `1px solid ${COLORS.hairline}`, display: "flex", gap: 5, alignItems: "center", paddingLeft: 9 }}>
      {["#f87171", "#fbbf24", "#34d399"].map((c) => (<span key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />))}
    </div>
  </div>
);

const Demo: React.FC<{ name: EnterPreset }> = ({ name }) => {
  const frame = useCurrentFrame();
  const p = reveal(frame);
  switch (name) {
    case "rise":
    case "settle":
    case "bloom":
      return <MockCard style={enterStyle(name, p)} />;
    case "stagger":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 200 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 24, borderRadius: RADIUS.sm, background: COLORS.signalBlueSoft, border: `1px solid ${COLORS.signalBlueBorder}`, ...enterStyle("stagger", reveal(frame, staggerDelay(i, 6))) }} />
          ))}
        </div>
      );
    case "type": {
      const src = "sl.index.events()";
      return <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.ink, whiteSpace: "pre" }}>{src.slice(0, typewriterChars(p, src.length))}<Caret /></span>;
    }
    case "draw": {
      const C = 2 * Math.PI * 34;
      return (
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle cx={60} cy={60} r={34} fill="none" stroke={COLORS.markerPink} strokeWidth={4} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={drawDashoffset(p, C)} transform="rotate(-90 60 60)" />
          <text x={60} y={68} textAnchor="middle" fontFamily={FONTS.note} fontSize={28} fill={COLORS.markerPink} opacity={p}>NEW</text>
        </svg>
      );
    }
    case "count":
      return <span style={{ fontFamily: FONTS.mono, fontSize: 46, fontWeight: 600, color: COLORS.ink, fontVariantNumeric: "tabular-nums" }}>{Math.round(countValue(p, 9000)).toLocaleString()}</span>;
  }
};

const Caret: React.FC = () => {
  const frame = useCurrentFrame();
  return <span style={{ display: "inline-block", width: 10, height: 22, transform: "translateY(4px)", background: COLORS.ink, opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }} />;
};

export const MotionReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.paper, backgroundImage: `radial-gradient(${COLORS.hairline} 1px, transparent 1px)`, backgroundSize: "30px 30px", padding: 72 }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 46, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.ink, marginBottom: 8 }}>Motion vocabulary</div>
      <div style={{ fontFamily: FONTS.note, fontSize: 26, color: COLORS.signalBlue, marginBottom: 36 }}>ease-out only — smooth enters, snappy pops</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {ENTER_PRESETS.map((name) => (
          <Tile key={name} name={name}><Demo name={name} /></Tile>
        ))}
      </div>
    </AbsoluteFill>
  );
};
