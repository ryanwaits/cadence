# Authoring reference — the full vocabulary

Practical companion to `SKILL.md`. The engine validates every beats file against a
strict schema (shipped in the `cadence` package); this explains how to *choose* and
*fill* each piece. A bad field fails fast with a clear error — render a `--frame`
still to check.

## Contents
- [The beats file](#the-beats-file)
- [Beat fields](#beat-fields)
- [Composition (components + placement)](#composition)
- [Panel kinds (exact fields + examples)](#panel-kinds)
- [Motion vocabulary](#motion-vocabulary)
- [Formats](#formats)
- [Backgrounds](#backgrounds)
- [Sequencing model](#sequencing-model)
- [Title typography](#title-typography)

## The beats file

A `<slug>.beats.json` is a `ChangelogInput` — render it with `cadence create <slug>.beats.json`:

```json
{
  "format": "16x9",
  "template": "field-notebook",
  "beats": [ /* 3-6 beats */ ]
}
```

`format` is `"16x9" | "1x1" | "9x16"`. `template` (optional) is the stylistic layer —
one look per video — `"field-notebook" | "terminal" | "instructional"` (list:
`cadence templates`); it binds a default theme that `--theme` overrides at render.
`theme` is NOT a doc field — it's resolved from `--theme` / the project's
`.cadence/theme.json` at render time. Everything is plain JSON-serializable data:
no functions, no JSX. Motion, panel kind, and background are string keys the engine
resolves at render time. (Inside the engine repo you can instead author a
`<slug>.beats.ts` that `export default`s a typed `ChangelogInput` — the field shapes
below are identical; this reference uses TS snippets to show the types.)

## Beat fields

```ts
{
  id: "slug",                  // unique within the video
  durationInFrames: 235,       // 30fps. ~150 title, ~235 code+panel, ~170 stat
  background: { src: "backgrounds/mount-bonnell.png", treatment: "kenburns" },
  eyebrow: "new in streams",   // optional; lowercase → renders gold UPPERCASE
  headline: "Stream every event.",
  caption: "subscribe · verify · resume",  // optional bottom-center tagline
  badge: "v6.3",               // optional gold version pill (with caption)
  layout: "split",             // "split" (default) | "center" (for closers)
  hero: true,                  // optional; centered title card (headline + caption under it)
  note: "Streams",             // optional handwritten flourish under the headline (marker color)
  code: { /* see below */ },   // optional
  panel: { /* see below */ },  // optional
  components: [ /* see Composition */ ], // optional; explicit placement (replaces the legacy fields above)
}
```

A beat needs **either** the legacy fields above **or** a `components` array — both are
valid (the legacy fields desugar into `components` automatically). `headline` is only
required on the legacy path; a `components` beat carries its title as a `Title`
component instead. Use `components` when you need to move/resize/reorder a piece (see
[Composition](#composition)).

**Handwritten flourish (`note`).** A beat-level `note` renders under the headline
in the handwriting font (the theme's `fonts.note`, marker color) — e.g. a logo
lockup on a closer: `{ layout: "center", headline: "Secondlayer", note: "Streams" }`
draws "Secondlayer" big over a handwritten "Streams". (Distinct from a `diagram`
panel's `note`.) Needs a theme whose `fonts.note` is a loaded handwriting family
(the default is `Caveat`).

**Duration guidance.** Code+panel beats need room because the panel waits for the
code to finish typing (see Sequencing). ~235 frames fits ~12 lines of code plus a
panel reveal. Title/stat/closer beats: ~150-170.

**Code spec:**
```ts
code: {
  filename: "events.ts",       // shown centered in the title bar
  lang: "ts",                  // "ts" | "tsx" | "bash" | "json"
  source: `const { events } = await sl.index.events({ limit: 50 });`,
  // do NOT add `tokens` — shiki tokenizes at render time
}
```

## Composition

A beat can carry an explicit `components: ComponentInstance[]` instead of the legacy
fields — independently placeable pieces. The renderer runs *only* on `components`; the
legacy fields desugar into this exact model, so both shapes are valid and you can
hand-author `components` only where you need the placement control.

**Component shape** — a discriminated union on `type`:

```ts
type ComponentInstance =
  | { type: "title";   placement: Placement; text: string; motion?: Motion }
  | { type: "eyebrow"; placement: Placement; text: string }
  | { type: "note";    placement: Placement; text: string }
  | { type: "caption"; placement: Placement; text: string; variant?: "footer" | "subhead" } // default "footer"
  | { type: "badge";   placement: Placement; text: string }
  | { type: "code";    placement: Placement; code: Code }    // same `code` shape as the legacy field
  | { type: "panel";   placement: Placement; panel: Panel }; // same `panel` shape (panel.kind stays inside)
```

The schema is `.strict()` — an unknown `type` or extra prop fails `cadence edit` (that
means it's a code change, not data). `code`/`panel` reuse the exact `Code`/`Panel`
shapes documented elsewhere in this file; `panel.kind` stays *inside* the `panel` prop.

**Placement** — every field optional; an omitted field falls to the template's default
for that component type:

```ts
type Placement = {
  region?: "header" | "lead" | "trailing" | "footer"; // CLOSED set
  align?:  "start" | "center" | "end";
  size?:   "auto" | "sm" | "md" | "lg" | "fill";       // per-format pixel tiers, owned by the template
  order?:  number;                                      // integer; intra-region sort
};
```

- **regions** (closed — a new one needs a PR): `header` (the eyebrow row), `lead` (the
  main column: title/note + code), `trailing` (the second seat in the row band — the
  panel, at 16:9; stacks below `lead` in the vertical/square formats), `footer` (the
  bottom bar: caption/badge).
- **size**: `fill` for code, `md` for a panel, `auto` for text; `sm`/`lg` map to
  template tiers.
- **order**: text components reserve 0–2 (eyebrow 0 in `header`; title 0, caption 1,
  note 2 in `lead`), code uses 10 so it never sorts above the note within `lead`.

**Desugar mapping** (what each legacy field becomes — handy when converting a beat):

| legacy field | condition | → type | region | align | size | order |
|---|---|---|---|---|---|---|
| `eyebrow` | present | `eyebrow` | `header` | center | auto | 0 |
| `headline` | always | `title` | `lead` | center | auto | 0 |
| `caption` | `hero` | `caption` `variant:"subhead"` | `lead` | center | auto | 1 |
| `note` | present | `note` | `lead` | center | auto | 2 |
| `caption` | not `hero` | `caption` `variant:"footer"` | `footer` | center | auto | 1 |
| `badge` | present | `badge` | `footer` | center | auto | 0 |
| `code` | present | `code` | `lead` | start | `fill` | 10 |
| `panel` | present | `panel` | `trailing` | start | `md` | 0 |

`hero`/`layout` stay beat-level routing flags (they pick the centered hero layout +
suppress the footer); they are not components. The code↔panel reveal timing is computed
by the renderer per beat — you don't set it (but you can override it; see *Sequencing*).

### Layout containers (v2)

`components` is a **tree**: alongside the leaf types above, four containers carry
`children: Node[]` and arrange them *inside* a region. The top level stays
region-routed (that's the on-brand skeleton); containers compose within a region.

```ts
| { type: "row";   placement; children: Node[]; gap?; align?; justify?; stagger? }  // side-by-side at 16:9
| { type: "col";   placement; children: Node[]; gap?; align?; justify?; stagger? }  // stacked vertically
| { type: "grid";  placement; children: Node[]; cols: number; gap?; … }              // N-up tiles
| { type: "group"; placement; children: Node[] }                                     // style/motion scope, no layout
```

**Reflow** (renderer-side, no measurement): a `row` becomes a column below 16:9; a
`grid` collapses to one column below 16:9; a `col` is always vertical. So "code over
result" = a `col` of `[code, panel]` in `lead` (leave `trailing` empty); it degrades
sanely on 9:16/1:1 for free.

### Per-node style (v2)

Every node takes an optional `style` — a CLOSED, validated set (not arbitrary CSS):

```ts
type NodeStyle = {
  color?: ColorRole;  bg?: ColorRole;   // theme ROLES only (e.g. "gold") — never raw hex, so a theme swap re-colors them
  gap?: number;  padding?: string;       // containers
  track?: number;                        // letter-spacing
  chrome?: "window" | "minimal" | "none"; // code-window chrome
  size?: "auto" | "sm" | "md" | "lg" | "fill";
};
```

Resolution: `style` → template default → theme token. `color` applies to text leaves
(title/eyebrow/caption/note); `bg`/`gap`/`padding` to containers; `chrome` to `code`.

### Sequencing as data (v2)

Give a node an `id`, and another node `placement.revealAfter: <id>` — it reveals after
that node finishes (typing-done for code, entrance-settle otherwise) + a gap. A
container's `stagger: <frames>` offsets each child by `i × stagger`. The legacy
code→panel coupling is just the default: a panel with no `revealAfter` waits for the
band's code automatically (so existing beats are unchanged).

## Panel kinds

Pick the kind that visualizes the *result* of the code. Exact shapes:

**feed** — live rows streaming in.
```ts
{ kind: "feed", title: "index.events", subtitle: "ft_transfer", status: "streaming…",
  rows: [{ badge: "sBTC", label: "SP2J6…WVEF", value: "1,200.00" }] }
```

**data-table** — a queried result set.
```ts
{ kind: "data-table", title: "sbtc · transfers", columns: ["block", "amount", "to"],
  rows: [["951475", "1,200.00", "SP2J6…"], ["951474", "48.50", "SP3K9…"]] }
```

**browser** — a Finder-style file/folder listing (the result of a `list({ prefix, delimiter })`-style call). `sections` group rows (e.g. prefixes vs items); folder rows get a chevron, file rows a right-aligned `meta` (size).
```ts
{ kind: "browser", title: "photos/", meta: "delimiter: /", sections: [
  { label: "prefixes", rows: [{ type: "folder", name: "2024/" }, { type: "folder", name: "raw/" }] },
  { label: "items", rows: [{ type: "file", name: "cover.jpg", meta: "2.1 MB" }] } ] }
```

**stat** — one big number (counts up if numeric like "10,000,000"; shown as-is if not like "live").
```ts
{ kind: "stat", value: "10,000,000", label: "events decoded", sub: "block 0 → chain tip" }
```

**proof** — ed25519 signature as the hero + a drawn ✓ verified.
```ts
{ kind: "proof", eventLine: "ft_transfer · 1,200 sBTC", cursor: "951475:3",
  signature: "3a9f8c217b14…2e9d", keyId: "f3a9…2b1c" }
```

**stream-resume** — a resume cursor + events flowing past it.
```ts
{ kind: "stream-resume", fromCursor: "951475:3",
  rows: [{ cursor: "951475:4", label: "print · swap" }, { cursor: "951476:0", label: "ft_transfer" }] }
```

**fork** — a chain fork; orphan archived, new tip lit. Use states canonical/orphaned/new.
```ts
{ kind: "fork", rewindTo: "951472:0", blocks: [
  { height: 951472, hash: "a3f9", state: "canonical" },
  { height: 951474, hash: "7e2d", state: "orphaned" },
  { height: 951474, hash: "c8a1", state: "new" } ] }
```

**upload-progress** — a progress bar + pause/resume.
```ts
{ kind: "upload-progress", file: "datasets/sbtc.parquet", sizeMB: 210, parts: 14 }
```

**status** — service health rows. state ∈ ok | syncing | error | idle.
```ts
{ kind: "status", title: "status",
  services: [{ name: "api", state: "ok" }, { name: "indexer", state: "syncing", detail: "−2 blocks" }] }
```

**diagram** — a small pipeline; exactly one `api` node (the product surface).
```ts
{ kind: "diagram", note: "decoded once — query forever",
  nodes: [{ id: "node", label: "Stacks node", type: "default" },
          { id: "idx", label: "Indexer", type: "data" },
          { id: "api", label: "Index API", type: "api" }],
  edges: [{ from: "node", to: "idx", label: "events" }, { from: "idx", to: "api", label: "decoded" }] }
```

Adding a brand-new panel kind is a code change (a component in
`src/components/panels/` + the registry + the schema), not something to author in
a beats file. If a request needs a visual none of these cover, say so and design
it with `/frontend-design` first (see the playground at `mocks/playground.html`).

## Motion vocabulary

You rarely set motion — the engine applies a sensible default per element. Override
only with a reason, using one of these names:

- enter: `rise settle bloom type stagger draw count`
- exit: `sink dissolve lift cut`

```ts
headlineMotion: { enter: "rise", delay: 8 }
code: { ..., motion: { enter: "settle", delay: 12 } }
panel: { ..., motion: { enter: "settle" } }
```

The full content→motion taxonomy (which element speaks which transition) is
documented in the engine package's `MOTION.md`. Easing is fixed by the brand:
ease-out only, `smooth` for entrances, `snappy` only for small state pops.

## Formats

| format | dimensions | use |
|--------|-----------|-----|
| `16x9` | 1920×1080 | site hero, YouTube, the default |
| `1x1`  | 1080×1080 | X / LinkedIn in-feed |
| `9x16` | 1080×1920 | Stories / Shorts / Reels |

The same beats render in all three; 16:9 lays code+panel side-by-side, the others
stack them. Set `format` in the file or override with `--format` at render time.

## Backgrounds

**Default: omit `background`** on every beat. You then get a procedural,
theme-colored backdrop (soft gradient arcs) — no asset, no API key, and it stays
consistent across the video. This is the right choice for almost everything.

Use one background per video for continuity. The options, set per beat:

```jsonc
// (default) omit `background` entirely → procedural theme-colored shapes
{ "shapes": true }                                   // the same, explicit
{ "gradient": ["#312e81", "#0b1120"], "angle": 155 }  // AI-free gradient
{ "solid": "#0b1120" }                                // AI-free solid
{ "src": "backgrounds/pennybacker.png" }              // optional painterly pack
```

The **painterly pack** (19th-century landscape paintings) is optional and ships with
the engine: `backgrounds/pennybacker.png`, `congress.png`, `mount-bonnell.png`,
`barton-springs.png`, plus `capitol`, `ut-tower`, `enchanted-rock`, `hamilton-pool`.
Generating new ones needs `cadence art …` and an `OPENAI_API_KEY` (the only part of
the toolchain that calls an API). The procedural default is preferred for an
on-brand, key-free look.

## Sequencing model

Within a code+panel beat the engine runs things one at a time, like a demo:

```
beat starts → code window types out (panel absent)
            → typing finishes (caret disappears)
            → short pause ("running…")
            → output panel settles in and runs its reveal
```

This is automatic — `ChangelogScene` computes when typing ends and delays the
panel. That's why code+panel beats need ~235 frames: the panel's clock doesn't
start until the code is done. Tuning knobs live in code, not in beats:
`CHARS_PER_FRAME` (typing speed, `CodeWindow.tsx`) and `OUTPUT_GAP` (the pause,
`ChangelogScene.tsx`).

## Title typography

Handled by the engine — you only supply the strings. For reference, it matches the
cadence look: a gold (`#c08a2e`) uppercase tracked **eyebrow** (Fira Code),
a heavy tight white **headline** (Sora 700, −0.025em) with a soft shadow, and an
optional gold **version pill** + dotted **caption** on closers. Keep eyebrows
lowercase in the data; the engine uppercases them.
