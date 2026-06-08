# Iterate & Preview (the design session)

Rendering a full MP4 takes real time. Don't render to find out a headline is too
long, a beat is out of order, or a theme is wrong — **see the whole video as a
plan + stills first, iterate, then render once.** This is the loop you and your
agent run together before committing to a render.

Every command assumes the `cadence` binary (`npm i -g @waits/cadence`); `npx
@waits/cadence …` works without installing, and inside the engine repo use `bun
run cli …`.

## Storyboard — the mock (start here)

`cadence storyboard <beats>` prints the **plan** and renders a single
**contact-sheet PNG** — one representative still per beat — without rendering an
MP4. It's the cheap artifact to react to.

```bash
cadence storyboard my.beats.json
```

```
storyboard: my.beats.json
  3 beats · 17.7s · 16x9 · theme default

   1  @  0.0s   5.0s  split   —          image     Clarity 6, in preview.
   2  @  5.0s   7.3s  split   status     image     Lint as you check.
   3  @ 12.3s   5.3s  center  —          image     Start building.

  · last beat doesn't look like an install/CTA closer (centered + install command)

rendering 3 stills…
→ out/my.storyboard.png
```

Open `out/my.storyboard.png` to see each beat as a labeled thumbnail (index ·
panel · duration). The plan line shows pacing (start time, duration, layout,
panel, backdrop) and folds in the same advisory checks as `cadence audit`.

Storyboard honors `--theme <name>`, `--theme-file <path>`, and `--format
16x9|1x1|9x16`, so you preview in the exact look you'll ship. (No `--frame` — it
picks each beat's representative frame for you.)

The sheet lands in `<project>/.cadence/out` when you're inside a repo that has a
`.cadence/` dir, otherwise `./out` (override either with `--out <dir>`). If that
project carries a `.cadence/theme.json`, storyboard auto-discovers it and previews
in your brand with no flag — see
**[Per-Project Setup](project-setup.md)**. For custom
backdrops (painted art, gradients, brand images), see
**[Branding, Themes & Formats](branding-and-formats.md)**.

### Straight from a repo

You don't need a beats file first — `--dry-run` takes a repo or release all the
way to a storyboard (no MP4):

```bash
cadence create --release owner/name --install "npm i your-pkg" --dry-run
cadence create my.beats.json --dry-run        # equivalent to: cadence storyboard my.beats.json
```

## The loop

```bash
# 1. scope it from the repo → a storyboard
cadence create --release owner/name --install "npm i your-pkg" --dry-run
#    → writes out/make-<product>.beats.json + out/make-<product>.storyboard.png

# 2. react to the sheet — try a different look without re-authoring
cadence redesign out/make-your-pkg.beats.json --theme cobalt --background gradient:#312e81,#0b1120 --frame 150

# 3. edit the beats by hand (reorder, tighten headlines, swap a panel),
#    then re-storyboard to confirm the whole arc
cadence storyboard out/make-your-pkg.beats.json --theme cobalt

# 4. render the real thing once it looks right
cadence render out/make-your-pkg.beats.json --theme cobalt
```

Once you've locked a look, the [release / CI path](ship-on-release.md) reuses the
same `cadence create` so future releases render in that aesthetic automatically.

## The finer tools

These are the per-detail instruments the loop above leans on:

- **`--frame <n>`** — one PNG still at a specific frame (~5s), for nailing a
  single moment rather than the whole arc. Works on `create`, `render`,
  `redesign`: `cadence render my.beats.json --frame 150`.
- **`cadence redesign <beats>`** — re-skin without touching content:
  `--theme` / `--theme-file`, `--background` (`shapes` · `gradient:#a,#b` ·
  `solid:#hex` · `image:file`), `--enter` / `--exit` motion presets, `--format`.
  See **[Branding, Themes & Formats](branding-and-formats.md)**.
- **`cadence audit <beats>`** — the pacing/legibility checks on their own
  (beat count, durations, headline length, motion rhythm, closer), ranked, no
  auto-fix. Storyboard already includes these; run `audit` when you just want the
  notes.
- **`bun run dev`** (Remotion Studio) — a live timeline with hot reload, for
  developing the engine's components and motion (not authoring a one-off video).

Renders and storyboards land in `<project>/.cadence/out` (or `./out` outside a
project). Everything here runs locally and free — no API key.
