import type { ChangelogInput } from "../schema/beats";

/** Showcase fixture: one beat per panel kind, used to eyeball the registry. */
const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "upload",
      durationInFrames: 150,
      background: { src: "mountains.jpg" },
      eyebrow: "new in sdk 6.0",
      headline: "Pause and resume backfills.",
      code: { filename: "backfill.ts", lang: "ts", source: `const ctrl = new UploadControl();\n\nawait sl.datasets.export("sbtc", file, {\n  control: ctrl,\n});` },
      panel: { kind: "upload-progress", file: "datasets/sbtc.parquet", sizeMB: 210, parts: 14 },
    },
    {
      id: "query",
      durationInFrames: 150,
      background: { src: "mountains.jpg" },
      headline: "Query any dataset.",
      code: { filename: "query.ts", lang: "ts", source: `const { rows } = await sl.datasets.query("sbtc", {\n  where: { event: "transfer" },\n  limit: 4,\n});` },
      panel: { kind: "data-table", title: "sbtc · transfers", columns: ["block", "amount", "to"], rows: [["951475", "1,200.00", "SP2J6…"], ["951474", "48.50", "SP3K9…"], ["951472", "9,000.00", "SPF8M…"], ["951470", "150.00", "SP1Y4…"]] },
    },
    {
      id: "status",
      durationInFrames: 150,
      background: { src: "mountains.jpg" },
      headline: "Watch every service.",
      panel: { kind: "status", title: "status", services: [{ name: "api", state: "ok" }, { name: "indexer", state: "ok", detail: "block 951475" }, { name: "l2-decoder", state: "syncing", detail: "−2 blocks" }, { name: "database", state: "ok" }] },
    },
    {
      id: "pipeline",
      durationInFrames: 150,
      background: { src: "mountains.jpg" },
      headline: "Decoded once. Query forever.",
      panel: { kind: "diagram", nodes: [{ id: "node", label: "Stacks node", type: "default" }, { id: "idx", label: "Indexer", type: "data" }, { id: "api", label: "Index API", type: "api" }], edges: [{ from: "node", to: "idx", label: "events" }, { from: "idx", to: "api", label: "decoded" }], note: "decoded once — query forever" },
    },
  ],
};
export default video;
