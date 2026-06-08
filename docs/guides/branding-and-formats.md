# Branding, Themes & Formats

Cadence renders a video from its **theme** — colors and fonts come from there, not
from a baked-in brand. That's the anti-"AI look" principle: most AI video reaches
for the same neon-on-black template, so every clip looks the same. Cadence refuses
a baked-in brand. You point it at *your* color, URL, or docs, and the whole video
takes on your palette — down to the code window.

The preferred way to brand is a **project-local theme**: a `<project>/.cadence/theme.json`
that cadence **auto-discovers** when run against the project — no flags. This guide
covers that, plus the built-in themes, brand extraction, code styling that matches
your docs, backgrounds, formats, and re-skinning a finished video.

> New here? Start with **[Installation & Quickstart](install.md)**. Throughout, `cadence …`
> means either the global binary (`npm i -g @waits/cadence`) or `npx @waits/cadence …`
> (no install). Inside the engine repo, use `bun run cli …`. Every render runs locally
> and free — the only part of the toolchain that calls an external API is the optional
> painterly background generator, flagged clearly below.

---

## 1. Brand a project: `.cadence/theme.json`

A repo carries its brand in `<project>/.cadence/theme.json` — a complete `ThemeConfig`.
When you run cadence against that project (or point it at a beats file inside it),
cadence walks up from where it's working, finds `.cadence/`, and uses that theme
**automatically** — logging `· using project theme …` so it's never a silent surprise.
No `--theme-file` needed.

Scaffold one with `cadence study`, writing straight into the project:

```bash
# from a brand color
cadence study --accent "#10b981" --out my-project/.cadence/theme.json

# or guess the accent from a live site
cadence study --from-url https://acme.dev --out my-project/.cadence/theme.json
```

Then hand-tune the JSON (colors, fonts, code styling — §3) and storyboard to check
it:

```bash
cd my-project
cadence storyboard src/changelog.beats.json
#  · using project theme .../my-project/.cadence/theme.json
```

### Theme precedence

Flags always win, so you can override per-run:

```
--theme-file <path>  >  --theme <name>  >  .cadence/theme.json  >  template's bound theme  >  default
```

`--theme-file <path>` points at any `ThemeConfig` JSON; `--theme <name>` selects a
built-in (§2). Both work on `create` / `redesign` / `storyboard`. Theme is **not** a
beats-file field — it's resolved at render time. (Templates — the styling layer
selected with `--template`, separate from the structural `kind` you pass to
`cadence new <kind>` — each bind a default theme that `--theme` overrides.) With a
`.cadence/theme.json` in place you stop passing either.

> The `.cadence/` directory holds more than the theme — generated art and renders
> live there too. See **[Per-Project Setup](project-setup.md)** for the full layout
> and what to track in git.

---

## 2. Built-in themes

When you don't need an exact brand match, a built-in theme is the fastest way to make
a video that doesn't look generic. Apply one with `--theme <name>`:

```bash
cadence create my.beats.json --theme cobalt
cadence themes                                  # list them
```

A theme is a complete look: a single pointing **accent** color, ink/paper neutrals,
a derived code-syntax palette, a procedural backdrop tint, and a font trio
(display / body / mono).

### The 18 built-ins

Two are hand-authored (`default`, `slate`); the other 16 are each minted from one
accent color with matching fonts. Exact names (from the `THEMES` registry):

| theme | accent | character |
|-------------|-----------|-----------------------------|
| `default` | `#2563eb` | the neutral house theme, Sora / Public Sans |
| `slate` | cool gray | quiet, technical |
| `cobalt` | `#2f5fff` | bright blue, Manrope |
| `emerald` | `#10b981` | green, Space Grotesk |
| `amber` | `#d97706` | warm amber on cream, Sora |
| `crimson` | `#e11d48` | red + sky marker, Archivo |
| `violet` | `#7c3aed` | purple, Plus Jakarta Sans |
| `teal` | `#0d9488` | teal, Outfit |
| `indigo` | `#4338ca` | deep indigo, Inter |
| `sky` | `#0ea5e9` | light blue, Figtree |
| `sunset` | `#f97316` | orange + violet marker, Epilogue |
| `rose` | `#f43f5e` | pink, DM Sans |
| `lime` | `#65a30d` | yellow-green, Space Grotesk |
| `grape` | `#9333ea` | purple + green marker, Manrope |
| `forest` | `#15803d` | serif, Fraunces / Spectral |
| `editorial` | `#9333ea` | serif headline, Playfair Display |
| `graphite` | `#475569` | neutral gray, Geist |
| `mono` | `#111111` | near-black + blue marker, Geist |

For an exact match, derive your own (§4) — ideally straight into `.cadence/theme.json`.

---

## 3. Match your docs' code styling

A theme controls the **code window**, not just headlines. Three fields make the
video's code read the way your project's docs already show it — tune them in
`theme.json`:

| field | what it controls |
|-------------------|--------------------------------------------------------|
| `fonts.mono` | the code font — set the same family your docs use |
| `codeTheme` | the syntax-highlight palette (`fg`, `kw`, `nw`, `str`, `num`, `fn`, `punct`, `comment`) — nudge toward your docs' highlighter |
| `codeBg` | the code window background color |
| `codeChrome` | `"window"` (default) is a floating editor with traffic-light dots + a filename tab; `"minimal"` is **chromeless** — just the code surface, like a docs snippet component |

If your docs render code as a flat, chromeless block, set `codeChrome: "minimal"` and
match `fonts.mono` + `codeTheme` to your highlighter:

```json
{
  "fonts": { "mono": "JetBrains Mono, SFMono-Regular, Menlo, monospace" },
  "codeBg": "#0d1117",
  "codeTheme": { "fg": "#c9d1d9", "kw": "#ff7b72", "str": "#a5d6ff", "fn": "#d2a8ff", "comment": "#8b949e" },
  "codeChrome": "minimal"
}
```

> Per-beat override: a single `code` node can carry `style.chrome` (`window` /
> `minimal` / `none`) to drop the window on just that snippet — see
> [composition.md](composition.md).

Verify the result without rendering a full MP4:

```bash
cadence storyboard src/changelog.beats.json   # one still per beat — see the code window
```

---

## 4. Derive a theme from a URL, a color, or a screenshot

`cadence study` turns one accent into a full theme. Give it a hex directly, or a URL
to guess one from, and it writes a complete `ThemeConfig` JSON plus a human-readable
`*.design.md` companion.

### Flags

| flag | does |
|---------------------|--------------------------------------------------------|
| `--from-url <url>` | fetch the page, read its `theme-color` meta (or the most common saturated hex) as the accent |
| `--accent <hex>` | use this accent directly (e.g. `--accent "#10b981"`) |
| `--ink <hex>` | override the text/neutral color |
| `--paper <hex>` | override the page background |
| `--gold <hex>` | override the version/NEW marker color |
| `--name <name>` | theme name + default output filename (default `brand`) |
| `--out <path>` | output path (default `themes/<name>.json`) |

One of `--accent` or `--from-url` is required. The accent drives everything: links,
badges, the single pointing color, a matching code-highlight palette, and the
procedural backdrop tint. Give one color, get a complete theme.

### Worked example

```bash
# write the theme straight into a project's .cadence/ so it's auto-discovered
cadence study --from-url https://acme.dev --out acme/.cadence/theme.json
#   prints: · extracted accent #… from https://acme.dev

# from then on, no theme flag — cadence finds it
cadence create acme/src/changelog.beats.json
```

Or pass the color straight in, with neutral overrides:

```bash
cadence study --accent "#10b981" --paper "#f6f7f9" --out acme/.cadence/theme.json
```

When you write to the default `themes/<name>.json` location instead, render it with
`--theme-file`:

```bash
cadence study --from-url https://acme.dev --name acme   # → themes/acme.json + themes/acme.design.md
cadence create my.beats.json --theme-file themes/acme.json --format 9x16
```

The generated `*.design.md` lists the resolved palette (accent, ink, paper, marker,
gold, status colors) and fonts — a portable summary to drop into a brand doc.

### From a screenshot

`cadence study` extracts from a hex or URL only. To build a theme from an **image**
(a wallpaper, a brand shot, a UI screenshot), hand the picture to your agent (the
cadence skill). It reads the dominant palette and writes a `ThemeConfig` JSON — the
dominant brand color becomes the accent (`signalBlue`), copying a built-in theme JSON
as the template. Save it to the project's `.cadence/theme.json` (or render with
`--theme-file`).

---

## 5. Backgrounds

Every beat can carry one background. The default — and the most on-brand, key-free
look — is **procedural**: a soft field of theme-colored gradient arcs, no asset and no
API key. You get it by omitting `background` on a beat entirely.

For continuity, use **one background style across a whole video** (or omit it
everywhere for the consistent procedural default).

### The `--background` mini-DSL

`create` and `redesign` accept a single `--background` string in a small DSL:

| value | result |
|---------------------------|------------------------------------------------------|
| `shapes` | procedural, theme-colored gradient arcs (the default look) |
| `gradient:#hex1,#hex2` | a two-stop gradient, e.g. `gradient:#312e81,#0b1120` |
| `solid:#hex` | a flat solid color, e.g. `solid:#0b1120` |
| `image:filename` | a static image staged from `backgrounds/` (generated painterly art lives here) |

```bash
cadence create my.beats.json --background "gradient:#312e81,#0b1120"
cadence redesign my.beats.json --background shapes      # back to the procedural default
```

`gradient` and `image` get a slow Ken Burns drift; `solid` and `shapes` stay static.

When authoring beats by hand, the same options appear as the per-beat `background`
object: `shapes`, `gradient: [from, to]`, `solid`, or `src` (an image path), with an
optional `angle` and `treatment` (`kenburns` | `static`). Omit the object for the
default.

### Generated painterly backdrops — `cadence art`

When you want a *painted* backdrop instead of the procedural default, `cadence art`
generates one from a freeform prompt. **This is the only part of the toolchain that
calls an external API** — it needs `OPENAI_API_KEY` (it calls OpenAI `gpt-image-1`).

Generated art is **project-local**: run `cadence art` from a repo with a `.cadence/`
dir and images land in `<project>/.cadence/backgrounds/` — never in the cadence
engine. (Without a `.cadence/`, it falls back to the engine's own
`public/backgrounds/`.)

**Generate from a prompt:**

```bash
cadence art --prompt "misty redwood coastline at dawn, layered fog" --name redwood
```

- `--name <slug>` (required with `--prompt`) — the filename + manifest label.
- `--format 16x9|1x1|9x16` (default `16x9`) · `--level grounded|heightened|mythic`
  (default `heightened`) · `--quality low|medium|high` (default `medium`).

The image writes to `<project>/.cadence/backgrounds/_candidates/` as
`<slug>-<level>-<format>.png`. Generate a few, review, then **promote** the keeper:

```bash
cadence art --promote redwood        # _candidates/ → backgrounds/
```

**Use it in a video.** Reference a promoted image by path in a beat — cadence stages
a merged public dir at render so both your art and any built-in assets resolve:

```json
{ "headline": "Stream every event.", "background": { "src": "backgrounds/redwood-heightened-16x9.png" } }
```

(With `--background` on the CLI, the same image is `image:redwood-heightened-16x9.png`.)
Then `cadence storyboard <beats>` / `cadence create <beats>` as usual.

**Match your brand.** `--brand` tints the art toward your project's `.cadence/theme.json`
palette (its accent + paper tone), so backdrops sit in the same color family as the
video:

```bash
cadence art --prompt "a calm braided river delta at dawn" --name flow --brand
```

It appends an explicit palette nudge that wins over the base style. For full color
control, set `style` in a `--pack` / `--style-file`.

**Reusable subject packs.** A pack is a JSON of named subjects (plus optional
`style` / `negatives`):

```json
{
  "style": "A clean isometric 3D render, soft studio light, matte pastel palette.",
  "subjects": {
    "pipeline": { "name": "Pipeline", "subject": "an abstract data pipeline of flowing nodes" },
    "ledger":   { "name": "Ledger",   "subject": "a stylized stack of glowing ledger blocks" }
  }
}
```

```bash
cadence art --pack ./brand-art.json --all --yes     # every subject in the pack
cadence art --pack ./brand-art.json --landmark pipeline
```

`--style-file <txt>` overrides the style for a one-off. With no `--pack`, the bundled
"Hill Country Sublime" landscape pack is the default (`cadence art --all`); see
**[ART-DIRECTION.md](../../ART-DIRECTION.md)**.

**Cost.** `gpt-image-1` is billed per image. A batch (`--all` / a multi-subject pack)
prints an estimate and requires `--yes` to proceed; single images generate directly.
Default `--quality` is `medium` — bump to `high` for finals. The default backdrop
stays procedural and key-free; reach for `cadence art` only when you want painted art.

---

## 6. Formats

`--format` sets the aspect ratio and pixel dimensions. Default is `16x9`.

| `--format` | dimensions (px) | use for |
|------------|------------------|----------------------------------|
| `16x9` | 1920 × 1080 | site / landing / embeds (default) |
| `1x1` | 1080 × 1080 | feed / square posts |
| `9x16` | 1080 × 1920 | reels / shorts / vertical |

```bash
cadence create my.beats.json                 # 16:9 (default)
cadence create my.beats.json --format 1x1     # square feed post
cadence create my.beats.json --format 9x16    # vertical reel
```

Format is also settable as `format` at the top of a beats file; the `--format` flag
overrides it. Plan the same content in the format you'll ship — at 16:9 a feature beat
puts code left and output right; vertical formats restack (layout containers reflow
automatically — see [composition.md](composition.md)).

---

## 7. Re-skin without re-authoring

Already have a beats file you like? `cadence redesign` re-skins it — new theme,
background, and motion fingerprint — while preserving all content (headlines,
eyebrows, code, panels). It writes a new beats JSON and renders it.

```bash
cadence redesign my.beats.json --theme slate --background "gradient:#312e81,#0b1120"
cadence redesign my.beats.json --enter rise --exit dissolve --background shapes
```

| flag | does |
|-----------------------|------------------------------------------------|
| `--theme <name>` | swap to a built-in theme |
| `--theme-file <path>` | swap to a derived/extracted theme |
| `--background <dsl>` | swap the background (same DSL as §5) |
| `--enter <preset>` | set the headline enter transition |
| `--exit <preset>` | set the headline exit transition |
| `--format` / `--frame` | re-format / preview a single still |

With no `--theme`/`--theme-file`, redesign honors the same `.cadence/theme.json`
auto-discovery as everything else.

> To restyle the **look** (the styling layer / template) or retarget an existing
> video without re-rendering, see `cadence fork <beats>` — same arc, new
> template/format/opener, as a pure data rewrite.

The `--enter` / `--exit` values come from the motion lexicon:

- **enter:** `rise`, `settle`, `bloom`, `type`, `stagger`, `draw`, `count`
- **exit:** `sink`, `dissolve`, `lift`, `cut`

(See **[MOTION.md](../../MOTION.md)** for what each preset does — the engine stays
ease-out only, no bounce, so every video moves the same considered way.)

---

## Where this fits

- The brand lives in **`<project>/.cadence/theme.json`** — auto-discovered, no flags.
  `--theme-file` > `--theme` > `.cadence/theme.json` > the template's bound theme >
  `default` when you need to override. Theme is resolved at render time, never a
  beats-file field.
- A theme styles the **code window** too — `fonts.mono`, `codeTheme`, `codeBg`, and
  `codeChrome: "minimal"` match a docs-style snippet. Check it with `cadence storyboard`.
- The **default backdrop** is procedural and key-free; `cadence art` (the painterly
  generator) is opt-in and is the only API-key step.
- One theme + one background + one format = a coherent, on-brand video that doesn't
  read as AI-generated.

See also: **[Per-Project Setup](project-setup.md)** (the `.cadence/` overview),
**[Installation & Quickstart](install.md)**, and the **[gallery](../gallery.md)** for
the same engine across themes, formats, and arcs.
