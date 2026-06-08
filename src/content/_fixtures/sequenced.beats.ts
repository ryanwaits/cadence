import type { ChangelogInput } from "../../schema/beats";

/**
 * Composition v2 fixture — sequencing as DATA (T7). A `row` of two stat panels with
 * `revealAfter`: the second waits for the first to settle, so they count up one after
 * the other instead of together. Proves cross-node timing is authorable without
 * touching engine code. Lives under `_fixtures/` so the regression gate skips it.
 */
const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "two-stats",
      durationInFrames: 180,
      components: [
        { type: "title", placement: { region: "lead" }, text: "Two milestones." },
        {
          type: "row",
          placement: { region: "lead" },
          gap: 40,
          children: [
            { type: "panel", id: "first", panel: { kind: "stat", value: "1000000", label: "events indexed" } },
            // Reveals only after `first` has settled — sequenced, not simultaneous.
            { type: "panel", placement: { revealAfter: "first" }, panel: { kind: "stat", value: "250000", label: "requests / day" } },
          ],
        },
      ],
    },
  ],
};

export default video;
