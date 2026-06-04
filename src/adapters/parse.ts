import type { Feature } from "./types";

/** Strip list markers, PR/commit refs, emoji, markdown links, and bold to plain text. */
export function cleanBullet(line: string): string {
  let s = line.replace(/^\s*[-*]\s+/, "");
  // changesets prefixes entries with the originating commit hash: "1a3a80d: …"
  s = s.replace(/^[0-9a-f]{7,40}:\s+/i, "");
  s = s.replace(/\*\*/g, "");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // [text](url) → text
  // strip trailing "(#123)" / "(abc1234)" refs, possibly repeated
  for (let i = 0; i < 4; i++) s = s.replace(/\s*\((#\d+|[0-9a-f]{7,40})\)\s*$/i, "");
  s = s.replace(/^[\p{Extended_Pictographic}\s]+/u, ""); // leading emoji
  return s.trim().replace(/[.:]+$/, "").trim();
}

const FEATURE_HEADING = /feature|^\s*#+\s*(added|new|improv|enhanc|perf|✨|⚡)/i;
const SKIP_HEADING = /chore|build|^\s*#+\s*ci|continuous|test|refactor|depend|revert|🏗|🧹|⚙|➰/i;
const FIX_HEADING = /fix|bug|🐞|🐛|🪲|🐜/i;

const KIND = (s: string): string | undefined => {
  const m = s.match(/^(feat|fix|perf|docs|refactor|build|chore)\b/i);
  return m ? m[1].toLowerCase() : undefined;
};

/** Is this bullet just a bold group label like "static-cost:" with no content? */
const isGroupLabel = (s: string) => s.length <= 24 && /[:]$/.test(s.replace(/\*\*/g, "").trim());

/**
 * Pull demo-worthy features from release-note / changelog markdown. Prefers
 * feature/added/perf sections; falls back to bug-fix or unsectioned bullets so a
 * fix-only release still yields beats. Reports how many bullets were dropped.
 */
export function extractFeatures(md: string, max = 6): { features: Feature[]; dropped: number } {
  const lines = md.split("\n");
  let bucket: "feature" | "fix" | "skip" | "none" = "none";
  const feature: Feature[] = [];
  const fix: Feature[] = [];
  const other: Feature[] = [];

  for (const raw of lines) {
    if (/^\s*#{1,6}\s/.test(raw)) {
      bucket = SKIP_HEADING.test(raw) ? "skip" : FEATURE_HEADING.test(raw) ? "feature" : FIX_HEADING.test(raw) ? "fix" : "none";
      continue;
    }
    if (!/^\s*[-*]\s+/.test(raw)) continue;
    if (isGroupLabel(raw)) continue;
    const title = cleanBullet(raw);
    if (title.length < 4) continue;
    const f: Feature = { title, kind: KIND(title) };
    if (bucket === "skip") continue;
    if (bucket === "feature") feature.push(f);
    else if (bucket === "fix") fix.push(f);
    else other.push(f);
  }

  let chosen = feature.length ? feature : other.length ? other : fix;
  // top up features with a couple fixes if the release is thin
  if (chosen === feature && feature.length < 2) chosen = [...feature, ...fix];

  const seen = new Set<string>();
  const deduped = chosen.filter((f) => (seen.has(f.title) ? false : (seen.add(f.title), true)));
  const total = feature.length + fix.length + other.length;
  const features = deduped.slice(0, max);
  return { features, dropped: Math.max(0, total - features.length) };
}
