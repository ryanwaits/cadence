/**
 * Read what changed in a repo → a normalized UpdateManifest (JSON on stdout).
 * The deterministic "reads your repo" half of the pipeline; the brain/template
 * turns the manifest into beats.
 *
 *   tsx scripts/changes.ts --release stx-labs/clarinet [--tag v3.18.0] [--install "brew install clarinet"]
 *   tsx scripts/changes.ts --changelog ./CHANGELOG.md --product my-pkg --install "npm i my-pkg"
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { manifestFromChangelogText, manifestFromReleaseBody } from "../src/adapters";

const args = process.argv.slice(2);
const flag = (n: string) => {
  const eq = args.find((a) => a.startsWith(`${n}=`));
  if (eq) return eq.split("=")[1];
  const i = args.indexOf(n);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : undefined;
};

const release = flag("--release"); // owner/name
const changelog = flag("--changelog");
const install = flag("--install");

let manifest;
if (release) {
  const tag = flag("--tag");
  const gh = ["release", "view", ...(tag ? [tag] : []), "--repo", release, "--json", "tagName,name,publishedAt,body"];
  const res = spawnSync("gh", gh, { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(`gh release view failed for ${release}:\n${res.stderr}`);
    process.exit(1);
  }
  const r = JSON.parse(res.stdout);
  manifest = manifestFromReleaseBody({
    product: flag("--product") ?? basename(release),
    version: r.tagName ?? r.name ?? "",
    body: r.body ?? "",
    date: r.publishedAt?.slice(0, 10),
    install,
    repoUrl: `https://github.com/${release}`,
  });
} else if (changelog) {
  const text = readFileSync(changelog, "utf8");
  manifest = manifestFromChangelogText(text, { product: flag("--product") ?? "package", install });
} else {
  console.error("usage: changes.ts --release <owner/name> [--tag vX] | --changelog <path> [--product X] [--install '...']");
  process.exit(1);
}

console.log(JSON.stringify(manifest, null, 2));
