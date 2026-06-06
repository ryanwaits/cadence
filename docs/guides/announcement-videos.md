# Announcement & Launch Videos

The "we're launching X" video. An announcement is an **arc**: an opener title
card, one to three feature beats, and an install/CTA closer. It renders locally
and free, no API key — see [install](install.md) to get the `cadence` binary.

## Announcement vs changelog

Same engine, different shape.

- **Changelog** — "what's new in X" — a flat run of feature beats, each with an
  eyebrow like `"new in clarinet 3.18"`. See the
  [changelog guide](changelog-videos.md).
- **Announcement** — "X is here" — a deliberate arc with a beginning (opener),
  a middle (1-3 feature beats), and an end (install closer). Reach for it on a
  launch, a v1.0, a public beta, a new product.

The off-the-shelf path for an announcement is the **`feature-launch`** template:
opener → one title card per top feature → install closer.

## The beat arc

Three beat shapes, in order.

**Opener** — a title card. Headline + eyebrow only, no code, no panel.

```json
{
  "id": "opener",
  "durationInFrames": 150,
  "eyebrow": "announcing",
  "headline": "Secondlayer is live on mainnet."
}
```

**Feature** — the payload. Headline + a real code window + a panel that shows
what the code produces. The engine types the code, then runs the panel — you
just supply both.

```json
{
  "id": "query",
  "durationInFrames": 235,
  "headline": "Query it in three lines.",
  "code": { "filename": "events.ts", "lang": "ts", "source": "const { events } = await sl.index.events({\n  eventType: \"ft_transfer\",\n  limit: 50,\n});" },
  "panel": { "kind": "feed", "title": "index.events", "rows": [
    { "badge": "sBTC", "label": "SP2J6…WVEF", "value": "1,200.00" }
  ] }
}
```

Pick the panel by what the change produces — `feed`, `data-table`, `stat`,
`proof`, `stream-resume`, `fork`, `upload-progress`, `diagram`. The picker table
is in `skills/cadence/SKILL.md`.

**Install / CTA closer** — `layout:"center"`, a `bash` install block, a version
`badge`, and a `caption` tagline.

```json
{
  "id": "cta",
  "durationInFrames": 160,
  "headline": "Start building.",
  "layout": "center",
  "code": { "filename": "terminal", "lang": "bash", "source": "bun add @secondlayer/sdk" },
  "badge": "v6.3",
  "caption": "index · streams · datasets · subgraphs · subscriptions"
}
```

A milestone variant swaps a feature beat for a single `stat` panel (one big
number that counts up) — good for "10M events" or "now stable".

## Driving it

The template path reads a release, lays out the arc, and renders — no LLM:

```bash
cadence create --release owner/name --template feature-launch --install "npm i your-pkg"
```

- `--install "…"` supplies the closer's install command; without it the closer
  is dropped. Use the *real* command (`npm i …`, `brew install …`, `cargo add …`).
- `--headline "…"` overrides the opener headline (default: `"<version> is out."`).
- `--template feature-launch` selects the launch arc (vs `changelog-reel` or
  `milestone`).

The template emits feature beats from the real release titles only — no
fabricated code. To add honest code + panels per feature, hand-author the beats
file (or ask the agent), as in the worked example below.

**Choosing a format for the channel:** `16x9` for a site or README, `1x1` for a
feed, `9x16` for a reel or shorts. Set it with `--format`. See
[branding & formats](branding-and-formats.md) for the full matrix and theming.

## The honesty rule still applies

Feature beats show **real** code only — never an invented API. Climb the honesty
ladder (types → examples → README → install-only) and stop at the first rung
with real symbols; if you can't verify a call, fall back to the install command
and prose instead of a fabricated snippet. The full ladder is in the
[changelog guide](changelog-videos.md). It's the product's whole credibility.

## Worked example: a launch, end to end

A four-beat arc — opener, two feature beats, install closer. Author it as
`launch.beats.json`:

```json
{
  "format": "16x9",
  "beats": [
    {
      "id": "opener",
      "durationInFrames": 150,
      "eyebrow": "announcing",
      "headline": "Secondlayer is live on mainnet."
    },
    {
      "id": "query",
      "durationInFrames": 235,
      "headline": "Query it in three lines.",
      "code": { "filename": "events.ts", "lang": "ts", "source": "const { events } = await sl.index.events({\n  eventType: \"ft_transfer\",\n  limit: 50,\n});" },
      "panel": { "kind": "feed", "title": "index.events", "subtitle": "ft_transfer", "rows": [
        { "badge": "sBTC", "label": "SP2J6…WVEF", "value": "1,200.00" },
        { "badge": "USDA", "label": "SP3K9…X1A0", "value": "48.50" },
        { "badge": "ALEX", "label": "SPF8M…7QQC", "value": "9,000.00" }
      ] }
    },
    {
      "id": "verify",
      "durationInFrames": 220,
      "headline": "Every row, signed.",
      "code": { "filename": "verify.ts", "lang": "ts", "source": "const ok = await sl.verify(events[0]);" },
      "panel": { "kind": "proof", "title": "verify" }
    },
    {
      "id": "cta",
      "durationInFrames": 160,
      "headline": "Start building.",
      "layout": "center",
      "code": { "filename": "terminal", "lang": "bash", "source": "bun add @secondlayer/sdk" },
      "badge": "v6.3",
      "caption": "index · streams · datasets · subgraphs · subscriptions"
    }
  ]
}
```

Preview a still first (fast), then render the full MP4:

```bash
cadence create launch.beats.json --frame 150    # one still, ~5s
cadence create launch.beats.json                 # full 16x9 MP4 → out/
```

A vertical cut for social — same file, one flag:

```bash
cadence create launch.beats.json --format 9x16   # reel / shorts
```

In-repo, swap `cadence` for `bun run cli`; with no global install, use
`npx @waits/cadence`.

## Tips

- **Short, declarative headlines.** "Query it in three lines." not "You can now
  query events with just three lines of code."
- **Lowercase eyebrow.** `"announcing"`, `"new in secondlayer"` — the engine
  renders it as a gold uppercase label.
- **One background for continuity.** Pick a single backdrop (or omit `background`
  on every beat for the procedural default) so the arc feels like one piece. See
  [branding & formats](branding-and-formats.md).
