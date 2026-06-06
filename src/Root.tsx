import { Composition } from "remotion";
import { Changelog } from "./components/Changelog";
import { MotionReel } from "./components/MotionReel";
import { ContactSheet } from "./components/ContactSheet";
import { Storyboard, sheetLayout, type StoryboardProps } from "./components/Storyboard";
import { changelogSchema } from "./schema/beats";
import { prepareChangelog } from "./prepare";
import { waitForFonts } from "./brand/fonts";
import streams from "./content/streams.beats";

const defaultProps = changelogSchema.parse(streams);

// A 1×1 transparent PNG — keeps the Storyboard sample props tiny + self-contained.
const TRANSPARENT_PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";
const storyboardSample: StoryboardProps = {
  format: "16x9",
  name: "storyboard preview",
  cells: [
    { img: TRANSPARENT_PX, headline: "First beat.", panel: "—", seconds: "5.0s" },
    { img: TRANSPARENT_PX, headline: "Second beat.", panel: "data-table", seconds: "6.0s" },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Changelog"
        component={Changelog}
        defaultProps={defaultProps}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={async ({ props }) => prepareChangelog(props)}
      />
      <Composition
        id="MotionReel"
        component={MotionReel}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={async (c) => {
          await waitForFonts();
          return c;
        }}
      />
      <Composition
        id="ContactSheet"
        component={ContactSheet}
        durationInFrames={1}
        fps={30}
        width={1760}
        height={1400}
        calculateMetadata={async (c) => {
          await waitForFonts();
          return c;
        }}
      />
      <Composition
        id="Storyboard"
        component={Storyboard}
        defaultProps={storyboardSample}
        durationInFrames={1}
        fps={30}
        width={1600}
        height={900}
        calculateMetadata={async (c) => {
          await waitForFonts();
          const { width, height } = sheetLayout(c.props.format, c.props.cells.length);
          return { ...c, width, height };
        }}
      />
    </>
  );
};
