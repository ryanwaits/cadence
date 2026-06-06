# Custom Backgrounds

cadence's default backdrop is procedural (theme-colored, no key). When you want a
*painted* backdrop, `cadence art` generates one from a freeform prompt. It's the
only part of cadence that calls an external API — it needs `OPENAI_API_KEY`.

Generated art is **project-local**: run `cadence art` from a repo with a
`.cadence/` dir and images land in `<project>/.cadence/backgrounds/` — never in
the cadence engine. (Without a `.cadence/`, it falls back to the engine's own
`public/backgrounds/`.)

## Generate from a prompt

```bash
cadence art --prompt "misty redwood coastline at dawn, layered fog" --name redwood
```

- `--name <slug>` (required with `--prompt`) — the filename + manifest label.
- `--format 16x9|1x1|9x16` (default `16x9`) · `--level grounded|heightened|mythic`
  (default `heightened`) · `--quality low|medium|high` (default `medium`).

The image writes to `<project>/.cadence/backgrounds/_candidates/`. Generate a few,
review, then promote the keeper:

```bash
cadence art --promote redwood        # _candidates/ → backgrounds/
```

## Use it in a video

Reference a promoted background by path in a beat — cadence stages a merged public
dir at render so both your art and any built-in assets resolve:

```json
{ "headline": "Stream every event.", "background": { "src": "backgrounds/redwood-heightened-16x9.png" } }
```

Then `cadence storyboard <beats>` / `cadence create <beats>` as usual.

## Match your brand

`--brand` tints the art toward your project's `.cadence/theme.json` palette (its
accent + paper tone), so backdrops sit in the same color family as the video:

```bash
cadence art --prompt "a calm braided river delta at dawn" --name flow --brand
```

It appends a last, explicit palette nudge (so it wins over the base style). For
full color control, set `style` in a `--pack`/`--style-file`.

## Reusable subject packs

A pack is a JSON of named subjects (plus optional `style`/`negatives`):

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

`--style-file <txt>` overrides the style for a one-off. The bundled "Hill Country
Sublime" landscape pack is the default when `--pack` is omitted
(`cadence art --all`); see **[ART-DIRECTION.md](../../ART-DIRECTION.md)**.

## Cost

`gpt-image-1` is billed per image. A batch (`--all` / a multi-subject pack) prints
an estimate and requires `--yes` to proceed; single images generate directly.
Default `--quality` is `medium` — bump to `high` for finals.

See also **[Branding, Themes & Formats](branding-and-formats.md)** for theming the
rest of the video (colors, fonts, code styling).
