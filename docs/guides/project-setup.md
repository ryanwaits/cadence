# Per-Project Setup (`.cadence/`)

A repo can capture its own cadence setup under a single `<project>/.cadence/`
directory — its brand, its generated art, its renders — so the tool **just
works** against that project. Run cadence from the repo (or point it at a beats
file inside it) and it discovers `.cadence/theme.json`, paints with the project's
art, and writes outputs to `.cadence/out` — **no flags**. The cadence engine
itself stays brand-free; everything project-specific lives in `.cadence/`.

Every command assumes the `cadence` binary (`npm i -g @waits/cadence`); `npx
@waits/cadence …` works without installing, and inside the engine repo use `bun
run cli …`.

> This guide is the holistic view. The individual knobs each have a deeper guide:
> **[Branding, Themes & Formats](branding-and-formats.md)** for `study` / themes /
> `art` backgrounds, and **[Iterate & Preview](iterate-and-preview.md)** for the
> storyboard loop.

---

## 1. What lives in `<project>/.cadence/`

```
my-project/
  .cadence/
    theme.json            # the brand — colors + fonts + code styling
    backgrounds/          # promoted painterly art (referenced as image:<file>)
      _candidates/        # the unpromoted generation pile (not rendered)
    out/                  # rendered MP4s + storyboard PNGs
```

### `theme.json` — the durable brand

A complete `ThemeConfig`: the look of every video this repo ships. The fields
that matter most:

| field | what it controls |
|----------------------|-----------------------------------------------------|
| `colors` | accent (`signalBlue`), `ink`/`paper` neutrals, marker, gold, status colors |
| `fonts.display` / `fonts.body` | headline + body type |
| `fonts.mono` | code font (match your docs' code font here) |
| `codeTheme` | syntax-highlight palette (`fg`, `kw`, `str`, `fn`, `comment`, …) |
| `codeBg` | code window background |
| `codeChrome` | `"window"` (floating editor w/ traffic-light dots) or `"minimal"` (chromeless, docs-style) |
| `backdrop` | light `[from, to]` gradient for the procedural default backdrop |

This is the one file worth treating as durable — it's your brand, not a render
artifact.

### `backgrounds/` — generated art (optional)

Painted backdrops from `cadence art` (see §4). Promoted images live directly in
`backgrounds/`; the raw generations sit in `backgrounds/_candidates/` until you
pick a winner. Renders stage a merged public dir, so beats reference promoted art
by name as `image:<file>`. `_candidates/` is excluded from renders.

### `out/` — renders + storyboards

Where MP4s and storyboard PNGs land when cadence is run against the project. Pure
artifacts — regenerable from the beats + theme.

### Tracking decision

`.cadence/` is often gitignored, but you usually want the **brand** to survive:

```gitignore
# .cadence/ is project-local, but keep the durable brand
.cadence/out/
.cadence/backgrounds/_candidates/
!.cadence/theme.json
```

Track `theme.json` (and the promoted `backgrounds/` you reuse). Ignore `out/`
(renders) and `_candidates/` (the generation pile). Then a teammate who clones the
repo and runs cadence gets the same on-brand video with no setup.

---

## 2. Auto-discovery (no flags)

With a `.cadence/` in place you stop passing theming flags. Cadence walks up from
where it's working (the current directory, or the directory of a beats file you
pass) looking for a `.cadence/` (up to 6 levels), and:

- uses `<project>/.cadence/theme.json` as the theme (and logs `· using project
  theme …` so it's never a silent surprise),
- merges `<project>/.cadence/backgrounds/` into the render's assets, and
- writes outputs to `<project>/.cadence/out` instead of `./out`.

```bash
# from inside the repo
cd my-project
cadence storyboard src/changelog.beats.ts
#  · using project theme .../my-project/.cadence/theme.json
#  → .../my-project/.cadence/out/changelog.storyboard.png

# or from anywhere, pointing at a beats file inside the project
cadence create my-project/src/changelog.beats.ts
#  → my-project/.cadence/out/changelog.mp4
```

### Precedence

Flags always win, so you can still override per-run:

- **Theme:** `--theme-file <path>` > `--theme <name>` > `.cadence/theme.json` > the
  built-in `default`.
- **Output dir:** `--out <dir>` > `<project>/.cadence/out` > `./out`.

(A beats file you pass anchors discovery near that file; otherwise discovery
starts from the current directory.)

---

## 3. Setting it up

Derive the brand straight into `.cadence/theme.json` with `cadence study` — give it
an accent hex, or a URL to guess one from. `--out` controls where the theme is
written:

```bash
# from a brand color
cadence study --accent "#10b981" --out my-project/.cadence/theme.json

# or guess the accent from a live site
cadence study --from-url https://acme.dev --out my-project/.cadence/theme.json
```

One color drives the whole theme: links, badges, the single pointing accent, a
matching code-highlight palette, and the procedural backdrop tint.

### Tune the code styling to match your docs

The defaults are good, but if your repo's docs show code a particular way, edit
`theme.json` so the video's code matches:

- **`fonts.mono`** — set the same code font your docs use.
- **`codeTheme`** — nudge the syntax palette toward your docs' highlighter.
- **`codeChrome: "minimal"`** — drop the floating-editor chrome for a flat,
  docs-style snippet (the default `"window"` adds traffic-light dots + a filename
  tab).

```json
{
  "fonts": { "mono": "JetBrains Mono, SFMono-Regular, Menlo, monospace" },
  "codeChrome": "minimal"
}
```

Copy a built-in theme JSON as a template if you want the full shape in front of
you (`cadence themes` lists them; **[Branding, Themes & Formats](branding-and-formats.md)**
covers `study`'s other flags and building a theme from a screenshot).

---

## 4. Generated backgrounds

`cadence art` paints backdrops from a freeform prompt. Run it from a repo with a
`.cadence/` and the images land in `<project>/.cadence/backgrounds/` — never in the
engine. **This is the only part of cadence that calls an external API** — it needs
`OPENAI_API_KEY`.

```bash
cd my-project
cadence art --prompt "misty redwood coastline at dawn, layered fog" --name redwood
#  → .cadence/backgrounds/_candidates/redwood-heightened-16x9.png
```

Generate a few, review the `_candidates/`, then promote the keeper into
`backgrounds/`:

```bash
cadence art --promote redwood
#  ✓ promoted … → .cadence/backgrounds/  (reference as image:<file>)
```

Reference a promoted background in a beat by name. At render, cadence stages a
merged public dir (the engine's built-in assets + your `.cadence/backgrounds/`,
excluding `_candidates/`) and points Remotion at it, so both your art and any
built-in images resolve:

```json
{ "headline": "Stream every event.", "background": { "src": "backgrounds/redwood-heightened-16x9.png" } }
```

`--brand` tints generated art toward `.cadence/theme.json` so backdrops sit in the
same color family. Full details — packs, levels, cost guard — in
**[Branding, Themes & Formats](branding-and-formats.md)**.

---

## 5. End to end

```bash
# 1. set up .cadence/ — derive the brand from your site
cadence study --from-url https://acme.dev --out acme/.cadence/theme.json
#    (then tune acme/.cadence/theme.json: fonts.mono, codeChrome, codeTheme)

# 2. (optional) paint a backdrop and promote it
cd acme
cadence art --prompt "a calm braided river delta at dawn" --name flow --brand
cadence art --promote flow

# 3. write beats — e.g. acme/src/changelog.beats.ts
#    reference the art with  background: { src: "backgrounds/flow-heightened-16x9.png" }

# 4. storyboard the mock — picks up .cadence/theme.json automatically
cadence storyboard src/changelog.beats.ts
#    → acme/.cadence/out/changelog.storyboard.png   (· using project theme …)

# 5. iterate on the sheet (reorder beats, tighten headlines), re-storyboard

# 6. render once it looks right
cadence create src/changelog.beats.ts
#    → acme/.cadence/out/changelog.mp4
```

From here, anyone who clones `acme` and runs cadence against it gets the same
on-brand video — the repo carries its own cadence.

---

## Where this fits

- `.cadence/theme.json` is the **brand**; track it, ignore `out/`.
- Auto-discovery means **no theming flags** once it's in place — flags still
  override per-run.
- The painterly pack is the only API-key step; everything else runs locally.

See also: **[Installation & Quickstart](install.md)**,
**[Branding, Themes & Formats](branding-and-formats.md)**,
**[Branding, Themes & Formats](branding-and-formats.md)**, and
**[Iterate & Preview](iterate-and-preview.md)**.

---

Index entry:

- [Per-Project Setup (.cadence/)](project-setup.md) — let a repo carry its own brand, art, and renders so cadence just works against it, no flags.
