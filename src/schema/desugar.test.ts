import { describe, expect, test } from "bun:test";
import type { Beat } from "./beats";
import { CONTAINER_TYPES, nodeSchema, type ComponentInstance } from "./composition";
import { desugarBeat } from "./desugar";

/**
 * Golden lock for the §3 field→region mapping table. These assert the exact
 * (type, region, order, align, size) tuple per legacy field plus that `code`/
 * `panel` specs are carried VERBATIM — locking the byte-identical contract.
 */

const pick = (cs: ComponentInstance[], type: ComponentInstance["type"]) =>
  cs.find((c) => c.type === type);

describe("desugarBeat — §3 mapping table", () => {
  test("split code + panel feature beat (eyebrow/headline/code/panel)", () => {
    const code = {
      filename: "index.ts",
      lang: "ts" as const,
      source: "export const x = 1;",
      theme: "light" as const,
      motion: { enter: "rise" as const, delay: 4 },
    };
    const panel = {
      kind: "feed" as const,
      title: "feed",
      status: "live…",
      rows: [{ badge: "NEW", label: "row", value: "v" }],
    };
    const beat: Beat = {
      id: "feature",
      durationInFrames: 120,
      eyebrow: "shipped",
      headline: "A new API",
      headlineMotion: { enter: "rise", delay: 8 },
      layout: "split",
      code,
      panel,
    };

    const { components } = desugarBeat(beat);

    const eyebrow = pick(components, "eyebrow");
    expect(eyebrow).toMatchObject({
      type: "eyebrow",
      text: "shipped",
      placement: { region: "header", align: "center", size: "auto", order: 0 },
    });

    const title = pick(components, "title");
    expect(title).toMatchObject({
      type: "title",
      text: "A new API",
      motion: { enter: "rise", delay: 8 },
      placement: { region: "lead", align: "center", size: "auto", order: 0 },
    });

    const codeC = pick(components, "code");
    expect(codeC).toMatchObject({
      type: "code",
      placement: { region: "lead", align: "start", size: "fill", order: 10 },
    });
    // VERBATIM carry — same object reference, no re-shaping.
    expect((codeC as Extract<ComponentInstance, { type: "code" }>).code).toBe(code);

    const panelC = pick(components, "panel");
    expect(panelC).toMatchObject({
      type: "panel",
      placement: { region: "trailing", align: "start", size: "md", order: 0 },
    });
    expect((panelC as Extract<ComponentInstance, { type: "panel" }>).panel).toBe(panel);

    // No footer caption/badge on this beat.
    expect(pick(components, "caption")).toBeUndefined();
    expect(pick(components, "badge")).toBeUndefined();
  });

  test("hero + note closer (caption → subhead in lead, note → lead, no footer)", () => {
    const beat: Beat = {
      id: "closer",
      durationInFrames: 90,
      headline: "my-package",
      caption: "one-line pitch",
      note: "thanks for reading",
      hero: true,
      layout: "center",
    };

    const { components } = desugarBeat(beat);

    expect(pick(components, "title")).toMatchObject({
      placement: { region: "lead", align: "center", size: "auto", order: 0 },
      text: "my-package",
    });

    // hero ⇒ caption becomes a subhead in lead (order 1), NOT a footer caption.
    expect(pick(components, "caption")).toMatchObject({
      type: "caption",
      variant: "subhead",
      placement: { region: "lead", align: "center", size: "auto", order: 1 },
      text: "one-line pitch",
    });

    expect(pick(components, "note")).toMatchObject({
      type: "note",
      placement: { region: "lead", align: "center", size: "auto", order: 2 },
      text: "thanks for reading",
    });

    // hero ⇒ no footer (caption was routed to lead, no badge).
    const footerInstances = components.filter((c) => c.placement?.region === "footer");
    expect(footerInstances).toHaveLength(0);
  });

  test("install center beat (eyebrow/headline/caption→footer/badge→footer)", () => {
    const beat: Beat = {
      id: "install",
      durationInFrames: 100,
      eyebrow: "get started",
      headline: "Install it",
      caption: "available now on npm",
      badge: "v1.0",
      layout: "center",
    };

    const { components } = desugarBeat(beat);

    expect(pick(components, "eyebrow")).toMatchObject({
      placement: { region: "header", align: "center", size: "auto", order: 0 },
    });

    // non-hero ⇒ caption goes to the footer (order 1), variant footer.
    expect(pick(components, "caption")).toMatchObject({
      type: "caption",
      variant: "footer",
      placement: { region: "footer", align: "center", size: "auto", order: 1 },
      text: "available now on npm",
    });

    // badge → footer order 0.
    expect(pick(components, "badge")).toMatchObject({
      type: "badge",
      placement: { region: "footer", align: "center", size: "auto", order: 0 },
      text: "v1.0",
    });
  });

  test("desugar stays FLAT — no container wrapping, every node is a valid leaf", () => {
    // Composition v2 keeps legacy desugar a depth-0 tree: the code-left/panel-right
    // band is reproduced renderer-side (regions), NOT by wrapping in a row/col. This
    // locks that contract — a regression that wrapped legacy fields in a container
    // would change the render path and likely break byte-identity.
    const beat: Beat = {
      id: "feature",
      durationInFrames: 120,
      eyebrow: "shipped",
      headline: "A new API",
      layout: "split",
      code: { filename: "i.ts", lang: "ts", source: "1", theme: "light" },
      panel: { kind: "stat", value: "1M", label: "events" },
    };

    const { components } = desugarBeat(beat);

    const containers = new Set<string>(CONTAINER_TYPES);
    for (const c of components) {
      expect(containers.has(c.type)).toBe(false); // no row/col/grid/group
      expect(() => nodeSchema.parse(c)).not.toThrow(); // each leaf is a valid tree node
    }
  });

  test("pass-through: an authored components array is returned untouched", () => {
    const authored: ComponentInstance[] = [
      { type: "title", placement: { region: "lead" }, text: "hand-authored" },
    ];
    const beat = {
      id: "authored",
      durationInFrames: 60,
      components: authored,
    } as unknown as Beat;

    const result = desugarBeat(beat);
    expect(result.components).toBe(authored);
  });
});
