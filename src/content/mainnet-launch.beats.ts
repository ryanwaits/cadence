import type { ChangelogInput } from "../schema/beats";

/**
 * A product *announcement* (not a changelog) — same engine, different shape:
 * opener title card → big stat → feature → install closer. Mirrors the arc of a
 * classic launch video.
 */
const PENNYBACKER = "backgrounds/pennybacker.png";
const BONNELL = "backgrounds/mount-bonnell.png";

const video: ChangelogInput = {
  format: "16x9",
  beats: [
    // 1 · Opener — headline only over the painting
    {
      id: "opener",
      durationInFrames: 150,
      background: { src: PENNYBACKER },
      eyebrow: "announcing",
      headline: "Secondlayer is live on mainnet.",
    },
    // 2 · Big stat — the announcement primitive (counts up)
    {
      id: "scale",
      durationInFrames: 170,
      background: { src: BONNELL },
      headline: "Indexed from genesis.",
      panel: { kind: "stat", value: "10,000,000", label: "events decoded", sub: "block 0 → chain tip" },
    },
    // 3 · Feature — code + live panel
    {
      id: "query",
      durationInFrames: 235,
      background: { src: PENNYBACKER },
      headline: "Query it in three lines.",
      code: {
        filename: "events.ts",
        lang: "ts",
        source: `const { events } = await sl.index.events({
  eventType: "ft_transfer",
  limit: 50,
});`,
      },
      panel: {
        kind: "feed",
        title: "index.events",
        subtitle: "ft_transfer",
        rows: [
          { badge: "sBTC", label: "SP2J6…WVEF", value: "1,200.00" },
          { badge: "USDA", label: "SP3K9…X1A0", value: "48.50" },
          { badge: "ALEX", label: "SPF8M…7QQC", value: "9,000.00" },
          { badge: "sBTC", label: "SP1Y4…NZ2D", value: "150.00" },
        ],
      },
    },
    // 4 · Install closer — centered terminal + tagline caption
    {
      id: "cta",
      durationInFrames: 160,
      background: { src: BONNELL },
      headline: "Start building.",
      layout: "center",
      code: { filename: "terminal", lang: "bash", source: `bun add @secondlayer/sdk` },
      badge: "v6.3",
      caption: "index · streams · datasets · subgraphs · subscriptions",
    },
  ],
};

export default video;
