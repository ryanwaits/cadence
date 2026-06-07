/**
 * The shared authoring pipeline: a manifest source (release / changelog / repo /
 * none) + a kind name + opts → `ChangelogInput` beats. Extracted from `make.ts`
 * so `new` / `fork` / `make` all build beats the same way (one source→manifest→
 * kind→opts path, no duplication).
 *
 * `make.ts` renders the result; `new.ts` writes it to a durable beats file. The
 * difference is only what happens AFTER beats exist — building them is here.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { manifestFromChangelogText, manifestFromReleaseBody, type UpdateManifest } from "../src/adapters";
import { type BackgroundSpec, KINDS } from "../src/kinds";
import type { ChangelogInput, Format } from "../src/schema/beats";

/** Default kind when none is named (mirrors `make.ts`). */
export const DEFAULT_KIND = "changelog";

/** Parse a `--background` flag string into a loose `BackgroundSpec`. */
export function parseBackground(s?: string): BackgroundSpec | undefined {
  if (!s) return undefined;
  if (s === "shapes") return { shapes: true };
  const [kind, rest] = [s.slice(0, s.indexOf(":")), s.slice(s.indexOf(":") + 1)];
  if (kind === "gradient") {
    const [from, to] = rest.split(",");
    return { gradient: [from, to], angle: 155, treatment: "kenburns" };
  }
  if (kind === "solid") return { solid: rest, treatment: "static" };
  if (kind === "image") return { src: rest.includes("/") ? rest : `backgrounds/${rest}`, treatment: "kenburns" };
  return undefined;
}

/** Where the beats come from. Exactly one of these may be set; none ⇒ placeholder. */
export type ManifestSource = {
  /** A GitHub release as `owner/name` (read via `gh release view`). */
  release?: string;
  /** A release tag override for `--release`. */
  tag?: string;
  /** A path to a CHANGELOG-style markdown file. */
  changelog?: string;
  /** A path to a local repo (reads its CHANGELOG.md if present, else placeholder). */
  repo?: string;
  /** Real install line, e.g. "npm i pkg". */
  install?: string;
  /** Product/package name override. */
  product?: string;
};

/**
 * An honest placeholder manifest for the no-repo path: a single generic feature
 * and no fabricated code. The skill fills in real content downstream — we never
 * invent code or feature titles here.
 */
export function placeholderManifest(product = "your package"): UpdateManifest {
  return {
    product,
    version: "0.0.0",
    features: [{ title: "Describe your first change" }],
    dropped: 0,
  };
}

/**
 * Resolve a `ManifestSource` to an `UpdateManifest`. Returns an honest
 * placeholder (no fabricated code) when no source is given.
 */
export function buildManifest(src: ManifestSource): UpdateManifest {
  if (src.release) {
    const res = spawnSync(
      "gh",
      ["release", "view", ...(src.tag ? [src.tag] : []), "--repo", src.release, "--json", "tagName,name,publishedAt,body"],
      { encoding: "utf8" },
    );
    if (res.status !== 0) {
      console.error(res.stderr);
      process.exit(1);
    }
    const r = JSON.parse(res.stdout);
    return manifestFromReleaseBody({
      product: src.product ?? basename(src.release),
      version: r.tagName ?? r.name ?? "",
      body: r.body ?? "",
      date: r.publishedAt?.slice(0, 10),
      install: src.install,
      repoUrl: `https://github.com/${src.release}`,
    });
  }

  if (src.changelog) {
    return manifestFromChangelogText(readFileSync(resolve(src.changelog), "utf8"), {
      product: src.product ?? "package",
      install: src.install,
    });
  }

  if (src.repo) {
    // A local repo: read its CHANGELOG.md if one exists, else fall to a
    // placeholder (we don't fabricate features from an unrecognized tree).
    const root = resolve(src.repo);
    const changelogPath = ["CHANGELOG.md", "changelog.md", "CHANGELOG.MD"].map((f) => join(root, f)).find(existsSync);
    const product = src.product ?? basename(root);
    if (changelogPath) {
      return manifestFromChangelogText(readFileSync(changelogPath, "utf8"), { product, install: src.install });
    }
    const m = placeholderManifest(product);
    if (src.install) m.install = src.install;
    return m;
  }

  // No source → honest placeholder. The skill fills in real content.
  const m = placeholderManifest(src.product);
  if (src.install) m.install = src.install;
  return m;
}

/** Options for the kind step — a subset of `KindOpts` the CLI verbs expose. */
export type AuthorOpts = {
  format?: Format;
  background?: BackgroundSpec;
  headline?: string;
  stat?: { value: string; label: string; sub?: string };
};

/** The authored result: the beats plus the resolved kind/template for messaging. */
export type AuthorResult = {
  beats: ChangelogInput;
  /** The resolved canonical kind name. */
  kind: string;
  /** The manifest that produced the beats (for status logging). */
  manifest: UpdateManifest;
};

/**
 * The shared pipeline: source → manifest → kind → opts → beats. `kindName`
 * resolves against `KINDS` (honoring back-compat aliases). `template`, when
 * given, is stamped as the top-level `template` doc field so the look travels
 * with the beats file.
 */
export function author(opts: {
  kind?: string;
  source: ManifestSource;
  template?: string;
  authorOpts?: AuthorOpts;
}): AuthorResult {
  const kindName = opts.kind ?? DEFAULT_KIND;
  const entry = KINDS[kindName];
  if (!entry) {
    console.error(`unknown kind "${kindName}". have: ${Object.keys(KINDS).join(", ")}`);
    process.exit(1);
  }

  const manifest = buildManifest(opts.source);
  const beats = entry.fn(manifest, {
    format: opts.authorOpts?.format,
    background: opts.authorOpts?.background,
    headline: opts.authorOpts?.headline,
    stat: opts.authorOpts?.stat,
  });

  // A `--template` stamps the top-level doc field so one look travels with the
  // beats (mirrors `format`). Theme is NOT a doc field — env/.cadence-resolved.
  if (opts.template) beats.template = opts.template;

  return { beats, kind: entry.meta.name, manifest };
}
