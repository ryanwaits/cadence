import type { ChangelogInput } from "../schema/beats";

/**
 * Real changelog: the Index full decoded layer (sdk@5.5). Three beats over one
 * "Hill Country Sublime" painting (continuity, like the reference video) — art +
 * motion vocabulary + engine, end to end.
 */
const BG = "backgrounds/mount-bonnell.png";

const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "events",
      durationInFrames: 235,
      background: { src: BG },
      components: [
        { type: "eyebrow", text: "new in sdk 5.5" },
        { type: "title", text: "Every event, decoded." },
        {
          type: "code",
          code: {
            filename: "events.ts",
            lang: "ts",
            source: `import { Secondlayer } from "@secondlayer/sdk";

const sl = new Secondlayer();

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
    {
      id: "contract-calls",
      durationInFrames: 235,
      background: { src: BG },
      components: [
        { type: "eyebrow", text: "new in sdk 5.5" },
        { type: "title", text: "Contract calls, typed." },
        {
          type: "code",
          code: {
            filename: "calls.ts",
            lang: "ts",
            source: `const { calls } = await sl.index.contractCalls({
  contract: "SP….amm-pool-v2",
  function: "swap-x-for-y",
  limit: 4,
});`,
          },
        },
        {
          type: "panel",
          panel: {
            kind: "data-table",
            title: "index.contractCalls",
            columns: ["block", "function", "result"],
            rows: [
              ["951475", "swap-x-for-y", "(ok u1200)"],
              ["951474", "swap-x-for-y", "(ok u48)"],
              ["951472", "add-liquidity", "(ok u9000)"],
              ["951470", "swap-x-for-y", "(ok u150)"],
            ],
          },
        },
      ],
    },
    {
      id: "pipeline",
      durationInFrames: 180,
      background: { src: BG },
      components: [
        { type: "title", text: "Decoded once. Query forever." },
        {
          type: "panel",
          panel: {
            kind: "diagram",
            nodes: [
              { id: "node", label: "Stacks node", type: "default" },
              { id: "idx", label: "Indexer", type: "data" },
              { id: "api", label: "Index API", type: "api" },
            ],
            edges: [
              { from: "node", to: "idx", label: "raw events" },
              { from: "idx", to: "api", label: "decoded" },
            ],
            note: "decoded once — query forever",
          },
        },
      ],
    },
  ],
};

export default video;
