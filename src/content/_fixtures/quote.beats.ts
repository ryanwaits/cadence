import type { ChangelogInput } from "../../schema/beats";

/** Seam proof (T10) — a `quote` panel kind added purely via the registry (schema +
 * component + one line). No renderer/union/template edits; `--explain` + SKILL list
 * it automatically. */
const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "testimonial",
      durationInFrames: 180,
      components: [
        { type: "title", placement: { region: "lead" }, text: "What they're saying." },
        {
          type: "panel",
          placement: { region: "trailing" },
          panel: {
            kind: "quote",
            text: "cadence turned our release notes into a video in minutes.",
            author: "A. Developer",
            role: "Maintainer, acme/cli",
          },
        },
      ],
    },
  ],
};

export default video;
