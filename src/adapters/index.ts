import { extractFeatures } from "./parse";
import type { UpdateManifest } from "./types";

export { extractFeatures, cleanBullet } from "./parse";
export type { UpdateManifest, Feature } from "./types";

const stripV = (v: string) => v.replace(/^v/i, "").trim();

/**
 * Drop changesets boilerplate that isn't a user-facing change: the
 * "Updated dependencies […]" bullet plus its indented child dep-bumps
 * (and any multi-line bracket continuation). Real entries are untouched.
 */
function stripChangesetNoise(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let depIndent = -1; // ≥0 while inside an "Updated dependencies" block
  for (const line of lines) {
    const bullet = /^(\s*)[-*]\s+(.*)$/.exec(line);
    if (depIndent >= 0) {
      if (line.trim() === "") {
        depIndent = -1; // blank line closes the block
      } else if ((line.match(/^\s*/)?.[0].length ?? 0) > depIndent) {
        continue; // child dep-bump or bracket continuation — drop it
      } else {
        depIndent = -1; // back to sibling depth — fall through to keep this line
      }
    }
    if (bullet && /^Updated dependencies\b/i.test(bullet[2])) {
      depIndent = bullet[1].length;
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

/** Build a manifest from a GitHub release (notes + tag). */
export function manifestFromReleaseBody(opts: {
  product: string;
  version: string;
  body: string;
  date?: string;
  install?: string;
  repoUrl?: string;
  max?: number;
}): UpdateManifest {
  const { features, dropped } = extractFeatures(opts.body ?? "", opts.max ?? 6);
  return {
    product: opts.product,
    version: stripV(opts.version),
    date: opts.date,
    features,
    install: opts.install,
    repoUrl: opts.repoUrl,
    dropped,
  };
}

/** Build a manifest from a CHANGELOG (Keep-a-Changelog / common markdown). */
export function manifestFromChangelogText(
  text: string,
  opts: { product: string; install?: string; repoUrl?: string; max?: number }
): UpdateManifest {
  const blocks = text.split(/^##\s+/m).slice(1);
  const first = blocks[0] ?? text;
  const head = first.split("\n")[0] ?? "";
  const version = stripV((head.match(/\[?([0-9][\w.\-]*)\]?/) || [])[1] ?? "");
  const date = (head.match(/\d{4}-\d{2}-\d{2}/) || [])[0];
  const { features, dropped } = extractFeatures(stripChangesetNoise(first), opts.max ?? 6);
  return { product: opts.product, version, date, features, install: opts.install, repoUrl: opts.repoUrl, dropped };
}
