import type { ChangelogInput } from "../../schema/beats";

/**
 * Composition v2 fixture — a `col` container nesting code OVER panel inside the
 * `lead` region (a layout the legacy `split` band cannot express: code is full-width
 * on top, the result panel below). Lives under `_fixtures/` so the regression gate
 * (which globs `src/content/*.beats.ts` at the top level only) never picks it up.
 *
 * Used to (T1) prove the recursive schema parses, and (T6) prove the container
 * renderer lays it out correctly across all three formats.
 */
const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "stacked",
      durationInFrames: 180,
      components: [
        { type: "eyebrow", placement: { region: "header" }, text: "new" },
        { type: "title", placement: { region: "lead" }, text: "Code over result." },
        {
          type: "col",
          placement: { region: "lead" },
          gap: 24,
          children: [
            {
              type: "code",
              code: {
                filename: "list.ts",
                lang: "ts",
                source: "const { folders } = await sl.list({ prefix: 'events/' });",
              },
            },
            {
              type: "panel",
              panel: {
                kind: "browser",
                title: "list({ prefix })",
                sections: [
                  {
                    label: "folders",
                    rows: [
                      { type: "folder", name: "events/", meta: "12" },
                      { type: "folder", name: "blocks/", meta: "3" },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};

export default video;
