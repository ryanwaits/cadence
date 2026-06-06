# Branding, Themes, Backgrounds & Formats

Cadence renders a video from its **theme** — colors and fonts come from there, not
from a baked-in brand. That's the anti-"AI look" principle: most AI video reaches
for the same neon-on-black template, so every clip looks the same. Cadence refuses
a baked-in brand. You pick a built-in theme, or derive one from your own URL, color,
or screenshot, and the whole video takes on *your* palette.

This guide covers the four style knobs you control: **themes**, **brand extraction**,
**backgrounds**, and **formats** — plus how to re-skin a finished video without
re-authoring it.

> New here? Start with **[Installation & Quickstart](install.md)**. Throughout, `cadence …`
> means either the global binary (`npm i -g @waits/cadence`) or `npx @waits/cadence …`
> (no install). Inside the engine repo, use `bun run cli …`. Every render runs locally
> and free — the only part of the toolchain that calls an external API is the optional
> painterly background pack, flagged clearly below.

---

## 1. Themes

A theme is a complete look: a single pointing **accent** color, ink/paper neutrals,
a derived code-syntax palette, a procedural backdrop tint, and a font trio
(display / body / mono). Apply one with `--theme <name>` on any `create` / `render` /
`redesign`:

```bash
cadence create <beats> --theme cobalt
```

List them any time:

```bash
cadence themes
```

### The 18 built-ins

Two are hand-authored (`default`, `slate`); the other 16 are each minted from one
accent color with matching fonts. Exact names (from the `THEMES` registry):

| theme | accent | character |
|------------|-----------|-----------------------------|
| `default` | indigo | the neutral house theme |
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

Pick a built-in when you don't need an exact brand match — it's the fastest way to
make a video that doesn't look generic. For an exact match, derive your own.

---

## 2. Brand from a URL, a color, or a screenshot

`cadence study` turns one accent into a full theme. Give it a hex directly, or a URL
to guess one from, and it writes `themes/<name>.json` (a complete `ThemeConfig`) plus
a human-readable `themes/<name>.design.md` companion.

### Flags

| flag | does |
|---------------------|--------------------------------------------------------|
| `--from-url <url>` | fetch the page, read its `theme-color` meta (or the most common saturated hex) as the accent |
| `--accent <hex>` | use this accent directly (e.g. `--accent "#10b981"`) |
| `--ink <hex>` | override the text/neutral color |
| `--paper <hex>` | override the page background |
| `--gold <hex>` | override the version/NEW marker color |
| `--name <name>` | theme name + output filename (default `brand`) |
| `--out <path>` | output path (default `themes/<name>.json`) |

One of `--accent` or `--from-url` is required. The accent drives everything: links,
badges, the single pointing color, a matching code-highlight palette, and the
procedural backdrop tint. Give one color, get a complete theme.

### Worked example

```bash
# 1. Extract a theme from a brand URL
cadence study --from-url https://acme.dev --name acme
# → writes themes/acme.json  +  themes/acme.design.md
#   prints: extracted accent #… from https://acme.dev

# 2. Render any beats file with it
cadence create my.beats.json --theme-file themes/acme.json
```

Or skip the URL and pass the color straight in:

```bash
cadence study --accent "#10b981" --paper "#f6f7f9" --name acme
cadence create my.beats.json --theme-file themes/acme.json --format 9x16
```

The generated `acme.design.md` lists the resolved palette (accent, ink, paper,
marker, gold, status colors) and fonts — a portable summary to drop into a brand doc.

### From a screenshot

`cadence study` extracts from a hex or URL only. To build a theme from an **image**
(a wallpaper, a brand shot, a UI screenshot), hand the picture to your agent (the
cadence skill). It reads the dominant palette and writes a `themes/<name>.json` that
matches the `ThemeConfig` shape — the dominant brand color becomes the accent
(`signalBlue`), copying a built-in theme JSON as the template. Then render the same way:

```bash
cadence create my.beats.json --theme-file themes/acme.json
```

---

## 3. Backgrounds

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
| `image:filename` | a static image from `backgrounds/` (the painterly pack lives here) |

```bash
cadence create my.beats.json --background "gradient:#312e81,#0b1120"
cadence redesign my.beats.json --background shapes      # back to the procedural default
```

`gradient` and `image` get a slow Ken Burns drift; `solid` and `shapes` stay static.

When authoring beats by hand, the same options appear as the per-beat `background`
object: `shapes`, `gradient: [from, to]`, `solid`, or `src` (an image), with an
optional `angle` and `treatment` (`kenburns` | `static`). Omit the object for the
default.

### Optional: the painterly landscape pack

Instead of stock gradients, an optional pack renders 19th-century-style landscape
paintings ("Hill Country Sublime") as backgrounds. **This is the only part of the
toolchain that calls an external API** — it needs `OPENAI_API_KEY`.

```bash
cadence art --landmark pennybacker --level heightened   # needs OPENAI_API_KEY
cadence art --all --level heightened --format 16x9      # every landmark
```

- **`--landmark`** — one of: `pennybacker`, `utTower`, `capitol`, `congress`,
  `mountBonnell`, `enchantedRock`, `hamiltonPool`, `bartonSprings` (default
  `pennybacker`).
- **`--level`** — the fantasy dial: `grounded`, `heightened` (default), or `mythic`.
- **`--format`** / **`--quality`** — image size / render quality.

Generated images land in `public/backgrounds/_candidates/`; move a winner into
`public/backgrounds/` and reference it with `image:<file>`. Full details, the art
system, and how to pick winners: **[ART-DIRECTION.md](../../ART-DIRECTION.md)**.

---

## 4. Formats

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
puts code left and output right; vertical formats restack.

---

## 5. Re-skin without re-authoring

Already have a beats file you like? `cadence redesign` re-skins it — new theme,
background, and motion fingerprint — while preserving all content (headlines,
eyebrows, code, panels). It writes a new beats JSON to `out/` and renders it.

```bash
cadence redesign my.beats.json --theme slate --background "gradient:#312e81,#0b1120"
cadence redesign my.beats.json --enter rise --exit dissolve --background shapes
```

| flag | does |
|---------------------|------------------------------------------------|
| `--theme <name>` | swap to a built-in theme |
| `--theme-file <path>` | swap to a derived/extracted theme |
| `--background <dsl>` | swap the background (same DSL as section 3) |
| `--enter <preset>` | set the headline enter transition |
| `--exit <preset>` | set the headline exit transition |
| `--format` / `--frame` | re-format / preview a single still |

The `--enter` / `--exit` values come from the motion lexicon:

- **enter:** `rise`, `settle`, `bloom`, `type`, `stagger`, `draw`, `count`
- **exit:** `sink`, `dissolve`, `lift`, `cut`

(See **[MOTION.md](../../MOTION.md)** for what each preset does — the engine stays
ease-out only, no bounce, so every video moves the same considered way.)

---

## Where this fits

- Colors and fonts always come from the **theme** — `--theme <name>` or
  `--theme-file <path>` — never a hardcoded brand.
- The **default backdrop** is procedural and key-free; the painterly pack is opt-in
  and is the only API-key step.
- One theme + one background + one format = a coherent, on-brand video that doesn't
  read as AI-generated.

See also: **[Installation & Quickstart](install.md)**, **[recipes](../recipes.md)**
(the brand-from-URL recipe), and the **[gallery](../gallery.md)** for the same engine
across themes, formats, and arcs.
