import type { Beat } from "./beats";
import type { ComponentInstance } from "./composition";

/**
 * DESUGAR (spec §3) — legacy Beat fields → composition `components`, byte-identical.
 *
 * Runs in `prepare.ts` BEFORE shiki tokenization, so a lifted `code.source` still
 * flows through the existing tokenize pass. If `beat.components` is already present
 * the beat is passed through untouched. Otherwise we build the array from the legacy
 * fields using the exact field→region mapping table below.
 *
 * Order numbers reserve 0–2 for text and 10 for code, so code never sorts above the
 * note within `lead`. `panelStart`/`reveal` is NOT computed here — the renderer
 * derives it per beat from any sibling `code` instance.
 *
 *   | field    | condition | type    | region   | align  | size | order |
 *   |----------|-----------|---------|----------|--------|------|-------|
 *   | eyebrow  | present   | eyebrow | header   | center | auto | 0     |
 *   | headline | always    | title   | lead     | center | auto | 0     |
 *   | caption  | hero      | caption | lead     | center | auto | 1     |  variant: subhead
 *   | note     | present   | note    | lead     | center | auto | 2     |
 *   | caption  | !hero     | caption | footer   | center | auto | 1     |  variant: footer
 *   | badge    | present   | badge   | footer   | center | auto | 0     |
 *   | code     | present   | code    | lead     | start  | fill | 10    |
 *   | panel    | present   | panel   | trailing | start  | md   | 0     |
 *
 * `hero`/`layout` are routing inputs, not components: desugar READS them to route
 * the caption (hero → subhead in `lead`; non-hero → footer) but never emits them.
 */
export function desugarBeat(beat: Beat): Beat & { components: ComponentInstance[] } {
  // Pass-through: an explicitly authored composition wins outright.
  if (beat.components) {
    return beat as Beat & { components: ComponentInstance[] };
  }

  const components: ComponentInstance[] = [];

  // eyebrow → header, order 0
  if (beat.eyebrow) {
    components.push({
      type: "eyebrow",
      placement: { region: "header", align: "center", size: "auto", order: 0 },
      text: beat.eyebrow,
    });
  }

  // headline → title in lead, order 0 (always present on the legacy path)
  if (beat.headline) {
    components.push({
      type: "title",
      placement: { region: "lead", align: "center", size: "auto", order: 0 },
      text: beat.headline,
      // `motion` defaulting (`{enter:"rise",delay:8}`) is the renderer's job; we
      // only carry an explicit per-beat headlineMotion when authored.
      ...(beat.headlineMotion ? { motion: beat.headlineMotion } : {}),
    });
  }

  // caption — hero ⇒ subhead in lead (order 1); non-hero ⇒ footer (order 1)
  if (beat.caption) {
    if (beat.hero) {
      components.push({
        type: "caption",
        placement: { region: "lead", align: "center", size: "auto", order: 1 },
        text: beat.caption,
        variant: "subhead",
      });
    } else {
      components.push({
        type: "caption",
        placement: { region: "footer", align: "center", size: "auto", order: 1 },
        text: beat.caption,
        variant: "footer",
      });
    }
  }

  // note → lead, order 2
  if (beat.note) {
    components.push({
      type: "note",
      placement: { region: "lead", align: "center", size: "auto", order: 2 },
      text: beat.note,
    });
  }

  // badge → footer, order 0 (per the table; non-hero is the only place a footer exists)
  if (beat.badge) {
    components.push({
      type: "badge",
      placement: { region: "footer", align: "center", size: "auto", order: 0 },
      text: beat.badge,
    });
  }

  // code → lead, align start, size fill, order 10 (carried verbatim)
  if (beat.code) {
    components.push({
      type: "code",
      placement: { region: "lead", align: "start", size: "fill", order: 10 },
      code: beat.code,
    });
  }

  // panel → trailing, align start, size md, order 0 (carried verbatim)
  if (beat.panel) {
    components.push({
      type: "panel",
      placement: { region: "trailing", align: "start", size: "md", order: 0 },
      panel: beat.panel,
    });
  }

  return { ...beat, components };
}
