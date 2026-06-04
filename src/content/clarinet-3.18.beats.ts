import type { ChangelogInput } from "../schema/beats";

/**
 * T0.1b — generalization proof on a TRUE external repo (stx-labs/clarinet, a Rust
 * CLI, not a TS SDK). Sourced generically:
 *   - latest substantive release: GitHub release v3.18.0 → "Clarity 6 preview" + linter
 *   - honest commands: README (clarinet check --show-lints, brew install clarinet)
 * No Secondlayer anything — different project, different shape (CLI/bash + checks).
 */
const BG = "backgrounds/pennybacker.png";

const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "opener",
      durationInFrames: 150,
      background: { src: BG },
      eyebrow: "new in clarinet 3.18",
      headline: "Clarity 6, in preview.",
    },
    {
      id: "lint",
      durationInFrames: 220,
      background: { src: BG },
      eyebrow: "clarinet check",
      headline: "Lint as you check.",
      code: {
        filename: "terminal",
        lang: "bash",
        source: `clarinet contract new counter
clarinet check --show-lints`,
      },
      panel: {
        kind: "status",
        title: "clarinet check",
        services: [
          { name: "counter.clar", state: "ok", detail: "checked" },
          { name: "type analysis", state: "ok" },
          { name: "unnecessary_tuple", state: "idle", detail: "style lint" },
          { name: "clarity 6", state: "ok", detail: "preview" },
        ],
      },
    },
    {
      id: "cta",
      durationInFrames: 160,
      background: { src: BG },
      headline: "Start building.",
      layout: "center",
      code: { filename: "terminal", lang: "bash", source: `brew install clarinet` },
      badge: "v3.18",
      caption: "write · test · deploy on Stacks",
    },
  ],
};

export default video;
