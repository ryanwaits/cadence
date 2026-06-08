# Cadence Videos

Turn a software update — a release, a PR, a CHANGELOG, a milestone — into a
rendered video for **any** project (a TS SDK, a Rust/Go CLI, a library). It runs
locally and free; no hosted service, no API key for a render.

A video is a list of **beats** (a small JSON data file). The engine owns motion,
fonts, layout, the typewriter, code highlighting, and the backdrops. Your job: pick
a **kind** × **template**, read the target repo, figure out what changed, compose
honest beats, and render.

> CLI shorthand: `cadence …` assumes a global install (`npm i -g @waits/cadence`).
> No install? `npx @waits/cadence …`. Inside the engine repo, use `bun run cli …`.

---

## Three axes: kind × template × theme

One sentence: **kind = which beats in what order · template = how it looks ·
theme = colors/fonts.**

- **`kind`** — the structural arc (which beats, in what order). Chosen with
  `cadence new <kind>`. Members: `launch`, `changelog`, `milestone`,
  `announcement`, `showcase` (the old `feature-launch` / `changelog-reel` still
  work as aliases). List: `cadence kinds`.
- **`template`** — the stylistic layer (type scale, weight, spacing, surfaces,
  motion, default backgrounds). Members: `field-notebook` (default — warm paper),
  `terminal` (dark monospace IDE; binds the `midnight` theme), `instructional`
  (light airy editorial). Set with `--template <style>`. List: `cadence templates`.
- **`theme`** — color/font tokens only. A template binds a default; `--theme <name>`
  at render always overrides. Not a beats-file field. List: `cadence themes`.

So `cadence new changelog --template terminal` picks the changelog *arc* with the
terminal *look*.

---

## The five kinds

| kind | arc it produces | use when |
|------|-----------------|----------|
| `launch` | install opener (`$ npm i …` + feature pills) → 1–3 code+panel feature beats → hero closer | a full release where each headline feature lands on its own |
| `changelog` | opener → numbered `data-table` of the real features → install closer; eyebrow `"new in <project> <version>"` | summarizing several changes at a glance, scannable |
| `milestone` | opener → one big `stat` centerpiece → install closer | one headline metric (downloads, stars, "now stable") |
| `announcement` | punchy 3-beat: title opener → one consolidated highlight → hero close | teasing a release in a few seconds; tighter than `launch` |
| `showcase` | title opener → one centerpiece beat lingering on the lead feature → hero close | highlighting ONE feature in depth |

Format: "vertical/reel/shorts" → `--format 9x16`; "square/feed" → `1x1`; else
`16x9`. Keep it tight: 3–6 beats; pick what's visual. (The arc functions live in
`src/kinds/*.ts` — e.g. `src/kinds/changelog.ts`.)

---

## The workflow: new → edit → storyboard → create

```bash
cadence new <kind> [--release o/n | --changelog <p> | --repo <p>] [--template <s>] …  # kind → a durable beats file (no render)
cadence edit <beats.json>           # deterministic validate + normalize gate (re-run after each edit)
cadence storyboard <beats.json>     # preview: plan + one still per beat → a sheet (no MP4)
cadence create <repo|beats.json>    # the build verb (renders the MP4)
```

1. **Identify the target** — a local path or a GitHub repo (`owner/name`).
2. **Find what changed** — prefer `gh release view` / `gh release list`, else
   `git tag --sort=-creatordate` + `git log`, else a `CHANGELOG.md` (verify it's
   current — many repos leave it stale). Pick the 1–4 most demo-worthy changes.
3. **Scaffold with `cadence new <kind>`** — writes a durable
   `.cadence/<slug>.beats.json` you own (no render):
   ```bash
   cadence new launch --release owner/name --install "npm i pkg" --template terminal
   cadence new changelog --changelog ./CHANGELOG.md --format 9x16
   cadence new announcement            # no source ⇒ honest placeholder beats to fill in
   ```
   Source flags: `--release owner/name` · `--tag vX.Y.Z` · `--changelog <p>` ·
   `--repo <p>`. Plus `--install "<cmd>"`, `--product <name>`, `--template`,
   `--format`, `--headline "<h>"`, `--stat-value/--stat-label/--stat-sub` (for
   `milestone`), `--name <slug>`, `--out <dir>`. `--theme` applies at render, not
   stored.
4. **Compose honest beats** — climb the honesty ladder (below), then edit the JSON
   freely. See [`authoring.md`](../../.claude/skills/cadence/references/authoring.md)
   for every field; [composition.md](composition.md) for the component-tree /
   placement / style model.
5. **Run `cadence edit` after every edit** — a deterministic validate + normalize
   gate. On a schema error it prints the issue path + message and exits non-zero
   (fix and re-run). `cadence edit --explain` dumps the allowed types / regions /
   panel kinds.
6. **Storyboard** — `cadence storyboard <beats.json>` prints the beat-by-beat plan
   and renders a contact sheet (`out/<slug>.storyboard.png`), one still per beat,
   no MP4. Iterate here — restyle via `--template`/`--theme`, fix content by editing
   beats — until the arc + look are right. (Deeper: [iterate & preview](iterate-and-preview.md).)
7. **Create (render)** — once the storyboard looks right:
   ```bash
   cadence create <slug>.beats.json                     # 16:9 MP4 → out/
   cadence create <slug>.beats.json --format 9x16       # vertical
   cadence create <slug>.beats.json --template terminal # restyle (binds midnight)
   cadence create <slug>.beats.json --theme slate       # built-in theme override
   cadence create <slug>.beats.json --frame 150         # one still (fast check)
   ```

`cadence create <repo>` can also go straight from a repo to a video; add
`--dry-run` to preview (plan + one still per beat, no MP4):

```bash
cadence create --release owner/name --install "npm i pkg" --dry-run
```

To **restyle or retarget an existing video**, use
`cadence fork <file> [--template|--format|--headline|--name|--out]` — same arc, new
look/format/opener, as a pure data rewrite (no render).

Outputs land in `<project>/.cadence/out` when run against a repo with a `.cadence/`
dir, else `./out`. Override with `--out <dir>`.

---

## The honesty ladder

Cadence's core principle and the reason its output is credible: **never invent API.**
Whatever code a beat shows must be verifiable in the target project. Climb the
ladder and stop at the first rung that yields real symbols:

1. **Types** — the package's `.d.ts` / exported types (the truest source).
2. **Examples** — `examples/`, tests, doc snippets.
3. **README** — documented usage, CLI commands, the install line.
4. **Install-only** — if no call can be verified, fall back to just the install
   command + prose. Never show a fabricated snippet.

Capture the real install (`npm i …`, `brew install …`, `cargo add …`) and the real
class/command names exactly — **casing matters** (`SecondLayer`, not `Secondlayer`).

The deterministic `changelog` / `milestone` arcs stay honest a different way: they
show **zero invented code** — only the feature *titles* parsed from release notes
(in a `data-table` / `stat`) plus the real install command. That makes the no-LLM
repo path safe to run unattended (e.g. CI). For real code snippets per feature,
hand-author the beats.

---

## Panel picker (`panel.kind`) — choose by what the change produces

A feature beat's craft is the **panel**: pick the one that visualizes the *result*
the change produces. Eleven kinds:

| kind | shows | use for |
|------|-------|---------|
| `feed` | rows streaming in | live events / logs / a feed |
| `data-table` | columns + rows | a query/list result, parsed output |
| `status` | health rows (ok/syncing/error/idle) | CLI check output, service/test status |
| `stat` | one big number | milestones, counts |
| `proof` | a signature + a drawn ✓ | signed / verifiable output |
| `stream-resume` | a resume cursor + rows | resumable streams / iterators |
| `fork` | a fork (orphan archived, new tip) | reorg / finality / branch handling |
| `upload-progress` | a progress bar + pause/resume | long-running ops, bulk export |
| `diagram` | a small pipeline (one filled node) | architecture, "how it works" |
| `browser` | Finder-style folder/file rows | a file/folder listing |
| `quote` | a quoted line | a testimonial / a pull-quote |

Exact fields per kind:
[`authoring.md`](../../.claude/skills/cadence/references/authoring.md).

---

## Worked example — a changelog reel

`acme-labs/acme-sdk` just shipped `v2.3.0`. Scaffold the changelog arc, edit,
preview, render:

```bash
cadence new changelog --release acme-labs/acme-sdk --install "npm i @acme/sdk"
# → .cadence/acme-sdk-changelog.beats.json   (· acme-sdk v2.3.0: 3 features, +2 dropped)
cadence edit .cadence/acme-sdk-changelog.beats.json
cadence storyboard .cadence/acme-sdk-changelog.beats.json
cadence create .cadence/acme-sdk-changelog.beats.json
```

The scaffolded file is roughly:

```json
{
  "format": "16x9",
  "beats": [
    { "id": "opener", "durationInFrames": 150,
      "eyebrow": "new in acme-sdk", "headline": "v2.3.0 is out." },
    { "id": "changes", "durationInFrames": 222, "headline": "What's new.",
      "panel": {
        "kind": "data-table", "title": "acme-sdk v2.3.0",
        "columns": ["#", "change"],
        "rows": [
          ["1", "Streaming responses for the query client"],
          ["2", "Typed errors on every request"],
          ["3", "Edge runtime support"]
        ]
      } },
    { "id": "cta", "durationInFrames": 160, "headline": "Get it.", "layout": "center",
      "code": { "filename": "terminal", "lang": "bash", "source": "npm i @acme/sdk" },
      "badge": "v2.3.0" }
  ]
}
```

Edit it by hand — tighten a headline, drop a row, or swap the `data-table` for a
feature beat with a real snippet climbed from the SDK's types. Re-run `cadence edit`
after each change.

## Worked example — a launch feature beat

A `launch` arc pairs honest code with a panel that shows the result. The new query
returns rows, so the panel is `feed`:

```json
{
  "id": "query", "durationInFrames": 235,
  "headline": "Query it in three lines.",
  "code": { "filename": "events.ts", "lang": "ts",
    "source": "const { events } = await sl.index.events({\n  eventType: \"ft_transfer\",\n  limit: 50,\n});" },
  "panel": { "kind": "feed", "title": "index.events", "subtitle": "ft_transfer",
    "rows": [
      { "badge": "sBTC", "label": "SP2J6…WVEF", "value": "1,200.00" },
      { "badge": "USDA", "label": "SP3K9…X1A0", "value": "48.50" }
    ] }
}
```

The engine types the code on the left, then runs the panel on the right —
sequencing is automatic, you supply both. For a milestone, swap the panel for a
single `stat` (`{ "kind": "stat", "value": "10,000,000", "label": "events decoded",
"sub": "block 0 → chain tip" }`); a numeric value counts up.

---

## Rules that matter

- **Honest code only** (the ladder above) — it's the product's whole credibility.
- **Short, declarative headlines** — "Query it in three lines.", not a sentence.
- **Lowercase eyebrow** (`"new in clarinet 3.18"`) — renders as a gold uppercase label.
- **One background per video** for continuity (or omit `background` on every beat
  for the consistent procedural default).

---

## Where to go next

- **[composition.md](composition.md)** — the component-tree / placement / style
  model: moving, resizing, reordering pieces; regions
  (`header | lead | trailing | footer`); layout containers
  (`row` / `col` / `grid` / `group`); per-node style; sequencing.
- **[`authoring.md`](../../.claude/skills/cadence/references/authoring.md)** — the
  exact fields: every beat field, panel kind, motion, format, background,
  sequencing, typography.
- `cadence kinds | templates | themes` — list each axis.
- `cadence audit <beats.json>` — heuristic pacing/legibility checks (advisory, no
  auto-fix).
