/**
 * Normalized "what changed" for a repo/release — the input the brain (or a
 * deterministic template) turns into beats. Adapters parse the messy real world
 * (release notes, CHANGELOGs, git tags) into this shape.
 */
export type Feature = {
  title: string;
  /** Conventional-commit-ish kind if detectable: feat | fix | perf | docs | … */
  kind?: string;
};

export type UpdateManifest = {
  /** Package or repo name. */
  product: string;
  /** Latest version / tag, without a leading "v" if present. */
  version: string;
  date?: string;
  features: Feature[];
  /** Real install line, e.g. "npm i pkg", "brew install tool". */
  install?: string;
  /** One-line pitch for the hero closer (e.g. "One API for every storage provider."). */
  tagline?: string;
  repoUrl?: string;
  /** Anything the parser dropped (kept transparent — never silently truncate). */
  dropped?: number;
};
