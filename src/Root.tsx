import { Composition } from "remotion";
import { Changelog } from "./components/Changelog";
import { MotionReel } from "./components/MotionReel";
import { ContactSheet } from "./components/ContactSheet";
import { changelogSchema } from "./schema/beats";
import { prepareChangelog } from "./prepare";
import { waitForFonts } from "./brand/fonts";
import streams from "./content/streams.beats";

const defaultProps = changelogSchema.parse(streams);

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
    </>
  );
};
