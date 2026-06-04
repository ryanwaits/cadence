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

export type TemplateOpts = {
  format?: Format;
  /** Resolved background (style pack): image / gradient / solid. */
  background?: BackgroundSpec;
  /** Optional headline override for the opener. */
  headline?: string;
  /** For the milestone template: a big number to feature. */
  stat?: { value: string; label: string; sub?: string };
};

/**
 * A Template turns a parsed UpdateManifest into beats — deterministically, with
 * no LLM and no fabricated code (it only shows what the manifest actually knows:
 * feature titles + the real install command). The brain/skill path adds honest
 * code on top; templates are the no-LLM path the GitHub Action uses.
 */
export type Template = (manifest: UpdateManifest, opts?: TemplateOpts) => ChangelogInput;
