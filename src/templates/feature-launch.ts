import type { ChangelogInput } from "../schema/beats";
import { clip, cta, DEFAULT_BG, heroClose, installOpener, opener } from "./parts";
import type { Template } from "./types";

/**
 * "Feature launch" — cinematic, one feature gets one beat (honest: just the real
 * feature titles, no fake code). Default flow opens on the install terminal and
 * closes on a hero title; `opts.flow: "title-open"` keeps the classic title
 * opener + install closer.
 */
export const featureLaunch: Template = (m, opts = {}) => {
  const bg = opts.background ?? DEFAULT_BG;
  const installOpen = (opts.flow ?? "install-open") === "install-open";

  const beats: ChangelogInput["beats"] = [
    installOpen ? installOpener(m, bg, opts.pills?.join(" · ")) : opener(m, bg, opts.headline),
  ];

  m.features.slice(0, 4).forEach((f, i) => {
    beats.push({
      id: `feature-${i}`,
      durationInFrames: 140,
      background: bg,
      eyebrow: `feature ${i + 1}`,
      headline: clip(f.title, 40),
    });
  });

  const close = installOpen ? heroClose(m, bg, opts.tagline ?? m.tagline) : cta(m, bg);
  if (close) beats.push(close);
  return { format: opts.format ?? "16x9", beats };
};
