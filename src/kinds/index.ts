import { announcement } from "./announcement";
import { changelogReel } from "./changelog";
import { featureLaunch } from "./launch";
import { milestone } from "./milestone";
import { showcase } from "./showcase";
import type { Kind, KindMeta } from "./types";

/** A registry entry: the structural arc + its listing metadata. */
export type KindEntry = { fn: Kind; meta: KindMeta };

const launch: KindEntry = {
  fn: featureLaunch,
  meta: {
    name: "launch",
    description:
      "Cinematic feature launch — opens on the real install command, gives each feature its own beat, and closes on a hero title card.",
    whenToUse: "Announcing a release where you want each headline feature to land on its own, with an install + hero bookend.",
    format: "16x9",
  },
};

const changelog: KindEntry = {
  fn: changelogReel,
  meta: {
    name: "changelog",
    description:
      "The classic changelog reel — opener → a numbered data-table of the real features → install closer. Deterministic and honest, no invented code.",
    whenToUse: "Summarizing several changes in one release at a glance, as a scannable numbered list.",
    format: "16x9",
  },
};

const milestoneEntry: KindEntry = {
  fn: milestone,
  meta: {
    name: "milestone",
    description: "Milestone — opener → one big featured number (stat) → install closer.",
    whenToUse: "Celebrating a single headline metric (downloads, stars, a count) rather than a list of features.",
    format: "16x9",
  },
};

const announcementEntry: KindEntry = {
  fn: announcement,
  meta: {
    name: "announcement",
    description:
      "Punchy 3-beat teaser — title opener (leads with the top feature) → one consolidated highlight of the top features → hero close. Tighter than launch, semantic-only.",
    whenToUse: "Teasing a release in a few seconds, when you want one short, high-energy beat rather than a per-feature walkthrough.",
    format: "16x9",
  },
};

const showcaseEntry: KindEntry = {
  fn: showcase,
  meta: {
    name: "showcase",
    description:
      "Single-feature spotlight — title opener → one centerpiece beat that lingers on the lead feature → hero close. A slower, focused arc; the skill path can later add honest code here.",
    whenToUse: "Highlighting ONE feature in depth, rather than marching through several like launch does.",
    format: "16x9",
  },
};

/**
 * Off-the-shelf kinds (structural arcs). A manifest + a kind name → beats.
 */
export const KINDS: Record<string, KindEntry> = {
  launch,
  changelog,
  milestone: milestoneEntry,
  announcement: announcementEntry,
  showcase: showcaseEntry,
};

export type { Kind, KindOpts, KindMeta, BackgroundSpec } from "./types";
