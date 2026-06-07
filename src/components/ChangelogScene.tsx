import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../brand/tokens";
import { FONTS } from "../brand/fonts";
import { LAYOUT_MODEL, STYLES, resolveRole } from "../templates/active";
import { isLightBackdrop } from "../brand/tone";
import type { Beat, Format } from "../schema/beats";
import { desugarBeat } from "../schema/desugar";
import type { ComponentInstance } from "../schema/composition";
import { Headline } from "./Headline";
import { CodeWindow, codeTypingDoneFrame } from "./CodeWindow";
import { Panel } from "./panels";

/** Beat after the code finishes typing before the output panel "runs". */
const OUTPUT_GAP = 10;

/** Narrow a component instance by its discriminant. */
const pick = <T extends ComponentInstance["type"]>(
  cs: ComponentInstance[],
  type: T,
  match?: (c: Extract<ComponentInstance, { type: T }>) => boolean,
): Extract<ComponentInstance, { type: T }> | undefined =>
  cs.find(
    (c): c is Extract<ComponentInstance, { type: T }> =>
      c.type === type && (!match || match(c as Extract<ComponentInstance, { type: T }>)),
  ) as Extract<ComponentInstance, { type: T }> | undefined;

/**
 * One beat: painting backdrop + Field Notebook UI layer. Renders from the
 * DESUGARED component list (legacy beats desugar into the same instances an
 * authored `components` array would produce), grouped by region into the three
 * render blocks the scene has always emitted — byte-identical:
 *
 *   1. Headline  — eyebrow (header) + title/subhead/note (lead) re-composited
 *      into ONE `<Headline>` (a single DOM block preserves shadow/spacing).
 *   2. Lead/trailing band — the `code` instance (left) + `panel` instance
 *      (right), reflowed row (16x9 split) vs stacked column.
 *   3. Footer bar — footer caption + badge (suppressed for hero beats, which
 *      have no footer instances).
 *
 * Reflow is renderer-side (spec §3): 16:9 lays code + panel side-by-side;
 * square/vertical stack them in a column. Per-format geometry + size tiers come
 * from `LAYOUT_MODEL` (the template), not hardcoded here.
 */
export const ChangelogScene: React.FC<{ beat: Beat; format: Format }> = ({ beat, format }) => {
  const frame = useCurrentFrame();
  const isWide = format === "16x9";
  const centered = beat.layout === "center";
  const stack = !isWide || centered;
  const light = isLightBackdrop(beat.background);
  const captionIn = interpolate(frame, [40, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  // Walk the desugared composition. Code tokens flow through `code.code.tokens`
  // (the same object as `beat.code`, carried by reference in desugar) which is
  // filled by `calculateMetadata` upstream.
  const { components } = desugarBeat(beat);
  const hero = !!beat.hero;

  // Band geometry + size tiers from the template (hero/centered ⇒ full-frame).
  const region = LAYOUT_MODEL.regions[format].lead ?? {};
  const heroRegion = LAYOUT_MODEL.variants.hero.lead ?? {};
  const band = LAYOUT_MODEL.bands[format];
  const footerGeom = LAYOUT_MODEL.regions[format].footer ?? {};

  // --- Block 1: re-composite header + lead text into ONE <Headline>. ---
  const eyebrowC = pick(components, "eyebrow");
  const titleC = pick(components, "title");
  const subheadC = pick(components, "caption", (c) => c.variant === "subhead");
  const noteC = pick(components, "note");

  // --- Block 2: lead `code` + trailing `panel`. ---
  const codeC = pick(components, "code");
  const panelC = pick(components, "panel");

  // Sequential: the output panel waits for the code to finish "running".
  const panelStart = codeC ? codeTypingDoneFrame(codeC.code.tokens ?? [], codeC.code.motion) + OUTPUT_GAP : 0;

  // --- Block 3: footer caption + badge. ---
  const footerCaptionC = pick(components, "caption", (c) => c.variant === "footer");
  const badgeC = pick(components, "badge");

  // Background is a continuous layer in Changelog (so same-bg beats don't
  // re-fade); this scene renders only the content that transitions per beat.
  return (
    <AbsoluteFill>
      <Headline
        eyebrow={eyebrowC?.text}
        headline={titleC?.text ?? ""}
        subhead={subheadC?.text}
        note={noteC?.text}
        place={hero ? "center" : "top"}
        motion={titleC?.motion ?? beat.headlineMotion}
        format={format}
        light={light}
      />

      <div
        style={{
          position: "absolute",
          // Center beats (install / hero) center their content in the full frame;
          // split beats sit in the lower band beneath the headline.
          top: centered ? heroRegion.top : region.top,
          left: 0,
          right: 0,
          bottom: centered ? heroRegion.bottom : region.bottom,
          display: "flex",
          flexDirection: stack ? "column" : region.dir,
          alignItems: stack ? "center" : "flex-start",
          justifyContent: "center",
          gap: region.gap,
          padding: region.pad,
        }}
      >
        {codeC && (
          <div style={{ flex: stack ? "0 0 auto" : "1 1 0", width: stack ? "100%" : undefined, maxWidth: stack ? band.itemMax : band.codeMax }}>
            <CodeWindow filename={codeC.code.filename} tokens={codeC.code.tokens ?? []} motion={codeC.code.motion} fontSize={band.codeFont} />
          </div>
        )}
        {panelC && (
          <div style={{ flex: "0 0 auto", width: stack ? "100%" : band.panelW, maxWidth: stack ? band.itemMax : band.panelMax }}>
            {/* Both cards mount immediately so the result panel is present while the
                code types; `reveal` holds the panel's *content* until the code is done. */}
            <Panel spec={panelC.panel} reveal={panelStart} />
          </div>
        )}
      </div>

      {!hero && (footerCaptionC || badgeC) && (
        <div
          style={{
            position: "absolute",
            bottom: footerGeom.bottom,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            opacity: captionIn,
          }}
        >
          {badgeC && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: isWide ? STYLES.badge.size : 12,
                fontWeight: 600,
                letterSpacing: STYLES.badge.track,
                textTransform: "uppercase",
                color: resolveRole(STYLES.badge.fgRole),
                background: resolveRole(STYLES.badge.bgRole),
                padding: "4px 10px",
                borderRadius: STYLES.badge.radius,
              }}
            >
              {badgeC.text}
            </span>
          )}
          {footerCaptionC && (
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: isWide ? STYLES.caption.footerSize : STYLES.caption.subheadSize,
                color: light ? resolveRole(STYLES.caption.colorRole) : resolveRole("titleWhite"),
                opacity: light ? 1 : 0.86,
                textShadow: light ? "none" : STYLES.headline.shadows.subhead,
              }}
            >
              {footerCaptionC.text}
            </span>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
