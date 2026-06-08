import type { ChangelogInput } from "../schema/beats";
import { clip, DEFAULT_BG, heroClose, opener, type TBeat } from "./parts";
import type { Kind } from "./types";

/**
 * "Showcase" — spotlight ONE feature in depth. A slower, single-feature arc vs
 * `launch`'s multi-feature march: title opener → one centerpiece beat for the
 * lead feature → hero close. The centerpiece beat is where the skill path would
 * later add honest code + a panel; the deterministic kind emits eyebrow +
 * headline only (semantic-only, no fabricated code).
 */
export const showcase: Kind = (m, opts = {}) => {
  const bg = opts.background ?? DEFAULT_BG;
  const beats: ChangelogInput["beats"] = [opener(m, bg, opts.headline)];

  // The single centerpiece: the lead feature, given the whole beat. Longer hold
  // than a launch feature beat — this arc lingers on one thing.
  const feature = m.features[0]?.title;
  if (feature) {
    const centerpiece: TBeat = {
      id: "feature",
      durationInFrames: 190,
      background: bg,
      components: [
        { type: "eyebrow", text: `new in ${m.product}` },
        { type: "title", text: clip(feature, 44) },
      ],
    };
    beats.push(centerpiece);
  }

  // Hero closer — name + one-line pitch; never null, so the spotlight always lands.
  beats.push(heroClose(m, bg, opts.tagline ?? m.tagline));
  return { format: opts.format ?? "16x9", beats };
};
