import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../brand/tokens";
import { FONTS } from "../brand/fonts";
import { LAYOUT_MODEL, STYLES, resolveRole } from "../templates/active";
import { isLightBackdrop } from "../brand/tone";
import type { Beat, Format } from "../schema/beats";
import { desugarBeat } from "../schema/desugar";
import type { ComponentInstance, Node, Region } from "../schema/composition";
import { Headline } from "./Headline";
import { OUTPUT_GAP, codeTypingDoneFrame } from "../motion/timing";
import { renderNode, sizeOf, slotStyle } from "./layout";

/** Default frames a non-code node's entrance takes to settle (for revealAfter chains). */
const SETTLE = 18;

/** A node's region: explicit placement wins, else the template's default for its type. */
const regionOf = (c: ComponentInstance): Region => c.placement?.region ?? LAYOUT_MODEL.defaultRegion[c.type];

/** Find the first node of `type` (optionally matching `match`) within a region's nodes. */
const pickIn = <T extends ComponentInstance["type"]>(
  cs: ComponentInstance[],
  type: T,
  match?: (c: Extract<ComponentInstance, { type: T }>) => boolean,
): Extract<ComponentInstance, { type: T }> | undefined =>
  cs.find(
    (c): c is Extract<ComponentInstance, { type: T }> =>
      c.type === type && (!match || match(c as Extract<ComponentInstance, { type: T }>)),
  ) as Extract<ComponentInstance, { type: T }> | undefined;

/**
 * One beat: painting backdrop + Field Notebook UI layer. Renders by WALKING the
 * DESUGARED component list grouped into the four named regions (header/lead/
 * trailing/footer), then emitting the three render blocks the scene has always
 * produced — byte-identical with the legacy path:
 *
 *   1. Headline  — eyebrow (header) + title/subhead/note (lead) re-composited
 *      into ONE `<Headline>`. This is the one place a region is *logical*, not a
 *      separate DOM band: a single block preserves shadow/spacing exactly.
 *   2. Lead/trailing band — the `code` instance (lead) + `panel` instance
 *      (trailing), reflowed row (16x9 split) vs stacked column.
 *   3. Footer bar — footer caption + badge (suppressed for hero beats).
 *
 * Containers (`row`/`col`/`grid`/`group`) are introduced in T6; legacy beats
 * desugar to a flat leaf list, so this region walk reproduces today's output with
 * no recursion. Per-format geometry + size tiers come from `LAYOUT_MODEL` (the
 * template), not hardcoded here. Reflow is renderer-side: 16:9 lays code + panel
 * side-by-side; square/vertical stack them in a column.
 */
export const ChangelogScene: React.FC<{ beat: Beat; format: Format }> = ({ beat, format }) => {
  const frame = useCurrentFrame();
  const isWide = format === "16x9";
  const centered = beat.layout === "center";
  const stack = !isWide || centered;
  const light = isLightBackdrop(beat.background);
  const captionIn = interpolate(frame, [40, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });

  // Walk the desugared composition, grouped by region. Code tokens flow through
  // `code.code.tokens` (the same object as `beat.code`, carried by reference in
  // desugar) which is filled by `calculateMetadata` upstream.
  const { components } = desugarBeat(beat);
  const hero = !!beat.hero;

  // Group leaves by region (the on-brand top-level skeleton).
  const byRegion: Record<Region, ComponentInstance[]> = { header: [], lead: [], trailing: [], footer: [] };
  for (const c of components) byRegion[regionOf(c)].push(c);

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
  //     containers (row/col/grid) compose. Legacy desugars to just [code, panel]. ---
  const TEXT_TYPES = new Set(["title", "eyebrow", "caption", "note", "badge"]);
  const bandNodes = [...byRegion.lead, ...byRegion.trailing].filter((n) => !TEXT_TYPES.has(n.type)) as Node[];

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
      <Headline
        eyebrow={eyebrowC?.text}
        headline={titleC?.text ?? ""}
        subhead={subheadC?.text}
        note={noteC?.text}
        place={hero ? "center" : "top"}
        motion={titleC?.motion ?? beat.headlineMotion}
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
