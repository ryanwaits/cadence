import type { UpdateManifest } from "../adapters/types";
import type { ChangelogInput } from "../schema/beats";
import type { BackgroundSpec } from "./types";

export type TBeat = ChangelogInput["beats"][number];

/** Shared building blocks so every template stays consistent + honest. */
/** The default backdrop: procedural, theme-colored, no asset / no API key. */
export const DEFAULT_BG: BackgroundSpec = { shapes: true };
export const clip = (s: string, n = 52) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

export const opener = (m: UpdateManifest, bg: BackgroundSpec, headline?: string): TBeat => ({
  id: "opener",
  durationInFrames: 150,
  background: bg,
  eyebrow: `new in ${m.product}`,
  headline: headline ?? `${m.version} is out.`,
});

/** Install closer — only when the manifest actually knows the install command. */
export const cta = (m: UpdateManifest, bg: BackgroundSpec): TBeat | null =>
  m.install
    ? {
        id: "cta",
        durationInFrames: 160,
        background: bg,
        headline: "Get it.",
        layout: "center",
        code: { filename: "terminal", lang: "bash", source: m.install },
        badge: `v${m.version}`,
      }
    : null;
