import type { ChangelogInput } from "../../schema/beats";

/**
 * Composition v2 fixture — per-node style overrides (T8). A gold title, a gold-tinted
 * `col` (style.bg, a ROLE so it stays themeable), and a chrome-less code node
 * (style.chrome "none" → no window frame). Proves "make this gold / drop the chrome
 * here" is authorable per-instance without touching the global theme.
 */
const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "styled",
      durationInFrames: 180,
      components: [
        { type: "title", placement: { region: "lead" }, text: "Per-node style.", style: { color: "gold" } },
        {
          type: "col",
          placement: { region: "lead" },
          gap: 18,
          style: { bg: "goldSoft", padding: "28px" },
          children: [
            { type: "code", style: { chrome: "none" }, code: { filename: "x.ts", lang: "ts", source: "const ok = true;" } },
            { type: "panel", panel: { kind: "stat", value: "42", label: "the answer" } },
          ],
        },
      ],
    },
  ],
};

export default video;
