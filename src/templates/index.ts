import type { Template } from "./types";
import { changelogReel } from "./changelog-reel";
import { featureLaunch } from "./feature-launch";
import { milestone } from "./milestone";

/** Off-the-shelf templates. A manifest + a template name → a video. */
export const TEMPLATES: Record<string, Template> = {
  "changelog-reel": changelogReel,
  "feature-launch": featureLaunch,
  milestone,
};

export type { Template, TemplateOpts, BackgroundSpec } from "./types";
