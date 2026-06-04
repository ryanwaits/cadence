import type { ChangelogInput } from "../schema/beats";
import { clip, cta, DEFAULT_BG, opener } from "./parts";
import type { Template } from "./types";

/**
 * "Feature launch" — opener → one title card per top feature → install. Cinematic,
 * one feature gets one beat. Honest: just the real feature titles (no fake code).
 */
export const featureLaunch: Template = (m, opts = {}) => {
  const bg = opts.background ?? DEFAULT_BG;
  const beats: ChangelogInput["beats"] = [opener(m, bg, opts.headline)];

  m.features.slice(0, 4).forEach((f, i) => {
    beats.push({
      id: `feature-${i}`,
      durationInFrames: 140,
      background: bg,
      eyebrow: `feature ${i + 1}`,
      headline: clip(f.title, 40),
    });
  });

  const close = cta(m, bg);
  if (close) beats.push(close);
  return { format: opts.format ?? "16x9", beats };
};
