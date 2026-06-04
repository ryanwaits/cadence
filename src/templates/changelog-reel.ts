import type { ChangelogInput } from "../schema/beats";
import { clip, cta, DEFAULT_BG, opener, type TBeat } from "./parts";
import type { Template } from "./types";

/**
 * "The classic" — opener → a numbered changelog (data-table of the real
 * features) → install closer. Deterministic and honest: no invented code, just
 * the feature titles the adapter parsed and the real install command.
 */
export const changelogReel: Template = (m, opts = {}) => {
  const bg = opts.background ?? DEFAULT_BG;
  const beats: ChangelogInput["beats"] = [opener(m, bg, opts.headline)];

  const rows = m.features.slice(0, 6).map((f, i) => [String(i + 1), clip(f.title)]);
  if (rows.length) {
    beats.push({
      id: "changes",
      durationInFrames: Math.min(320, 150 + rows.length * 24),
      background: bg,
      headline: "What's new.",
      panel: { kind: "data-table", title: `${m.product} ${m.version}`, columns: ["#", "change"], rows },
    });
  }

  const close = cta(m, bg);
  if (close) beats.push(close);
  return { format: opts.format ?? "16x9", beats };
};
