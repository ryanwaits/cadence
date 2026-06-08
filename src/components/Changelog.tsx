import { AbsoluteFill, Sequence, Series } from "remotion";
import { COLORS } from "../brand/tokens";
import type { Beat, ChangelogVideo } from "../schema/beats";
import { Background } from "./Background";
import { ChangelogScene } from "./ChangelogScene";

/** Frames of crossfade when the backdrop actually changes between beats. */
const XFADE = 18;

/** Identity key for a backdrop — beats that resolve to the same key share one
 * continuous Background (no transition between them). Omitted background and an
 * explicit `shapes` both resolve to the default procedural backdrop. */
function bgKey(bg: Beat["background"]): string {
  if (!bg || bg.shapes) return "shapes";
  if (bg.src) return `img:${bg.src}:${bg.treatment ?? "kenburns"}`;
  if (bg.gradient) return `grad:${bg.gradient[0]},${bg.gradient[1]}:${bg.angle ?? 160}`;
  if (bg.solid) return `solid:${bg.solid}`;
  return "shapes";
}

type Segment = { key: string; bg: Beat["background"]; from: number; duration: number };

/** Collapse consecutive same-backdrop beats into segments laid end-to-end. */
function backgroundSegments(beats: Beat[]): Segment[] {
  const segs: Segment[] = [];
  let frame = 0;
  for (const b of beats) {
    const key = bgKey(b.background);
    const last = segs[segs.length - 1];
    if (last && last.key === key) last.duration += b.durationInFrames;
    else segs.push({ key, bg: b.background, from: frame, duration: b.durationInFrames });
    frame += b.durationInFrames;
  }
  return segs;
}

/**
 * Top-level composition. The backdrop is a **continuous layer** underneath the
 * content: consecutive beats with the same backdrop share one Background (so it
 * doesn't fade out/in or reset its Ken Burns between them) — only the content
 * (headline, code, panel) transitions per beat. A real backdrop change
 * crossfades (the next segment starts XFADE frames early and fades in on top).
 * Duration/dimensions/tokens are set by `calculateMetadata` in Root.
 */
export const Changelog: React.FC<ChangelogVideo> = ({ format, beats }) => {
  const segments = backgroundSegments(beats);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      {segments.map((seg, i) => {
        const from = i === 0 ? 0 : Math.max(0, seg.from - XFADE);
        return (
          <Sequence key={`${seg.key}-${seg.from}`} from={from} durationInFrames={seg.from + seg.duration - from} layout="none">
            <Background bg={seg.bg} fadeIn={i > 0} />
          </Sequence>
        );
      })}
      <Series>
        {beats.map((beat) => (
          <Series.Sequence key={beat.id} durationInFrames={beat.durationInFrames}>
            <ChangelogScene beat={beat} format={format} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
