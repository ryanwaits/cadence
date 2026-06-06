---
name: cadence
description: Create a changelog, launch, announcement, or milestone video for ANY repo / package / release using the cadence CLI. Use whenever someone wants a video, reel, teaser, or animated showcase for a software feature, release, PR, changeset, SDK/CLI update, or milestone — phrasings like "make a changelog video for <repo>", "announcement video for the v2 release", "showcase the new <feature>", "a reel for our latest npm release", "render a 9:16 of <project>'s changelog", "milestone video: 1M downloads". Point it at a local repo path or a GitHub repo. It reads the project, writes a small data file, and renders an MP4. Trigger even when the user doesn't say "Remotion", "beats", or "render".
---

# cadence

Turn a software update into a rendered video. **A video is a list of "beats"** (a
small JSON data file); the `cadence` engine owns motion, fonts, layout, the
typewriter, code highlighting, and the backdrops. Your job: read the **target
repo**, figure out what changed, write honest beats, and render.

This works for **any** project — a TS SDK, a Rust/Go CLI, a library — not a
specific product.

## The engine
Everything runs through one CLI. Install it once for a persistent `cadence`
binary (`npm i -g @waits/cadence`), or invoke it without installing as
`npx @waits/cadence …` — either way it renders locally on the user's machine
(free, no hosted service, no key needed for a render). The examples below write
`cadence …` as shorthand for either form. If the project already depends on the
engine you can use `bun run cli …` instead.

```
cadence create <repo|beats.json>    # the build verb (repo → video, or a beats file → video)
cadence storyboard <beats.json>     # preview: plan + one still per beat → a sheet (no MP4)
cadence create … --dry-run          # same preview, straight from a repo (no MP4)
cadence audit <beats.json>          # heuristic checks on a beats file (ranked, no auto-fix)
cadence study --from-url <url>      # a brand URL/color → a theme JSON
cadence themes                      # list built-in themes
```

## Workflow

1. **Identify the target.** A local path or a GitHub repo (`owner/name`). You don't
   need the engine's source — you drive it through the CLI.
2. **Find the latest release / what changed** (the input). Prefer, in order:
   - `gh release view --repo <owner/name>` / `gh release list` (release notes), or
   - `git tag --sort=-creatordate` + `git log <prev>..<latest>` (commits), or
   - a `CHANGELOG.md` — **but verify it's current**; many repos leave it stale
     (e.g. changesets with `changelog:false`), so cross-check against tags.
   Pick the 1–4 most demo-worthy changes; each becomes a beat.
3. **Write honest code (the moat).** Never invent API. Climb the **honesty ladder**
   and stop at the first rung that gives real symbols:
   1. **Types** — the package's `.d.ts` / exported types (truest source).
   2. **Examples** — `examples/`, tests, doc snippets.
   3. **README** — documented usage / CLI commands / install line.
   4. **Install-only** — if you can't verify a call, fall back to just the install
      command + prose; do **not** show a fabricated snippet.
   Capture the real install (`npm i …`, `brew install …`, `cargo add …`) and the
   real class/command names exactly (casing matters — e.g. `SecondLayer`, not `Secondlayer`).
4. **Write `<slug>.beats.json`** — a `ChangelogInput` as JSON (see
   `references/authoring.md` for every field). Everything is JSON-serializable; don't
   author `tokens` (shiki fills them) or usually `motion` (defaults are right). Omit
   `background` entirely to get the default procedural, theme-colored backdrop.
5. **Storyboard — preview the whole arc before the MP4.** Run `cadence storyboard
   <slug>.beats.json` (or `cadence create … --dry-run` straight from a repo): it
   prints the beat-by-beat plan + pacing notes and renders a contact sheet
   (`out/<slug>.storyboard.png`), one still per beat, no MP4. Show it to the user and
   **iterate** — re-skin with `cadence redesign … --theme/--background`, fix content by
   editing the beats — re-running storyboard until the arc + look are right. This is
   the design loop; don't jump to a full render.
6. **Render.** Once the storyboard looks right, render the MP4 (and social formats if
   asked) with the locked `--theme`/`--format`. (`cadence create <slug>.beats.json
   --frame 150` still gives a fast single-frame check of one moment.)

> Authoring in TypeScript (with types) also works when you're inside the engine repo:
> a `<slug>.beats.ts` that `export default`s a `ChangelogInput`. JSON is the portable
> form and is what to use everywhere else.

## Interpreting the request (natural language → beats)

- **announcement / launch / teaser** → opener title card → 1-3 feature beats → install closer.
- **changelog / what's new / new in X** → feature beats; eyebrow `"new in <project> <version>"`.
- **milestone / N downloads / now stable** → a `stat` beat centerpiece.
- **showcase / highlight <feature>** → feature beats with the panel that shows the result.
- **format:** "vertical/reel/shorts" → `9x16`; "square/feed" → `1x1`; else `16x9`.

Keep it tight: 3-6 beats. Pick what's visual.

## Beat shapes
- **Opener** — `headline` + `eyebrow` only (title card).
- **Feature** — `headline` + `code` + `panel` (code left, output right at 16:9).
- **Stat / milestone** — a `stat` panel (one big number).
- **Install / CTA closer** — `layout:"center"` + a `bash`/install `code` block + `badge` + `caption`.

## Panel picker (`panel.kind`) — choose by what the change produces
| kind | shows | use for |
|------|-------|---------|
| `feed` | rows streaming in | live events/logs/a feed |
| `data-table` | columns + rows | a query/list result, parsed output |
| `status` | health/check rows (ok/syncing/error/idle) | CLI check output, service/test status |
| `stat` | one big number | milestones, counts |
| `proof` | a signature + drawn ✓ | signed/verifiable output |
| `stream-resume` | a resume cursor + rows | resumable streams/iterators |
| `fork` | a fork (orphan archived, new tip) | reorg/finality/branch handling |
| `upload-progress` | a progress bar + pause/resume | long-running ops, bulk export |
| `diagram` | a small pipeline (one filled node) | architecture, "how it works" |

Exact fields per kind: `references/authoring.md`.

## Rules that matter
- **Honest code only** (the ladder above) — it's the product's whole credibility.
- **Sequencing is automatic** — the engine types the code, then runs the panel. Just
  give `code` + `panel`.
- **Headlines** short + declarative ("Lint as you check.", "The mempool, indexed.").
  **Eyebrow** lowercase (`"new in clarinet 3.18"`), renders as a gold uppercase label.
- **One background per video** for continuity (or omit it on every beat for the
  consistent procedural default).

## Brand it (theme)
A video reads its colors from a theme. To match a user's brand:
- **From a URL/hex:** `cadence study --from-url https://acme.dev --name acme` (or `--accent "#10b981"`) → writes `themes/acme.json` (+ a `design.md`). Render with `cadence create <beats> --theme-file themes/acme.json`.
- **From a screenshot:** if the user hands you an image (a wallpaper, a brand shot, a UI), read its palette yourself and write a `themes/<name>.json` matching the `ThemeConfig` shape — the dominant brand color becomes `signalBlue`. Copy a built-in theme JSON as the template (`cadence themes` lists them). Then render with `--theme-file`.
- Or use a built-in named theme: `cadence create <beats> --theme <name>` (`cadence themes` to list).

## Render
```bash
cadence storyboard <slug>.beats.json             # preview: plan + one still per beat (no MP4)
cadence create <slug>.beats.json                 # 16:9 mp4 → out/
cadence create <slug>.beats.json --format 9x16   # vertical
cadence create <slug>.beats.json --frame 150     # one still (fast preview)
cadence create <slug>.beats.json --theme slate   # a built-in theme
```
Storyboard takes `--theme`/`--theme-file`/`--format` (not `--frame`).

## Reference
- `references/authoring.md` — full vocabulary: beat fields, panel kinds, motion, formats, backgrounds, sequencing, typography.
- Worked example beats files ship inside the engine package (under its `src/content/`) if you want to see complete videos.
