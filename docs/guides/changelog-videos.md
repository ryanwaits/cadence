# Changelog Videos

The "what's new in vX" use case: point Cadence at a repo or a release and get an
on-brand reel of the changes — real code from your project, rendered locally, free.

This guide assumes the `cadence` binary is on your PATH. If not, see
[install](install.md) (`npm i -g @waits/cadence`, or `npx @waits/cadence …` with
no install). Inside the engine repo, swap `cadence` for `bun run cli`.

---

## The mental model: a video is a list of beats

A Cadence video is a small JSON file (`<slug>.beats.json`) — a list of **beats**.
Each beat is a generic unit: an optional background, a headline, an optional code
window, and an optional panel. The engine owns motion, fonts, layout, the
typewriter, and code highlighting; the beats just say *what* to show.

A **changelog** is one shape of that list: an opener title card, then a beat per
demo-worthy feature, closing on the install command. The opener carries an
**eyebrow** — `"new in <project> <version>"` — which renders as a gold uppercase
label above the headline. That eyebrow is what makes a reel read as a changelog
rather than a generic launch.

---

## The fastest path: a release → a reel

The deterministic, no-LLM path reads a GitHub release, lays out the features it
parses, and renders — no agent, no invented code:

```bash
cadence create --release owner/name --install "npm i your-pkg"
```

Cadence shells out to `gh release view`, so you need the [GitHub CLI](https://cli.github.com)
authenticated for a `--release` source.

### Source flags

Pick where "what changed" comes from:

| flag | what it does |
|------|--------------|
| `--release owner/name` | read the latest GitHub release's notes for that repo |
| `--tag vX.Y.Z` | pin a specific release tag instead of the latest |
| `--changelog <path>` | parse a local `CHANGELOG.md` instead of a release |
| `--product <name>` | label shown in the eyebrow/title (defaults to the repo name) |
| `--install "<cmd>"` | the real install command for the closer (`npm i …`, `brew install …`, `cargo add …`) |
| `--template changelog-reel` | the template (this is the default; named for clarity) |

A `--changelog` source cross-checks a sibling `package.json` and warns on stdout
if the changelog's top version disagrees — many repos leave `CHANGELOG.md` stale
(e.g. changesets with `changelog:false`), so prefer `--release` when you can.

The `changelog-reel` template produces three beats: an **opener**
(`eyebrow: "new in <product>"`, `headline: "<version> is out."`), a **What's new.**
beat with a `data-table` panel numbering the parsed features (up to 6), and — only
when `--install` is supplied — a centered **Get it.** closer with the install
command and a `v<version>` badge.

---

## The honesty ladder

This is the product's core principle and the reason its output is credible:
**Cadence never invents API.** Whatever code a beat shows must be verifiable in the
target project. When an agent authors beats, it climbs an honesty ladder and stops
at the first rung that yields real symbols:

1. **Types** — the package's `.d.ts` / exported types (the truest source).
2. **Examples** — `examples/`, tests, doc snippets.
3. **README** — documented usage, CLI commands, the install line.
4. **Install-only** — if no call can be verified, fall back to just the install
   command plus prose. Never show a fabricated snippet.

Casing matters: capture class and command names exactly (`SecondLayer`, not
`Secondlayer`). The agent-authored
[`sdk-6.5-mempool.beats.ts`](../../src/content/sdk-6.5-mempool.beats.ts) is a worked
example — its header comment records that the ladder caught the real class name and
the real call signature straight from the SDK's types.

The deterministic `changelog-reel` template
([`src/templates/changelog-reel.ts`](../../src/templates/changelog-reel.ts)) stays
honest a different way: it shows **zero invented code**. It only renders the feature
*titles* the adapter parsed out of the release notes (in a `data-table`) and the
real install command you passed — no code snippets it can't prove. That makes the
no-LLM path safe to run unattended (e.g. in CI). For real code snippets from the
repo, ask your agent to author the beats instead (the honest, hand-climbed version).

---

## Picking which changes to feature

Keep it tight: **1–4 of the most demo-worthy changes**, 3–6 beats total. A reel
that tries to cover every bullet loses attention. The release adapter already
prefers feature/added/perf sections over chore/build/test noise, dedupes, and
reports how many bullets it dropped — but you still choose what's *visual*.

Each chosen change becomes a feature beat: a short declarative headline, an honest
code snippet (left at 16:9), and a **panel** that visualizes what the change
*produces*. Pick the panel by result:

| panel | shows | use for |
|-------|-------|---------|
| `feed` | rows streaming in | live events / logs |
| `data-table` | columns + rows | a query or list result, parsed output |
| `status` | health rows (ok/syncing/error/idle) | CLI check output, service status |
| `stat` | one big number | milestones, counts |
| `proof` | a signature + drawn ✓ | signed / verifiable output |
| `stream-resume` | a resume cursor + rows | resumable streams / iterators |
| `fork` | a fork (orphan archived, new tip) | reorg / finality handling |
| `upload-progress` | a progress bar + pause/resume | long-running / bulk ops |
| `diagram` | a small pipeline (one filled node) | architecture, "how it works" |

The full field list per panel kind lives in the engine's authoring reference
(`references/authoring.md` in the cadence skill).

---

## Worked example: a TS SDK changelog

Say `acme-labs/acme-sdk` just shipped `v2.3.0`. The fast, deterministic path:

```bash
cadence create --release acme-labs/acme-sdk --install "npm i @acme/sdk"
```

Cadence prints what it found and writes the beats to `out/`:

```
· acme-sdk v2.3.0: 3 features (+2 dropped) → changelog-reel
```

It produced `out/make-acme-sdk.beats.json` — roughly:

```json
{
  "format": "16x9",
  "beats": [
    {
      "id": "opener",
      "durationInFrames": 150,
      "eyebrow": "new in acme-sdk",
      "headline": "v2.3.0 is out."
    },
    {
      "id": "changes",
      "durationInFrames": 222,
      "headline": "What's new.",
      "panel": {
        "kind": "data-table",
        "title": "acme-sdk v2.3.0",
        "columns": ["#", "change"],
        "rows": [
          ["1", "Streaming responses for the query client"],
          ["2", "Typed errors on every request"],
          ["3", "Edge runtime support"]
        ]
      }
    },
    {
      "id": "cta",
      "durationInFrames": 160,
      "headline": "Get it.",
      "layout": "center",
      "code": { "filename": "terminal", "lang": "bash", "source": "npm i @acme/sdk" },
      "badge": "v2.3.0"
    }
  ]
}
```

You can edit that JSON by hand — tighten a headline, drop a row, swap the
`data-table` for a feature beat with a real snippet climbed from the SDK's types.
For an agent-authored version with honest code per feature, ask your agent for "a
changelog video for acme-sdk v2.3.0" and it will write the beats for you.

### Preview a still, then render

Check a frame before committing to a full render — a still takes a few seconds:

```bash
cadence create out/make-acme-sdk.beats.json --frame 150
# → out/make-acme-sdk-16x9-f150.png
```

`--frame <n>` is the frame index into the timeline. Beats run back-to-back at 30fps,
so pick a frame inside the beat you want to inspect (the opener above ends at frame
150; the table beat runs through ~372). Iterate until it parses and looks right,
then drop `--frame` for the MP4:

```bash
cadence create out/make-acme-sdk.beats.json
# → out/make-acme-sdk-16x9.mp4
```

Add `--format 9x16` for a vertical reel or `--format 1x1` for a feed square; set
`--theme <name>` or `--theme-file <path>` to match a brand. Formats and theming are
covered in [branding and formats](branding-and-formats.md).

---

## Audit before you render

`cadence audit` runs static, heuristic checks on a beats file — advisory only,
ranked findings, no auto-fix:

```bash
cadence audit out/make-acme-sdk.beats.json
```

It flags pacing and legibility problems before you spend a render on them:

- beat count outside the tight 3–6 range,
- beats too short to read (< 1.5s) or likely too long (> 12s),
- headlines over 48 characters,
- motion monotony (every headline using the same enter transition),
- a last beat that doesn't look like an install/CTA closer.

Fix the content by hand (audit never edits), re-run, then render.
