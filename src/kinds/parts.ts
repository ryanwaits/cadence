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

/** "v1.7" from "1.7.0" — the short marketing version for a release badge. */
const shortVersion = (v: string) => `v${v.split(".").slice(0, 2).join(".")}`;

/** Terse feature pills for the install opener (e.g. "sync · folders · read-only").
 * Conventional-commit kind is already short; otherwise clip the title hard. */
const pillsFrom = (m: UpdateManifest) => m.features.slice(0, 4).map((f) => f.kind ?? clip(f.title, 14)).join(" · ");

/**
 * Install opener — open on the real install command (a terminal) with a row of
 * feature pills, mirroring a launch reel's title card. Falls back to the plain
 * title `opener()` when the manifest has no install line (stays non-null).
 */
export const installOpener = (m: UpdateManifest, bg: BackgroundSpec, pills?: string): TBeat =>
  m.install
    ? {
        id: "install",
        durationInFrames: 160,
        background: bg,
        headline: "",
        layout: "center",
        code: { filename: "terminal", lang: "bash", source: m.install },
        badge: shortVersion(m.version),
        caption: pills ?? pillsFrom(m),
      }
    : opener(m, bg);

/** Hero closer — a big centered title card: the package name + a one-line pitch. */
export const heroClose = (m: UpdateManifest, bg: BackgroundSpec, tagline?: string): TBeat => ({
  id: "hero",
  durationInFrames: 150,
  background: bg,
  hero: true,
  layout: "center",
  headline: m.product,
  caption: tagline,
});
