import { Series } from "remotion";
import type { ChangelogVideo } from "../schema/beats";
import { ChangelogScene } from "./ChangelogScene";

/** Top-level composition: a Series of beats. Duration/dimensions/tokens are set
 * by `calculateMetadata` in Root before this renders. */
export const Changelog: React.FC<ChangelogVideo> = ({ format, beats }) => {
  return (
    <Series>
      {beats.map((beat) => (
        <Series.Sequence key={beat.id} durationInFrames={beat.durationInFrames}>
          <ChangelogScene beat={beat} format={format} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
