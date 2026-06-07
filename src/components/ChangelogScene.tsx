import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../brand/tokens";
import { FONTS } from "../brand/fonts";
import { isLightBackdrop } from "../brand/tone";
import type { Beat, Format } from "../schema/beats";
import { Headline } from "./Headline";
import { CodeWindow, codeTypingDoneFrame } from "./CodeWindow";
import { Panel } from "./panels";

/** Beat after the code finishes typing before the output panel "runs". */
const OUTPUT_GAP = 10;

const LAYOUT = {
  "16x9": { top: "30%", dir: "row" as const, gap: 56, pad: "0 110px", codeFont: 24, codeMax: 820, panelW: 620, itemMax: 800 },
  "1x1": { top: "29%", dir: "column" as const, gap: 22, pad: "0 6%", codeFont: 17, codeMax: 940, panelW: "100%", itemMax: 940 },
  "9x16": { top: "23%", dir: "column" as const, gap: 30, pad: "0 6%", codeFont: 21, codeMax: 940, panelW: "100%", itemMax: 940 },
};

/**
 * One beat: painting backdrop + Field Notebook UI layer. Reflows by format —
 * 16:9 lays code + panel side-by-side; square/vertical stack them in a column.
 */
export const ChangelogScene: React.FC<{ beat: Beat; format: Format }> = ({ beat, format }) => {
  const frame = useCurrentFrame();
  const isWide = format === "16x9";
  const stack = !isWide || beat.layout === "center";
  const L = LAYOUT[format];
  const light = isLightBackdrop(beat.background);
  const captionIn = interpolate(frame, [40, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  // Sequential: the output panel waits for the code to finish "running".
  const panelStart = beat.code ? codeTypingDoneFrame(beat.code.tokens ?? [], beat.code.motion) + OUTPUT_GAP : 0;

  // Background is a continuous layer in Changelog (so same-bg beats don't
  // re-fade); this scene renders only the content that transitions per beat.
  return (
    <AbsoluteFill>
      <Headline
        eyebrow={beat.eyebrow}
        headline={beat.headline}
        subhead={beat.hero ? beat.caption : undefined}
        place={beat.hero ? "center" : "top"}
        motion={beat.headlineMotion}
        format={format}
        light={light}
      />

      <div
        style={{
          position: "absolute",
          top: L.top,
          left: 0,
          right: 0,
          bottom: "6%",
          display: "flex",
          flexDirection: stack ? "column" : L.dir,
          alignItems: stack ? "center" : "flex-start",
          justifyContent: "center",
          gap: L.gap,
          padding: L.pad,
        }}
      >
        {beat.code && (
          <div style={{ flex: stack ? "0 0 auto" : "1 1 0", width: stack ? "100%" : undefined, maxWidth: stack ? L.itemMax : L.codeMax }}>
            <CodeWindow filename={beat.code.filename} tokens={beat.code.tokens ?? []} motion={beat.code.motion} fontSize={L.codeFont} />
          </div>
        )}
        {beat.panel && (
          <div style={{ flex: "0 0 auto", width: stack ? "100%" : L.panelW, maxWidth: stack ? L.itemMax : 620 }}>
            <Sequence from={panelStart} layout="none">
              <Panel spec={beat.panel} />
            </Sequence>
          </div>
        )}
      </div>

      {!beat.hero && (beat.caption || beat.badge) && (
        <div
          style={{
            position: "absolute",
            bottom: "7%",
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            opacity: captionIn,
          }}
        >
          {beat.badge && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: isWide ? 14 : 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.gold,
                background: COLORS.goldSoft,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              {beat.badge}
            </span>
          )}
          {beat.caption && (
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: isWide ? 21 : 18,
                color: light ? COLORS.textMuted : COLORS.titleWhite,
                opacity: light ? 1 : 0.86,
                textShadow: light ? "none" : "0 1px 14px rgba(30,41,59,0.5)",
              }}
            >
              {beat.caption}
            </span>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
