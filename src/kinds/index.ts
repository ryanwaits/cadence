import { changelogReel } from "./changelog";
import { featureLaunch } from "./launch";
import { milestone } from "./milestone";
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

/**
 * Off-the-shelf kinds (structural arcs). A manifest + a kind name → beats.
 * Back-compat alias keys (`feature-launch`, `changelog-reel`) resolve to the
 * same entries so existing callers keep working through the rename.
 */
export const KINDS: Record<string, KindEntry> = {
  launch,
  changelog,
  milestone: milestoneEntry,
  // back-compat aliases (pre-rename names)
  "feature-launch": launch,
  "changelog-reel": changelog,
};

export type { Kind, KindOpts, KindMeta, BackgroundSpec } from "./types";
