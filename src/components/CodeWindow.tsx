import { useCurrentFrame } from "remotion";
import { CARET_BG, CODE_CHROME, COLORS, FLOAT_SHADOW } from "../brand/tokens";
import { FONTS } from "../brand/fonts";
import { CARD_ENTER, useMotion, type MotionSpec } from "../motion/useMotion";
import { codeTypingDoneFrame, totalChars, typeStartFor } from "../motion/timing";
import { MOTION } from "../templates/active";
import { CODE_BG, type CodeLine } from "../code/highlight";

type Props = {
  filename: string;
  tokens: CodeLine[];
  motion?: MotionSpec;
  fontSize?: number;
  /** Per-node chrome override (node `style.chrome`). Falls back to the theme's `CODE_CHROME`. */
  chrome?: "window" | "minimal" | "none";
};

// Frame-timing helpers now live in motion/timing.ts (pure, Remotion-free, shared with
// node scripts). Re-exported so existing importers keep resolving from here.
export { codeTypingDoneFrame };

/** Floating code window with a single-caret typewriter over pre-tokenized code. */
export const CodeWindow: React.FC<Props> = ({ filename, tokens, motion = CARD_ENTER, fontSize = 22, chrome }) => {
  const frame = useCurrentFrame();
  const style = useMotion(motion);
  // Per-node override wins; "minimal"/"none" are both chromeless. Undefined ⇒ theme default.
  const minimal = (chrome ?? CODE_CHROME) !== "window";

  const typeStart = typeStartFor(motion);
  const total = totalChars(tokens);
  const revealed = Math.min(total, Math.max(0, Math.round((frame - typeStart) * MOTION.timing.typingSpeed)));
  const typing = revealed < total; // caret only while typing; gone once "run"
  const caretOn = Math.floor(frame / 8) % 2 === 0;

  let budget = revealed;
  let caretPlaced = false; // exactly one caret, at the typing head
  const lineHeight = Math.round(fontSize * 1.7);

  const placeCaret = () => {
    if (typing && !caretPlaced) {
      caretPlaced = true;
      return true;
    }
    return false;
  };

  const lines = tokens.map((line, li) => {
    const out: React.ReactNode[] = [];
    let caretHere = false;
    for (let ti = 0; ti < line.length; ti++) {
      const tok = line[ti];
      if (budget <= 0) { caretHere = placeCaret(); break; }
      const take = Math.min(tok.content.length, budget);
      out.push(<span key={ti} style={{ color: tok.color }}>{tok.content.slice(0, take)}</span>);
      budget -= take;
      if (take < tok.content.length) { caretHere = placeCaret(); break; }
    }
    if (budget > 0) budget -= 1; // newline cost
    else if (line.length === 0) caretHere = caretHere || placeCaret();
    return (
      <div key={li} style={{ minHeight: lineHeight, whiteSpace: "pre" }}>
        {out}
        {caretHere && (
          <span
            style={{
              display: "inline-block",
              width: fontSize * 0.5,
              height: fontSize,
              transform: "translateY(3px)",
              background: CARET_BG,
              boxShadow: "0 0 0 1.5px rgba(110,92,60,0.45)",
              borderRadius: 2,
              opacity: caretOn ? 1 : 0,
            }}
          />
        )}
      </div>
    );
  });

  return (
    <div
      style={{
        width: "100%",
        borderRadius: minimal ? 12 : 20,
        background: `${CODE_BG}f7`,
        boxShadow: FLOAT_SHADOW,
        backdropFilter: "blur(6px)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.55)",
        ...style,
      }}
    >
      {!minimal && (
        <div style={{ height: 54, display: "flex", alignItems: "center", padding: "0 22px", gap: 9 }}>
          <Dot color="#f6645f" /><Dot color="#f7bd45" /><Dot color="#2fc94e" />
          <span style={{ flex: 1, textAlign: "center", color: "rgba(0,0,0,0.34)", fontSize: 15, fontFamily: FONTS.mono, marginRight: 60 }}>{filename}</span>
        </div>
      )}
      <div style={{ padding: minimal ? "30px 34px" : "26px 40px 42px", fontFamily: FONTS.mono, fontSize, lineHeight: `${lineHeight}px`, color: COLORS.ink }}>
        {lines}
      </div>
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span style={{ width: 13, height: 13, borderRadius: "50%", background: color, display: "inline-block" }} />
);
