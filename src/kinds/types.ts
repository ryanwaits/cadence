import type { UpdateManifest } from "../adapters/types";
import type { ChangelogInput, Format } from "../schema/beats";

/** Loose background (authoring shape; defaults filled at render-validate time). */
export type BackgroundSpec = {
  src?: string;
  treatment?: "kenburns" | "static";
  gradient?: [string, string];
  angle?: number;
  solid?: string;
  /** Procedural theme-colored backdrop — the default. */
  shapes?: boolean;
};

/** Listing metadata for a kind (structural arc): what it is + when to reach for it. */
export type KindMeta = {
  name: string;
  description: string;
  whenToUse: string;
  format: Format;
};

export type KindOpts = {
  format?: Format;
  /** Resolved background (style pack): image / gradient / solid. */
  background?: BackgroundSpec;
  /** Optional headline override for the opener. */
  headline?: string;
  /** For the milestone template: a big number to feature. */
  stat?: { value: string; label: string; sub?: string };
  /** Opening style. `"install-open"` (feature-launch default) opens on the install
   * terminal + feature pills and closes on a hero title; `"title-open"` keeps the
   * classic title opener + install closer. */
  flow?: "install-open" | "title-open";
  /** Override the install opener's feature pills (else derived from features). */
  pills?: string[];
  /** One-line pitch for the hero closer (else `manifest.tagline`). */
  tagline?: string;
};

/**
 * A Kind turns a parsed UpdateManifest into beats — deterministically, with
 * no LLM and no fabricated code (it only shows what the manifest actually knows:
 * feature titles + the real install command). The brain/skill path adds honest
 * code on top; kinds are the no-LLM structural arcs the GitHub Action uses.
 */
export type Kind = (manifest: UpdateManifest, opts?: KindOpts) => ChangelogInput;
