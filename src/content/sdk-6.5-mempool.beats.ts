import type { ChangelogInput } from "../schema/beats";

/**
 * T0.1 brain-spike output. Sourced entirely by reading the Secondlayer repo
 * GENERICALLY (no baked-in knowledge):
 *   - latest release: git tag `@secondlayer/sdk@6.5.0`
 *   - what changed: commits 6.4.0..6.5.0 → the Index mempool feature (+contractId filter)
 *   - honest API: packages/sdk/src/index-api/client.ts types + packages/sdk/README.md
 * Honesty ladder caught: the real class is `SecondLayer` (capital L), and the
 * real call is `sl.index.mempool.list({ contractId, limit })` returning `{ mempool }`.
 */
const BG = "backgrounds/mount-bonnell.png";

const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "opener",
      durationInFrames: 150,
      background: { src: BG },
      components: [
        { type: "eyebrow", text: "new in sdk 6.5" },
        { type: "title", text: "The mempool, indexed." },
      ],
    },
    {
      id: "pending",
      durationInFrames: 235,
      background: { src: BG },
      components: [
        { type: "eyebrow", text: "index.mempool" },
        { type: "title", text: "Query the pending set." },
        {
          type: "code",
          code: {
            filename: "mempool.ts",
            lang: "ts",
            source: `import { SecondLayer } from "@secondlayer/sdk";

const sl = new SecondLayer();

const { mempool } = await sl.index.mempool.list({
  contractId: "SP….amm-pool-v2",
  limit: 50,
});`,
          },
        },
        {
          type: "panel",
          panel: {
            kind: "data-table",
            title: "index.mempool",
            columns: ["tx_id", "function", "sender"],
            rows: [
              ["0x8f2a…", "swap-x-for-y", "SP2J6…WVEF"],
              ["0x3c91…", "add-liquidity", "SP3K9…X1A0"],
              ["0x7e0d…", "swap-x-for-y", "SPF8M…7QQC"],
              ["0x1a44…", "transfer", "SP1Y4…NZ2D"],
            ],
          },
        },
      ],
    },
    {
      id: "cta",
      durationInFrames: 160,
      background: { src: BG },
      layout: "center",
      components: [
        { type: "title", text: "Start building." },
        { type: "code", code: { filename: "terminal", lang: "bash", source: `bun add @secondlayer/sdk` } },
        { type: "badge", text: "v6.5" },
        { type: "caption", text: "index · streams · datasets · subgraphs" },
      ],
    },
  ],
};

export default video;
