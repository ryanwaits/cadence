import { changelogSchema, DIMENSIONS, type ChangelogVideo } from "./schema/beats";
import { tokenize } from "./code/highlight";
import { waitForFonts } from "./brand/fonts";

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
  const video = changelogSchema.parse(raw);

  const beats = await Promise.all(
    video.beats.map(async (beat) => {
      if (beat.code && !beat.code.tokens) {
        const tokens = await tokenize(beat.code.source, beat.code.lang);
        return { ...beat, code: { ...beat.code, tokens } };
      }
      return beat;
    })
  );

  const durationInFrames = beats.reduce((n, b) => n + b.durationInFrames, 0);
  const { width, height } = DIMENSIONS[video.format];
  await waitForFonts();

  return { durationInFrames, width, height, props: { ...video, beats } };
}
