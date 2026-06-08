import type { ChangelogInput } from "../schema/beats";

/**
 * The Sprint-0 reference scene, re-expressed as pure data. Renders identically
 * through the changelog engine — `bun run render src/content/streams.beats.ts`.
 */
const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "stream",
      durationInFrames: 210,
      background: { src: "mountains.jpg" },
      components: [
        { type: "eyebrow", text: "new in sdk 5.5" },
        { type: "title", text: "Stream every Stacks event." },
        {
          type: "code",
          code: {
            filename: "stream.ts",
            lang: "ts",
            source: `import { Secondlayer } from "@secondlayer/sdk";

const sl = new Secondlayer({
  apiKey: process.env.SL_API_KEY,
});

const { events } = await sl.index.events({
  eventType: "ft_transfer",
  limit: 50,
});`,
          },
        },
        {
          type: "panel",
          panel: {
            kind: "feed",
            title: "index.events",
            subtitle: "ft_transfer",
            rows: [
              { badge: "sBTC", label: "SP2J6…WVEF", value: "1,200.00" },
              { badge: "USDA", label: "SP3K9…X1A0", value: "48.50" },
              { badge: "ALEX", label: "SPF8M…7QQC", value: "9,000.00" },
              { badge: "sBTC", label: "SP1Y4…NZ2D", value: "150.00" },
              { badge: "WELSH", label: "SPGR2…0KME", value: "73.25" },
            ],
          },
        },
      ],
    },
  ],
};

export default video;
