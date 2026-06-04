import type { ChangelogInput } from "../schema/beats";

/**
 * Streams showcase — the Stacks event firehose. Subscribe → provable → resumable
 * → reorg-safe → install. New panel kinds (proof / cursor-resume / reorg) designed
 * with the design skills; real @secondlayer/sdk/streams API.
 */
const BG = "backgrounds/congress.png";

const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "opener",
      durationInFrames: 150,
      background: { src: BG },
      eyebrow: "new in streams",
      headline: "The Stacks event firehose.",
    },
    {
      id: "subscribe",
      durationInFrames: 235,
      background: { src: BG },
      eyebrow: "real-time",
      headline: "Subscribe to every block.",
      code: {
        filename: "stream.ts",
        lang: "ts",
        source: `import { createStreamsClient } from "@secondlayer/sdk/streams";

const streams = createStreamsClient();

for await (const event of streams.events.consume({
  types: ["ft_transfer"],
  mode: "tail",
})) {
  ledger.append(event);
}`,
      },
      panel: {
        kind: "feed",
        title: "streams.consume",
        subtitle: "tail",
        rows: [
          { badge: "sBTC", label: "SP2J6…WVEF", value: "1,200.00" },
          { badge: "USDA", label: "SP3K9…X1A0", value: "48.50" },
          { badge: "ALEX", label: "SPF8M…7QQC", value: "9,000.00" },
          { badge: "sBTC", label: "SP1Y4…NZ2D", value: "150.00" },
        ],
      },
    },
    {
      id: "proof",
      durationInFrames: 235,
      background: { src: BG },
      eyebrow: "signed",
      headline: "Every event, provable.",
      code: {
        filename: "verify.ts",
        lang: "ts",
        source: `const streams = createStreamsClient({
  verify: true,
});

// every response carries an ed25519 signature,
// checked against the server's public key.`,
      },
      panel: {
        kind: "proof",
        eventLine: "ft_transfer · 1,200 sBTC",
        cursor: "951475:3",
        signature: "3a9f8c217b14e0d5f29a4c6b8e1d70a3c8a17b142e9d",
        keyId: "f3a9…2b1c",
      },
    },
    {
      id: "resume",
      durationInFrames: 235,
      background: { src: BG },
      eyebrow: "resumable",
      headline: "Resume from anywhere.",
      code: {
        filename: "resume.ts",
        lang: "ts",
        source: `for await (const event of streams.events.consume({
  fromCursor: "951475:3",
  mode: "tail",
})) {
  process(event);
}`,
      },
      panel: {
        kind: "stream-resume",
        fromCursor: "951475:3",
        rows: [
          { cursor: "951475:4", label: "print · swap-x-for-y" },
          { cursor: "951476:0", label: "ft_transfer" },
          { cursor: "951476:1", label: "nft_transfer" },
          { cursor: "951477:0", label: "print · mint" },
        ],
      },
    },
    {
      id: "reorg",
      durationInFrames: 235,
      background: { src: BG },
      eyebrow: "reorg-safe",
      headline: "Forks, handled.",
      code: {
        filename: "reorg.ts",
        lang: "ts",
        source: `streams.events.replay({
  from: "genesis",
  onReorg: (reorg, { cursor }) => {
    rewind(cursor);
  },
});`,
      },
      panel: {
        kind: "fork",
        blocks: [
          { height: 951472, hash: "a3f9", state: "canonical" },
          { height: 951473, hash: "b1c4", state: "canonical" },
          { height: 951474, hash: "7e2d", state: "orphaned" },
          { height: 951474, hash: "c8a1", state: "new" },
        ],
        rewindTo: "951472:0",
      },
    },
    {
      id: "cta",
      durationInFrames: 160,
      background: { src: BG },
      headline: "Stream it now.",
      layout: "center",
      code: { filename: "terminal", lang: "bash", source: `bun add @secondlayer/sdk` },
      badge: "streams",
      caption: "subscribe · verify · resume · reorg-safe",
    },
  ],
};

export default video;
