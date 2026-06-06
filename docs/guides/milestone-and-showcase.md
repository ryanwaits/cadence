# Milestone & Feature-Showcase Videos

Two close cousins, one engine. A **milestone** ("1M downloads", "now stable",
"v1.0 is out") puts one big number on screen. A **feature showcase** ("show off
the new `<feature>`") puts the *result* of the change on screen — a query result,
a signed receipt, a resumable cursor. Both render locally and free, no key.

This guide covers both, plus the **panel picker** — the single decision that makes
a showcase land. For install/themes see the [README](../../README.md); for the
full beat vocabulary see [recipes](../recipes.md) and [gallery](../gallery.md).

> CLI shorthand: `cadence …` assumes the global install (`npm i -g @waits/cadence`).
> No install? Use `npx @waits/cadence …`. Inside this repo, use `bun run cli …`.

---

## 1. Milestone — one big number

A milestone video is an arc: **opener → a `stat` panel → install closer**. The
`stat` panel is a single hero number that counts up when it's numeric
("10,000,000" animates; "live" reveals as-is).

The no-LLM path is the `milestone` template, driven straight from a release:

```bash
cadence create --release owner/name \
  --template milestone \
  --stat-value "1,000,000" \
  --stat-label "downloads" \
  --stat-sub "since v1.0" \
  --install "npm i your-pkg"
```

- `--template milestone` — opener → `stat` → install closer.
- `--stat-value` — the hero number. Commas/spaces are stripped for the count-up;
  a purely numeric value animates, anything else (e.g. `"now stable"`) reveals as text.
- `--stat-label` — the line under the number ("downloads", "events decoded").
- `--stat-sub` — an optional accent sub-line ("since v1.0", "block 0 → chain tip").

If you omit the `--stat-*` flags, the template falls back to an honest default
drawn from the release manifest (the feature count this version) — but for a real
milestone you almost always want to supply the number yourself.

**Preview, then render:**

```bash
# preview the stat beat (the count-up settles by ~frame 60)
cadence create --release owner/name --template milestone \
  --stat-value "1,000,000" --stat-label "downloads" --frame 60

# full 16:9 MP4 → out/
cadence create --release owner/name --template milestone \
  --stat-value "1,000,000" --stat-label "downloads" --stat-sub "since v1.0" \
  --install "npm i your-pkg"

# vertical for a reel
cadence create --release owner/name --template milestone \
  --stat-value "1,000,000" --stat-label "downloads" --format 9x16
```

> The repo-driven path (`--release`) passes through `--format`, `--theme`, and
> `--frame`. To brand with a derived theme file, author beats by hand (below) and
> render with `--theme-file`, or use a built-in named `--theme`.

### Hand-authored milestone

When you want exact control — your own headline, a specific background, more than
one beat between opener and closer — author a `stat` beat directly. The panel fields:

```jsonc
{
  "kind": "stat",
  "value": "10,000,000",   // hero number; numeric → counts up
  "label": "events decoded",
  "sub": "block 0 → chain tip"  // optional accent line
}
```

A complete milestone-style beat (see `src/content/mainnet-launch.beats.ts` for a
full launch arc that uses it):

```jsonc
{
  "id": "scale",
  "durationInFrames": 170,
  "headline": "Indexed from genesis.",
  "panel": { "kind": "stat", "value": "10,000,000", "label": "events decoded", "sub": "block 0 → chain tip" }
}
```

Render and preview it like any beats file:

```bash
cadence create milestone.beats.json --frame 60      # still
cadence create milestone.beats.json --theme cobalt  # full MP4
```

---

## 2. Feature showcase — show the result, not the prose

A showcase beat is the engine's signature shape: **`headline` + `code` + `panel`**.
The engine types the code on the left, then runs the panel on the right —
sequencing is automatic, you just supply both. The headline is short and
declarative ("Query the pending set.", "Resume from any cursor.").

The craft is in the **panel**: pick the one that visualizes the *result* the new
feature produces. A `swap` returns rows → `data-table`. A signed event → `proof`.
A resumable iterator → `stream-resume`. This is the whole point of a showcase, so
choose deliberately with the picker below.

### Worked example — a query feature with `data-table`

The new feature returns rows, so the panel that shows the result is `data-table`.
(Adapted from `src/content/sdk-6.5-mempool.beats.ts`.)

```jsonc
{
  "id": "pending",
  "durationInFrames": 235,
  "eyebrow": "index.mempool",
  "headline": "Query the pending set.",
  "code": {
    "filename": "mempool.ts",
    "lang": "ts",
    "source": "import { SecondLayer } from \"@secondlayer/sdk\";\n\nconst sl = new SecondLayer();\n\nconst { mempool } = await sl.index.mempool.list({\n  contractId: \"SP….amm-pool-v2\",\n  limit: 50,\n});"
  },
  "panel": {
    "kind": "data-table",
    "title": "index.mempool",
    "columns": ["tx_id", "function", "sender"],
    "rows": [
      ["0x8f2a…", "swap-x-for-y", "SP2J6…WVEF"],
      ["0x3c91…", "add-liquidity", "SP3K9…X1A0"],
      ["0x7e0d…", "swap-x-for-y", "SPF8M…7QQC"]
    ]
  }
}
```

The code must be **honest** — real symbols from the package's types/examples/README,
exact casing (`SecondLayer`, not `Secondlayer`). Fabricated API is the one thing
that breaks a showcase's credibility.

**Preview, then render** (a showcase beat needs more frames to land the typing +
panel; preview late in the beat):

```bash
cadence create showcase.beats.json --frame 180        # still, code typed + panel run
cadence create showcase.beats.json                    # full 16:9 MP4 → out/
cadence create showcase.beats.json --format 9x16      # vertical reel
cadence audit showcase.beats.json                     # pacing / legibility check
```

`src/content/streams-launch.beats.ts` is a full multi-panel showcase (a signed
`proof`, a `stream-resume` cursor, a `fork`/reorg) — a good reference for stringing
several feature beats together.

---

## 3. Panel picker reference

Pick `panel.kind` by **what the change produces**. Nine kinds, with the field
shape each one expects (from `src/schema/beats.ts`).

| kind | shows | use for |
|------|-------|---------|
| `feed` | rows streaming in | live events / logs / a feed |
| `data-table` | columns + rows | a query/list result, parsed output |
| `status` | health/check rows (ok/syncing/error/idle) | CLI check output, service/test status |
| `stat` | one big number | milestones, counts |
| `proof` | a signature + a drawn ✓ | signed / verifiable output |
| `stream-resume` | a resume cursor + rows | resumable streams / iterators |
| `fork` | a fork (orphan archived, new tip) | reorg / finality / branch handling |
| `upload-progress` | a progress bar + pause/resume | long-running ops, bulk export |
| `diagram` | a small pipeline (one filled node) | architecture, "how it works" |

### Field shapes

```jsonc
// feed — rows animate in under a live status
{ "kind": "feed", "title": "index.events", "subtitle": "ft_transfer", "status": "live…",
  "rows": [ { "badge": "sBTC", "label": "SP2J6…WVEF", "value": "1,200.00" } ] }

// data-table — a result grid
{ "kind": "data-table", "title": "index.mempool",
  "columns": ["tx_id", "function", "sender"],
  "rows": [ ["0x8f2a…", "swap-x-for-y", "SP2J6…WVEF"] ] }

// status — health rows; state ∈ ok | syncing | error | idle (drives the dot color)
{ "kind": "status", "title": "status",
  "services": [ { "name": "indexer", "state": "ok", "detail": "synced" } ] }

// stat — the milestone hero (numeric values count up)
{ "kind": "stat", "value": "1,000,000", "label": "downloads", "sub": "since v1.0" }

// proof — an ed25519 receipt; the signature is the hero, resolves with a drawn check
{ "kind": "proof", "eventLine": "stx_transfer · 1,200 STX", "cursor": "h:148201",
  "signature": "9f2c4a…", "keyId": "k_streams_01" }

// stream-resume — pick up from a cursor
{ "kind": "stream-resume", "fromCursor": "h:148044",
  "rows": [ { "cursor": "h:148045", "label": "ft_transfer" } ] }

// fork — a reorg; block state ∈ canonical | orphaned | new
{ "kind": "fork", "rewindTo": "h:148044",
  "blocks": [ { "height": 148045, "hash": "0x3c91…", "state": "orphaned" } ] }

// upload-progress — a long-running op with a progress bar
{ "kind": "upload-progress", "file": "events-2024.parquet", "sizeMB": 482, "parts": 12 }

// diagram — a small pipeline; node type ∈ default | data | api (drives node fill)
{ "kind": "diagram",
  "nodes": [ { "id": "src", "label": "chain", "type": "data" }, { "id": "api", "label": "API", "type": "api" } ],
  "edges": [ { "from": "src", "to": "api", "label": "decode" } ],
  "note": "block 0 → tip" }
```

Notes:
- `feed.title` defaults to `"feed"`, `feed.status` to `"live…"`, `status.title` to
  `"status"` — omit them to take the default.
- Every panel also accepts an optional `motion` object; the defaults are tuned, so
  usually leave it off.

---

## Pick the right tool

- **Milestone** ("we hit N", "now stable", "v1.0") → `stat` panel, via the
  `milestone` template + `--stat-*` flags, or a hand-authored `stat` beat.
- **Showcase** ("look what the new feature does") → `headline` + `code` + a panel
  chosen from the picker to **show the result** the feature produces.

Both: preview a still with `--frame` first, then render the full MP4. For brand
colors, see the theming notes in the [README](../../README.md) and the
[gallery](../gallery.md).
