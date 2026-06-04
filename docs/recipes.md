# Recipes

Worked examples. Each maps a real request to a command and the beats file that
produces it. The example beats files live in the engine package under
`src/content/`; the [gallery](gallery.md) shows rendered frames.

Everything renders locally and free — `cadence create … --frame <n>` gives a fast
still to check before the full MP4.

---

## 1. Changelog from a release

The deterministic, no-LLM path: read a GitHub release, lay out the features, render.

```bash
cadence create --release owner/name --install "npm i your-pkg"
```

For an agent-written, honest-code version (real snippets from the repo), ask your
agent — see `src/content/index-decoded.beats.ts` for the shape (opener → feature
beats → install closer).

## 2. Launch announcement

An arc: title card → a headline stat → a feature → install closer.

```bash
cadence create --release owner/name --template feature-launch --install "npm i your-pkg"
```

Hand-authored example: `src/content/mainnet-launch.beats.ts`
(*"X is live" → 1M number → query-it-in-3-lines → start building*).

## 3. Feature showcase with custom panels

Pick the panel that visualizes each result — `proof`, `stream-resume`, `fork`, etc.

```bash
cadence create src/content/streams-launch.beats.ts            # 16:9
cadence create src/content/streams-launch.beats.ts --format 9x16
```

`streams-launch.beats.ts` showcases the signature panels (a signed `proof`, a
`stream-resume` cursor, a `fork`/reorg). Choose panels with the picker in the skill.

## 4. Brand it — from a URL or a screenshot

```bash
cadence study --from-url https://acme.dev --name acme     # → themes/acme.json (+ design.md)
cadence create <beats> --theme-file themes/acme.json
```

From a **screenshot**: hand the image to your agent — it reads the palette and writes
a `themes/<name>.json`. Or pick a built-in: `cadence create <beats> --theme cobalt`
(`cadence themes` to list all 18).

## 5. The procedural default (no asset, no API key)

Omit `background` on every beat (or set `"shapes": true`) for a soft, theme-colored
backdrop — the default, and the most on-brand key-free look.

```bash
cadence create <beats> --theme sunset            # backdrop takes the theme's accent
cadence redesign <beats> --background shapes      # re-skin an existing file onto it
```

`src/content/gradient-demo.beats.ts` is the AI-free reference (gradient variant).

## 6. Ship on release (CI)

Render a video automatically on every GitHub release — free, on your own runner.

```yaml
# .github/workflows/release-video.yml
- uses: ryanwaits/cadence@v1
  with:
    install: "npm i your-pkg"
    format: "16x9"
```

Full setup + the working example workflow: [github-action.md](github-action.md).

---

## Check your work

```bash
cadence audit <beats.json>     # pacing, headline length, motion monotony, missing closer
cadence create <beats> --frame 150   # fast still before the full render
```
