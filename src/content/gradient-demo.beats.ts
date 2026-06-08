import type { ChangelogInput } from "../schema/beats";

/**
 * Proves the AI-free style packs: a gradient background — no painting, no OpenAI,
 * no committed art. A brand-new user can render a video out of the box.
 */
const GRADIENT: [string, string] = ["#312e81", "#0b1120"]; // indigo → slate

const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "opener",
      durationInFrames: 150,
      background: { gradient: GRADIENT, angle: 155 },
      components: [
        { type: "eyebrow", text: "milestone" },
        { type: "title", text: "A million installs." },
      ],
    },
    {
      id: "stat",
      durationInFrames: 170,
      background: { gradient: GRADIENT, angle: 155 },
      components: [
        { type: "title", text: "Thank you." },
        { type: "panel", panel: { kind: "stat", value: "1,000,000", label: "downloads", sub: "and counting" } },
      ],
    },
  ],
};

export default video;
