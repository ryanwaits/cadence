---
name: cadence
description: Create a changelog, launch, announcement, or milestone video for ANY repo / package / release using the cadence CLI. Use whenever someone wants a video, reel, teaser, or animated showcase for a software feature, release, PR, changeset, SDK/CLI update, or milestone — phrasings like "make a changelog video for <repo>", "announcement video for the v2 release", "showcase the new <feature>", "a reel for our latest npm release", "render a 9:16 of <project>'s changelog", "milestone video — 1M downloads". Point it at a local repo path or a GitHub repo. It reads the project, writes a small data file, and renders an MP4. Trigger even when the user doesn't say "Remotion", "beats", or "render".
---

# cadence

Turn a software update into a rendered video. **A video is a list of "beats"** (a
small JSON data file); the `cadence` engine owns motion, fonts, layout, the
typewriter, code highlighting, and the backdrops. Your job: pick a **kind** ×
**template**, read the **target repo**, figure out what changed, compose honest
beats, and render.

This works for **any** project — a TS SDK, a Rust/Go CLI, a library — not a
specific product.

## Three axes: kind × template × theme
Cadence has three orthogonal choices. One sentence:
**theme = what color/font; template = how big/heavy/spaced/animated; kind = what beats in what order.**

- **`kind`** = the structural arc — *which* beats, in *what* order. Members:
  `launch`, `changelog`, `milestone`, `announcement`, `showcase`. List: `cadence kinds`.
- **`template`** = the stylistic layer — *how it looks* (type scale, weight,
  spacing, surfaces, motion personality, default backgrounds), and it **binds a
  default theme**. Members: `field-notebook` (default — the warm paper look),
  `terminal` (dark monospace IDE; binds the `midnight` theme), `instructional`
  (light airy editorial). List: `cadence templates`.
- **`theme`** = color/font tokens only. A template names a default theme;
  `--theme <name>` at render always overrides. NOT a beats-file field — it's
  resolved from the project's `.cadence/theme.json` / `--theme` at render time.
  List: `cadence themes`.

You pick a kind × template, compose the beats data, then render with a theme.

## The engine
Everything runs through one CLI. Install it once for a persistent `cadence`
binary (`npm i -g @waits/cadence`), or invoke it without installing as
`npx @waits/cadence …` — either way it renders locally on the user's machine
(free, no hosted service, no key needed for a render). The examples below write
`cadence …` as shorthand for either form. If the project already depends on the
engine you can use `bun run cli …` instead.

```
cadence new <kind> [--release o/n|--changelog <p>|--repo <p>] [--template <s>] …  # kind → a durable beats file (no render)
cadence edit <beats.json>           # deterministic validate + normalize gate (re-run after each edit)
cadence fork <beats.json> [--template|--format|--headline|--name|--out]  # restyle/retarget an existing video
cadence storyboard <beats.json>     # preview: plan + one still per beat → a sheet (no MP4)
cadence create <repo|beats.json>    # the build verb (repo → video, or a beats file → video)
cadence create … --dry-run          # same preview, straight from a repo (no MP4)
cadence capabilities                # the full machine vocabulary (every prop/default/range) → json
cadence inspect <beats.json> --beat <id>  # what a beat RESOLVED to: regions, reveal timings, colors → json
cadence study --from-url <url>      # a brand URL/color → a theme JSON
cadence kinds | templates | themes  # list each axis (arcs · looks · tokens)
```

## Workflow

The loop is: **pick a kind × template → `cadence new` (scaffold the beats file) →
compose/edit the JSON yourself → `cadence edit` (validate gate, re-run after each
edit) → `cadence storyboard` → `cadence create`.**

1. **Identify the target.** A local path or a GitHub repo (`owner/name`). You don't
   need the engine's source — you drive it through the CLI.
2. **Find the latest release / what changed** (the input). Prefer, in order:
   - `gh release view --repo <owner/name>` / `gh release list` (release notes), or
   - `git tag --sort=-creatordate` + `git log <prev>..<latest>` (commits), or
   - a `CHANGELOG.md` — **but verify it's current**; many repos leave it stale
     (e.g. changesets with `changelog:false`), so cross-check against tags.
   Pick the 1–4 most demo-worthy changes; each becomes a beat.
3. **Scaffold with `cadence new <kind>`.** Pick the kind (the arc) and template (the
   look), then scaffold a **durable** `.cadence/<slug>.beats.json` you own — *no
   render*:
   ```bash
   cadence new launch --release owner/name --install "npm i pkg" --template terminal
   cadence new changelog --changelog ./CHANGELOG.md --format 9x16
   cadence new announcement            # no source ⇒ honest placeholder beats to fill in
   ```
   Flags: `--release o/n | --changelog <p> | --repo <p>` (the source), `--install
   "<cmd>"`, `--template <style>`, `--theme <name>` (render-time hint, not stored),
   `--format`, `--headline "<h>"`, `--name <slug>`, `--out <dir>`. With no source it
   writes honest placeholders; you fill the real code (next step). It prints the path
   and `→ cadence storyboard <file>`.
4. **Write honest code, then compose the beats (the moat).** Never invent API. Climb
   the **honesty ladder** and stop at the first rung that gives real symbols:
   1. **Types** — the package's `.d.ts` / exported types (truest source).
   2. **Examples** — `examples/`, tests, doc snippets.
   3. **README** — documented usage / CLI commands / install line.
   4. **Install-only** — if you can't verify a call, fall back to just the install
      command + prose; do **not** show a fabricated snippet.
   Capture the real install (`npm i …`, `brew install …`, `cargo add …`) and the
   real class/command names exactly (casing matters — e.g. `SecondLayer`, not
   `Secondlayer`). Then **edit `<slug>.beats.json` freely** — it's a `ChangelogInput`
   (see `references/authoring.md` for every field). You reason over the beats and
   their `components` + `placement` directly; everything is JSON-serializable. Don't
   author `tokens` (shiki fills them) or usually `motion` (defaults are right). Omit
   `background` to get the default procedural, theme-colored backdrop.
5. **Run the `cadence edit` gate after every edit.** `cadence edit <slug>.beats.json`
   is a **deterministic validate + normalize** step (no LLM in the binary — the
   optional NL string is just *your* note). It normalizes shorthand to canonical nodes,
   parses the schema, and runs soft audits. On a schema error it prints the **issue path + message and
   exits non-zero** — that means *fix and re-run* (a tight self-correction loop). On
   success it prints a 1-line summary + `→ cadence storyboard`. Run `cadence edit
   --explain` to dump the allowed component types / regions / panel kinds before you
   write an edit — if the gate rejects an unknown type/region/kind, that edit needs an
   engine PR (see Data vs. code, below).
6. **Storyboard — preview the whole arc before the MP4.** Run `cadence storyboard
   <slug>.beats.json [--template <style>]` (or `cadence create … --dry-run` straight
   from a repo): it prints the beat-by-beat plan + pacing notes and renders a contact
   sheet (`out/<slug>.storyboard.png`), one still per beat, no MP4. Show it to the user
   and **iterate** — restyle by changing `template`/`--theme`, fix content by editing
   the beats (re-run `cadence edit` each time) — until the arc + look are right. This
   is the design loop; don't jump to a full render.
7. **Render.** Once the storyboard looks right, render the MP4 (and social formats if
   asked) with the locked `--template`/`--theme`/`--format`. (`cadence create
   <slug>.beats.json --frame 150` still gives a fast single-frame check of one moment.)

> To **restyle or retarget an existing video**, use `cadence fork <file>
> [--template|--format|--headline|--name|--out]` — same arc, new look/format/opener,
> as a pure data rewrite (no render). Changing the *kind* needs a source, so re-run
> `cadence new <kind>` instead; `--theme` applies at render, not as a doc field.

> Authoring in TypeScript (with types) also works when you're inside the engine repo:
> a `<slug>.beats.ts` that `export default`s a `ChangelogInput`. JSON is the portable
> form and is what to use everywhere else.

## Interpreting the request (natural language → kind + format)

Map the ask to a **kind** (the `cadence new <kind>` arc), then a format:

- **launch** ("launch / announce the release") → install opener (`$ npm i …` + feature pills) → 1-3 code+panel feature beats → hero closer (package + tagline). The cinematic per-feature arc.
- **changelog / what's new / new in X** → opener → numbered data-table of the real features → install closer; eyebrow `"new in <project> <version>"`.
- **milestone / N downloads / now stable** → opener → one big `stat` centerpiece → install closer.
- **announcement / teaser** → punchy 3-beat: title opener → one consolidated highlight → hero close. Tighter than `launch`.
- **showcase / highlight ONE <feature>** → title opener → one centerpiece beat that lingers on the lead feature → hero close.
- **format:** "vertical/reel/shorts" → `9x16`; "square/feed" → `1x1`; else `16x9`.
- **look:** dark IDE/terminal vibe → `--template terminal`; light tutorial/editorial → `--template instructional`; else the default `field-notebook`.

`cadence kinds` lists each arc with a "when to use". Keep it tight: 3-6 beats; pick what's visual.

## Beat shapes (the common compositions)
A beat is `{ id, durationInFrames, layout?, background?, components }`. **`components`
is the one authoring model** — a list of nodes. Author them terse with **key-shorthand**
(`{ title: "…" }`, `{ code: {…} }`, `{ panel: {…} }`, `{ eyebrow }`, `{ caption }`,
`{ badge }`, `{ note }`); the engine normalizes shorthand into canonical `{ type, … }`
nodes before render. Reach for the canonical form + `placement` only when you need to
move/resize/reorder a piece (next section). The common shapes:

- **Opener (title)** — `[{ eyebrow }, { title }]` (classic title card).
- **Install opener** — `layout:"center"` + `[{ code:{ lang:"bash", … } }, { badge:"v1.7" }, { caption:"sync · folders · read-only" }]`. The default open for a `launch` reel.
- **Feature** — `[{ eyebrow }, { title }, { code:{…} }, { panel:{…} }]` (code lead, result panel trailing at 16:9). Default to pairing code with a panel — show the *result*, not just a title.
- **Stat / milestone** — `[{ title }, { panel:{ kind:"stat", … } }]` (one big number).
- **Hero closer** — `layout:"hero"` + `[{ title:"<package>" }, { caption:"<pitch>", variant:"subhead", placement:{ region:"lead" } }]`. Everything centered, footer suppressed. Add `{ note:"…" }` for a handwritten flourish (marker color, theme `fonts.note`).
- **Install / CTA closer** — `layout:"center"` + `[{ title:"Get it." }, { code:{ lang:"bash", … } }, { badge }]`.

**`layout`** picks the full-frame composition: `split` (default — headline on top,
content band below, footer shown) · `center` (centered content band, headline still on
top, footer shown — install openers) · `hero` (everything centered, footer suppressed —
closers).

## Composition — moving, resizing, reordering pieces
Terse shorthand and canonical nodes are the **same model** — author a node in canonical
form `{ type, placement, …props }` when you need to "put the note on the headline line",
"code left, panel right", "center the title", or reorder things, and leave the rest as
shorthand. A node is `{ type, placement, …props }`:

- **types:** `title` · `eyebrow` · `note` · `caption` · `badge` · `code` · `panel`
  (text nodes take `text`; `code` takes `code:{…}`; `panel` takes `panel:{…}`).
  `caption` also takes `variant:"footer"|"subhead"`.
- **`placement: { region, align, size, order }`** — all optional (omitted ⇒ the
  template's default for that type):
  - **`region`** — a CLOSED set: `header | lead | trailing | footer`. `header` =
    eyebrow row; `lead` = the main column (title/note + code); `trailing` = the
    second seat in the row band (the panel at 16:9); `footer` = the bottom bar
    (caption/badge).
  - **`align`** — `start | center | end`.
  - **`size`** — `auto | sm | md | lg | fill` (per-format pixel tiers owned by the
    template; `fill` for code, `md` for a panel).
  - **`order`** — intra-region sort (text reserves 0–2, code 10).

**Split code + panel feature beat** (code left, result panel right):
```json
{
  "id": "events", "durationInFrames": 235,
  "components": [
    { "type": "eyebrow", "text": "new in streams", "placement": { "region": "header" } },
    { "type": "title", "text": "Stream every event.", "placement": { "region": "lead" } },
    { "type": "code", "placement": { "region": "lead", "align": "start", "size": "fill" },
      "code": { "filename": "events.ts", "lang": "ts", "source": "const { events } = await sl.index.events({ limit: 50 });" } },
    { "type": "panel", "placement": { "region": "trailing", "size": "md" },
      "panel": { "kind": "feed", "title": "index.events", "subtitle": "ft_transfer", "rows": [{ "badge": "sBTC", "label": "SP2J6…WVEF", "value": "1,200.00" }] } }
  ]
}
```

**Centered hero + note closer** (big title over a handwritten flourish):
```json
{
  "id": "close", "durationInFrames": 160, "layout": "hero",
  "components": [
    { "type": "title", "text": "Secondlayer", "placement": { "region": "lead", "align": "center" } },
    { "type": "note", "text": "Streams", "placement": { "region": "lead", "align": "center", "order": 2 } }
  ]
}
```

`references/authoring.md` has the exact component/placement schema.

## Panel picker (`panel.kind`) — choose by what the change produces
<!-- BEGIN GENERATED:panel-picker — run `bun run sync-skill`; do not edit by hand -->
| kind | use for |
|------|---------|
| `feed` | live events / logs / a feed |
| `upload-progress` | long-running / bulk ops |
| `data-table` | a query / list result |
| `status` | service / test health |
| `proof` | signed / verifiable output |
| `stream-resume` | resumable streams / iterators |
| `fork` | reorg / finality |
| `stat` | one big number (milestones, counts) |
| `diagram` | architecture / how-it-works |
| `browser` | file / folder listing |
| `quote` | a pull-quote / testimonial |
<!-- END GENERATED:panel-picker -->

Exact fields per kind: `references/authoring.md`.

## Allowed vocabulary (generated — the closed sets the gate enforces)
<!-- BEGIN GENERATED:vocabulary — run `bun run sync-skill`; do not edit by hand -->
**Components (leaves):** `title`, `eyebrow`, `note`, `caption`, `badge`, `code`, `panel`
**Layout containers:** `row`, `col`, `grid`, `group`
**Regions:** `header`, `lead`, `trailing`, `footer`

**Panel kinds** (`panel.kind` — pick by what the change produces):
- `feed` — live events / logs / a feed
- `upload-progress` — long-running / bulk ops
- `data-table` — a query / list result
- `status` — service / test health
- `proof` — signed / verifiable output
- `stream-resume` — resumable streams / iterators
- `fork` — reorg / finality
- `stat` — one big number (milestones, counts)
- `diagram` — architecture / how-it-works
- `browser` — file / folder listing
- `quote` — a pull-quote / testimonial

**Motion presets** (per-node `motion.enter` / `.exit`):
- enter: `rise` (slides up + fades in (headlines, cards)) · `settle` (scales 1.03→1 + fades (windows/panels arriving)) · `bloom` (fade + de-blur (backgrounds)) · `type` (character-by-character typewriter (code)) · `stagger` (children cascade in (list rows)) · `draw` (SVG stroke reveal (diagrams, the ✓ badge)) · `count` (number tweens 0→value (stat))
- exit: `sink` (slides up + fades out) · `dissolve` (fade out) · `lift` (scales up + fades out) · `cut` (instant)

**Timing tokens** (template `motion.timing` — every temporal DOF; per-element `motion` overrides win):
- typingSpeed 2.6 chars/frame · outputGap 10 frames · settle 18 frames · enterDuration 0.55 seconds · exitDuration 0.4 seconds

> Full machine vocabulary (every prop with type/default/range/example): `cadence capabilities`. Engine sha256:62e9293cb9fec349b04d936de377f18640bcf8e54c024690f06067d537f70f94
<!-- END GENERATED:vocabulary -->

If `cadence capabilities` reports a different `schemaDigest` than the Engine sha embedded above, this skill copy is stale — trust `cadence capabilities` / `cadence edit --explain` output over these tables.

## Compose within a region — layout containers (v2)
The top level is region-routed (`header/lead/trailing/footer`); to arrange content
*inside* a region, nest a container — this is data, no PR:
- **`col`** stacks children vertically (e.g. code *over* a result panel).
- **`row`** lays children side-by-side at 16:9; it **reflows to a column** below 16:9.
- **`grid`** tiles `cols` across (collapses to 1 column below 16:9).
- **`group`** scopes style/motion with no layout effect.
Each node also takes optional `style` (color/bg = a theme **role**, `gap`/`padding`,
`chrome: window|minimal|none`, `size`) and sequencing (`id` + another node's
`placement.revealAfter`, a container's `stagger`).

## Data vs. code — what you compose vs. what needs a PR
The schema *is* the boundary, and `cadence edit`'s parse step is the enforcer:
**if `cadence edit` accepts it, it's data you compose in JSON; if it rejects an
unknown type/region/kind, it needs an engine PR.**

**Pure data (compose it yourself):**
- text — headline / eyebrow / caption / note / a `Title`/`Note` `text`
- placement — move a component `region`↔`region`, re-`align`, pick a `size` tier, set `order`
- swap a `panel.kind` or its rows/columns
- reorder beats, retime `durationInFrames`, drop a beat
- `layout: split↔center↔hero`, swap `theme` / `template` / `format`, set a per-video `background` (+ `scrim`)
- pick a different motion **preset** from the named vocabulary
- **layout** — wrap nodes in a `row`/`col`/`grid`/`group` to compose within a region
- **per-node `style`** — `color`/`bg` (a theme role), `gap`/`padding`, `chrome`, `size`
- **sequencing** — give a node an `id` and another `placement.revealAfter: <id>`, or a container `stagger`

**Needs an engine PR (stop and report — don't fake it):**
- a **new component type** (e.g. `Quote`, `Avatar`)
- a **new region** (the set is closed) or free x/y positioning
- a **new panel kind** (a new `panels/*.tsx` + union member)
- a **new motion preset / easing curve** (the vocabulary lives in code)
- a **new template** (a styling + layout + motion bundle)

Run `cadence edit --explain` to see the current allowed types / regions / panel kinds.

## Rules that matter
- **Honest code only** (the ladder above) — it's the product's whole credibility.
- **Sequencing is automatic** — the engine types the code, then runs the panel. Just
  give `code` + `panel`.
- **Headlines** short + declarative ("Lint as you check.", "The mempool, indexed.").
  **Eyebrow** lowercase (`"new in clarinet 3.18"`), renders as a gold uppercase label.
- **One background per video** for continuity (or omit it on every beat for the
  consistent procedural default).

## Brand it (theme)
A video reads its colors, fonts, and code styling from a theme. To match a brand:
- **Capture the project's brand in `<project>/.cadence/theme.json`** (a `ThemeConfig`). cadence **auto-discovers** it when run against that project (it walks up from the beats file), so no `--theme-file` is needed — and no brand-specific files land in the engine. Scaffold with `cadence study --accent "#10b981" --out <project>/.cadence/theme.json` (or `--from-url <url>`), then hand-tune. This is the preferred way to brand a video.
- **Match the project's docs code snippets.** The theme styles the code window too — set `fonts.mono`, the `codeTheme` syntax colors + `codeBg` to the project's docs highlighter, and `codeChrome: "minimal"` for a chromeless, docs-style window (default `"window"` is the floating editor with traffic-light dots). Verify with `cadence storyboard <beats>` and compare to the real docs so on-screen code matches.
- **From a screenshot / URL:** read the palette yourself and write the `ThemeConfig` — the dominant brand color becomes `signalBlue`; copy a built-in as a template (`cadence themes` lists them).
- Or a built-in named theme: `cadence create <beats> --theme <name>`. Precedence: `--theme-file` > `--theme` > the project's `.cadence/theme.json` > the template's bound theme > default. (Each `template` binds a default theme — `terminal` → `midnight`, `field-notebook`/`instructional` → `default` — so picking a template also picks its palette unless you override.)

**Custom painted backgrounds** (optional, needs `OPENAI_API_KEY`): `cadence art --prompt "<scene>" --name <slug>` generates a backdrop into `<project>/.cadence/backgrounds/_candidates/`; `cadence art --promote <slug>` moves the keeper to `.cadence/backgrounds/`; then reference it in a beat as `background: { src: "backgrounds/<file>.png" }` (cadence stages it at render). Reusable subject sets: `--pack <file.json>`; `--brand` tints art toward the project's theme palette. The bundled default pack is the Austin "Hill Country Sublime" landmarks — reuse one without any key/generation by referencing it directly (`background: { src: "backgrounds/pennybacker.png" }`; also `capitol, congress, mount-bonnell, enchanted-rock, hamilton-pool, barton-springs, ut-tower`), or regenerate a branded variant with `cadence art --landmark <camelKey> --brand` (keys: `pennybacker, utTower, capitol, congress, mountBonnell, enchantedRock, hamiltonPool, bartonSprings`). Default backdrop stays procedural — only reach for this when the user wants painted art. See `docs/guides/branding-and-formats.md`.

## Render
```bash
cadence storyboard <slug>.beats.json                 # preview: plan + one still per beat (no MP4)
cadence create <slug>.beats.json                     # 16:9 mp4 → out/
cadence create <slug>.beats.json --format 9x16       # vertical
cadence create <slug>.beats.json --frame 150         # one still (fast preview)
cadence create <slug>.beats.json --template terminal # restyle (look) — binds the midnight theme
cadence create <slug>.beats.json --theme slate       # a built-in theme (overrides the template's bound theme)
```
Storyboard takes `--template`/`--theme`/`--theme-file`/`--format` (not `--frame`).
A `template` set in the beats file is the default; `--template` at render overrides it,
and `--theme` always wins over the template's bound theme.

Outputs land in `<project>/.cadence/out` when run against a repo that has a
`.cadence/` dir (anchored to the project, not the cwd), else `./out`. Override
with `--out <dir>`.

## Reference
- `references/authoring.md` — full vocabulary: beat fields, panel kinds, motion, formats, backgrounds, sequencing, typography.
- Worked example beats files ship inside the engine package (under its `src/content/`) if you want to see complete videos.
