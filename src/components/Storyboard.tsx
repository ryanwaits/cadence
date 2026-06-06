import { AbsoluteFill, Img } from "remotion";
import { type Format } from "../schema/beats";
import { COLORS, RADIUS } from "../brand/tokens";
import { FONTS } from "../brand/fonts";

/**
 * A contact sheet for a beats file: one representative still per beat in a
 * labeled grid. Pure and props-driven — images arrive as base64 data URIs in
 * props (NOT staticFile/public, so it works from a global install), unlike
 * ContactSheet which fetches a manifest. `scripts/storyboard.ts` renders the
 * per-beat stills, encodes them, and renders this composition to a single PNG.
 */
export type StoryboardCell = { img: string; headline: string; panel: string; seconds: string };
export type StoryboardProps = { format: Format; name: string; cells: StoryboardCell[] };

const PAD = 56;
const GAP = 24;
const HEADER = 110;
const CAPTION = 56;
const WIDTH = 1600;

/**
 * Grid geometry + total canvas height for a given format and beat count. Used
 * both by the component (columns + cell aspect) and by `calculateMetadata` in
 * Root.tsx (canvas height) so the sheet fits its contents with no clipping.
 */
export function sheetLayout(format: Format, count: number) {
  const cols = format === "9x16" ? 4 : 3;
  const rows = Math.max(1, Math.ceil(count / cols));
  const cellW = (WIDTH - PAD * 2 - GAP * (cols - 1)) / cols;
  const ar = format === "16x9" ? 9 / 16 : format === "9x16" ? 16 / 9 : 1; // height / width
  const cellH = cellW * ar + CAPTION;
  const height = Math.round(HEADER + PAD * 2 + rows * cellH + (rows - 1) * GAP);
  const cellAspect = format === "16x9" ? "16 / 9" : format === "9x16" ? "9 / 16" : "1 / 1";
  return { cols, width: WIDTH, height, cellAspect };
}

export const Storyboard: React.FC<StoryboardProps> = ({ format, name, cells }) => {
  const { cols, cellAspect } = sheetLayout(format, cells.length);
  return (
    <AbsoluteFill style={{ background: COLORS.paper, padding: PAD, fontFamily: FONTS.body }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.ink }}>{name}</div>
      <div style={{ fontFamily: FONTS.note, fontSize: 22, color: COLORS.signalBlue, marginBottom: 28 }}>
        storyboard · {cells.length} beats · {format}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: GAP }}>
        {cells.map((c, i) => (
          <div key={i} style={{ borderRadius: RADIUS.lg, overflow: "hidden", border: `1px solid ${COLORS.hairline}`, background: COLORS.paperElevated }}>
            <Img
              src={c.img}
              onError={() => {}}
              delayRenderTimeoutInMilliseconds={8000}
              style={{ width: "100%", aspectRatio: cellAspect, objectFit: "cover", display: "block", background: COLORS.paper }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "12px 16px" }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {i + 1}. {c.headline}
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.textMuted, whiteSpace: "nowrap" }}>
                {c.panel} · {c.seconds}
              </span>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
