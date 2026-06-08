import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../brand/tokens";
import { FONTS } from "../brand/fonts";
import { BACKGROUNDS, LAYOUT_MODEL, MOTION, STYLES, resolveRole } from "../templates/active";
import { isLightBackdrop } from "../brand/tone";
import type { Beat, Format } from "../schema/beats";
import type { ComponentInstance, ComponentType, Node, Region } from "../schema/composition";
import { Headline } from "./Headline";
import { Scrim, type ScrimSpec } from "./Scrim";
import { codeTypingDoneFrame } from "../motion/timing";
import { renderNode, sizeOf, slotStyle } from "./layout";
import { groupByRegion, pickIn } from "./layout/regions";

// Frame-timing comes from the active template's tokens (typing speed, output gap,
// settle) — see `MOTION.timing`. `OUTPUT_GAP`/`SETTLE` are no longer hardcoded.
const OUTPUT_GAP = MOTION.timing.outputGap;
/** Default frames a non-code node's entrance takes to settle (for revealAfter chains). */
const SETTLE = MOTION.timing.settle;

/** The legibility wash for a beat: an explicit `background.scrim` wins; else a `hero`
 * beat over an image gets the template default (so white titles stay readable over
 * bright paintings). Everything else → none (Scrim renders nothing). */
const resolveScrim = (beat: Beat): ScrimSpec | undefined => {
  const explicit = beat.background?.scrim;
  if (explicit && explicit.strength > 0) return explicit;
  if (beat.layout === "hero" && beat.background?.src) return BACKGROUNDS.heroScrim;
  return explicit;
};

/**
 * One beat: painting backdrop + Field Notebook UI layer. Renders by WALKING the
 * beat's `components` tree grouped into the four named regions (header/lead/
 * trailing/footer), then emitting three render blocks:
 *
 *   1. Headline  — eyebrow (header) + title/subhead/note (lead) re-composited
 *      into ONE `<Headline>`. This is the one place a region is *logical*, not a
 *      separate DOM band: a single block preserves shadow/spacing exactly.
 *   2. Lead/trailing band — the `code` instance (lead) + `panel` instance
 *      (trailing), reflowed row (16x9 split) vs stacked column.
 *   3. Footer bar — footer caption + badge (suppressed for hero beats).
 *
 * Containers (`row`/`col`/`grid`/`group`) compose inside a region; a simple beat
 * is just a flat leaf list. Per-format geometry + size tiers come from
 * `LAYOUT_MODEL` (the template), not hardcoded here. Reflow is renderer-side:
 * 16:9 lays code + panel side-by-side; square/vertical stack them in a column.
 */
export const ChangelogScene: React.FC<{ beat: Beat; format: Format }> = ({ beat, format }) => {
  const frame = useCurrentFrame();
  const isWide = format === "16x9";
  // `center` and `hero` both center the content band full-frame; `hero` additionally
  // centers the headline + suppresses the footer (see `hero` below).
  const centered = beat.layout === "center" || beat.layout === "hero";
  const stack = !isWide || centered;
  const light = isLightBackdrop(beat.background);
  const captionIn = interpolate(frame, [40, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  // Walk the composition tree, grouped by region. Code tokens (`code.code.tokens`)
  // are filled by `calculateMetadata` (prepare.ts) upstream.
  const { components } = beat;
  const hero = beat.layout === "hero";

  // Group nodes by region (the on-brand top-level skeleton) — shared with `inspect`.
  const byRegion = groupByRegion(components);

  // Band geometry + size tiers from the template (hero/centered ⇒ full-frame).
  const region = LAYOUT_MODEL.regions[format].lead ?? {};
  const heroRegion = LAYOUT_MODEL.variants.hero.lead ?? {};
  const band = LAYOUT_MODEL.bands[format];
  const footerGeom = LAYOUT_MODEL.regions[format].footer ?? {};

  // --- Block 1: re-composite header + lead text into ONE <Headline>. ---
  const eyebrowC = pickIn(byRegion.header, "eyebrow");
  const titleC = pickIn(byRegion.lead, "title");
  const subheadC = pickIn(byRegion.lead, "caption", (c) => c.variant === "subhead");
  const noteC = pickIn(byRegion.lead, "note");

  // --- Block 2: the lead/trailing band — non-text nodes, walked generically so
  //     containers (row/col/grid) compose. A simple beat is just [code, panel]. ---
  const TEXT_TYPES = new Set(["title", "eyebrow", "caption", "note", "badge"]);
  const bandNodes = [...byRegion.lead, ...byRegion.trailing].filter((n) => !TEXT_TYPES.has(n.type));

  // Sequential reveal, resolved as DATA (T7). A node's base reveal is its
  // `revealAfter` target's done-frame + gap; absent that, a panel falls back to the
  // legacy default — wait for the band's code (anywhere in the tree) to finish typing.
  // This is the ONE timing path: the legacy code→panel coupling is just the default.
  const findCode = (nodes: Node[]): Extract<Node, { type: "code" }> | undefined => {
    for (const n of nodes) {
      if (n.type === "code") return n;
      if ("children" in n) {
        const f = findCode(n.children);
        if (f) return f;
      }
    }
    return undefined;
  };
  const codeForReveal = findCode(bandNodes);

  const byId = new Map<string, Node>();
  const indexIds = (nodes: Node[]): void => {
    for (const n of nodes) {
      if (n.id) byId.set(n.id, n);
      if ("children" in n) indexIds(n.children);
    }
  };
  indexIds(bandNodes);

  // doneFrame/baseReveal are mutually recursive over `revealAfter` references; the
  // `seen` set guards against an authored cycle (treated as reveal 0).
  const doneFrame = (node: Node, seen: Set<Node>): number => {
    if (seen.has(node)) return 0;
    seen.add(node);
    const base = baseReveal(node, seen);
    return node.type === "code" ? base + codeTypingDoneFrame(node.code.tokens ?? [], node.code.motion) : base + SETTLE;
  };
  const baseReveal = (node: Node, seen: Set<Node> = new Set()): number => {
    const after = node.placement?.revealAfter;
    if (after && byId.has(after)) return doneFrame(byId.get(after)!, seen) + OUTPUT_GAP;
    // Legacy default: a panel waits for the band's code to finish typing.
    if (node.type === "panel" && codeForReveal) return codeTypingDoneFrame(codeForReveal.code.tokens ?? [], codeForReveal.code.motion) + OUTPUT_GAP;
    return 0;
  };

  // --- Block 3: footer caption + badge. ---
  const footerCaptionC = pickIn(byRegion.footer, "caption", (c) => c.variant === "footer");
  const badgeC = pickIn(byRegion.footer, "badge");

  // Background is a continuous layer in Changelog (so same-bg beats don't
  // re-fade); this scene renders only the content that transitions per beat.
  return (
    <AbsoluteFill>
      {/* Per-beat legibility wash behind the content (the backdrop layer is continuous). */}
      <Scrim scrim={resolveScrim(beat)} />
      <Headline
        eyebrow={eyebrowC?.text}
        headline={titleC?.text ?? ""}
        subhead={subheadC?.text}
        note={noteC?.text}
        place={hero ? "center" : "top"}
        motion={titleC?.motion}
        format={format}
        light={light}
        eyebrowColor={eyebrowC?.style?.color}
        titleColor={titleC?.style?.color}
        subheadColor={subheadC?.style?.color}
        noteColor={noteC?.style?.color}
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
        {bandNodes.map((n, i) => (
          // Both cards mount immediately so a result panel is present while the code
          // types; `reveal` (carried in ctx) holds the panel's *content* until done.
          <div key={i} style={slotStyle(sizeOf(n), stack, band)}>
            {renderNode(n, { band, format, revealOf: baseReveal, staggerOffset: 0 })}
          </div>
        ))}
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
