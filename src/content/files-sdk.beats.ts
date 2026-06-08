import type { ChangelogInput } from "../schema/beats";

/**
 * Demo of the new default launch flow: open on the install terminal (+ feature
 * pills), a feature beat pairing code with the `browser` result panel side-by-
 * side (16:9 split), then close on a hero title card. One painting for continuity.
 */
const BG = "backgrounds/pennybacker.png";

const video: ChangelogInput = {
  format: "16x9",
  beats: [
    {
      id: "install",
      durationInFrames: 160,
      background: { src: BG },
      layout: "center",
      components: [
        { type: "code", code: { filename: "terminal", lang: "bash", source: "npm i files-sdk@1.7.0" } },
        { type: "badge", text: "v1.7" },
        { type: "caption", text: "resumable uploads · sync · folders · read-only" },
      ],
    },
    {
      id: "delimiters",
      durationInFrames: 235,
      background: { src: BG },
      components: [
        { type: "eyebrow", text: "new in 1.7" },
        { type: "title", text: "List folders with delimiters." },
        {
          type: "code",
          code: {
            filename: "browser.ts",
            lang: "ts",
            source: `const { items, prefixes } = await files.list({
  prefix: "photos/",
  delimiter: "/",
});

// subfolders, collapsed at the delimiter
for (const folder of prefixes ?? []) {
  console.log(folder);
}`,
          },
        },
        {
          type: "panel",
          panel: {
            kind: "browser",
            title: "photos/",
            meta: "delimiter: /",
            sections: [
              {
                label: "prefixes",
                rows: [
                  { type: "folder", name: "2023/" },
                  { type: "folder", name: "2024/" },
                  { type: "folder", name: "2025/" },
                  { type: "folder", name: "raw/" },
                ],
              },
              {
                label: "items",
                rows: [
                  { type: "file", name: "cover.jpg", meta: "2.1 MB" },
                  { type: "file", name: "index.json", meta: "1.2 KB" },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "hero",
      durationInFrames: 150,
      background: { src: BG },
      layout: "hero",
      components: [
        { type: "title", text: "files-sdk" },
        { type: "caption", text: "One API for every storage provider.", variant: "subhead", placement: { region: "lead" } },
      ],
    },
  ],
};

export default video;
