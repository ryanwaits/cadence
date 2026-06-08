import type { ChangelogInput } from "../schema/beats";
import { clip, DEFAULT_BG, heroClose, opener, type TBeat } from "./parts";
import type { Kind } from "./types";

/**
 * "Announcement" — a punchy 3-beat teaser. Distinct from `launch` (which gives
 * every feature its own beat): here the top one or two features collapse into a
 * single consolidated highlight, so the arc is title opener → one highlight →
 * hero close. Honest and semantic-only: just the real feature titles, no code.
 */
export const announcement: Kind = (m, opts = {}) => {
  const bg = opts.background ?? DEFAULT_BG;

  // The lead feature headlines the opener (else the version drop), so the teaser
  // leads with what's actually new rather than a generic title card.
  const lead = m.features[0]?.title;
  const beats: ChangelogInput["beats"] = [opener(m, bg, opts.headline ?? (lead && clip(lead, 40)))];

  // One consolidated highlight: the top 1–2 feature titles as a single headline.
  const top = m.features.slice(0, 2).map((f) => clip(f.title, 32));
  if (top.length) {
    const highlight: TBeat = {
      id: "highlight",
      durationInFrames: 150,
      background: bg,
      components: [
        { type: "eyebrow", text: "highlights" },
        { type: "title", text: top.join("  ·  ") },
      ],
    };
    beats.push(highlight);
  }

  // Hero closer — name + one-line pitch; never null, so the teaser always lands.
  beats.push(heroClose(m, bg, opts.tagline ?? m.tagline));
  return { format: opts.format ?? "16x9", beats };
};
