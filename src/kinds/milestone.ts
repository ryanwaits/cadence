import type { ChangelogInput } from "../schema/beats";
import { cta, DEFAULT_BG, opener } from "./parts";
import type { Kind } from "./types";

/**
 * "Milestone" — opener → one big number → install. Uses `opts.stat` when given;
 * otherwise an honest default drawn from the manifest (feature count this release).
 */
export const milestone: Kind = (m, opts = {}) => {
  const bg = opts.background ?? DEFAULT_BG;
  const stat = opts.stat ?? { value: String(m.features.length), label: "new features", sub: `in ${m.version}` };
  const beats: ChangelogInput["beats"] = [
    opener(m, bg, opts.headline),
    {
      id: "stat",
      durationInFrames: 170,
      background: bg,
      headline: "By the numbers.",
      panel: { kind: "stat", value: stat.value, label: stat.label, sub: stat.sub },
    },
  ];
  const close = cta(m, bg);
  if (close) beats.push(close);
  return { format: opts.format ?? "16x9", beats };
};
