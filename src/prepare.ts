import { changelogSchema, DIMENSIONS, type ChangelogVideo, type Node } from "./schema/beats";
import { normalizeVideo } from "./schema/normalize";
import { tokenize } from "./code/highlight";
import { waitForFonts } from "./brand/fonts";

/** Tokenize every `code` node in a composition tree (recursing into containers),
 * filling `code.tokens` via shiki so the typewriter + panel-reveal timing read the
 * same pre-tokenized source the render does. */
async function tokenizeNodes(nodes: Node[]): Promise<Node[]> {
  return Promise.all(
    nodes.map(async (node): Promise<Node> => {
      if (node.type === "code" && !node.code.tokens) {
        const tokens = await tokenize(node.code.source, node.code.lang);
        return { ...node, code: { ...node.code, tokens } };
      }
      if ("children" in node) return { ...node, children: await tokenizeNodes(node.children) };
      return node;
    }),
  );
}

/**
 * Pre-render preparation, shared by Root's `calculateMetadata` and the render
 * script: validate against the schema, pre-tokenize code via shiki (off the hot
 * path), compute duration + dimensions from the format, and load fonts.
 */
export async function prepareChangelog(raw: unknown): Promise<{
  durationInFrames: number;
  width: number;
  height: number;
  props: ChangelogVideo;
}> {
  const video = changelogSchema.parse(normalizeVideo(raw));

  const beats = await Promise.all(
    video.beats.map(async (beat) => ({ ...beat, components: await tokenizeNodes(beat.components) })),
  );

  const durationInFrames = beats.reduce((n, b) => n + b.durationInFrames, 0);
  const { width, height } = DIMENSIONS[video.format];
  await waitForFonts();

  return { durationInFrames, width, height, props: { ...video, beats } };
}
