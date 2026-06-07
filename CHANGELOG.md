# @waits/cadence

## 0.9.0

### Minor Changes

- ba813c7: Two-axis system (kind × template) + a composition layer, with full back-compat.

  - **kinds** (structural arc): the old `templates/` is renamed to `kinds/` — `launch` (was `feature-launch`), `changelog` (was `changelog-reel`), `milestone`, plus new `announcement` and `showcase`. Old names keep working as aliases. `cadence kinds` lists them.
  - **templates** (stylistic layer): a new layer that owns component styling, layout geometry, motion personality, default backgrounds, and a bound theme. Three ship: `field-notebook` (the existing look, extracted), `terminal` (dark IDE, binds a new `midnight` dark theme), and `instructional` (light editorial). Components read styling from the active template. `cadence templates` lists them; `--template <style>` selects one.
  - **composition layer**: a beat can be an explicit list of placeable `components` (Title/Eyebrow/Note/Caption/Badge/Code/Panel) with `placement { region, align, size, order }` over a closed region set (header/lead/trailing/footer). Legacy beats desugar into this model and render byte-identically — every existing beats file keeps working unchanged.
  - **CLI**: `cadence new <kind>` (scaffold a durable beats file), `cadence fork` (restyle/retarget), `cadence edit` (deterministic validate/normalize gate), and `cadence kinds`/`cadence templates` listings.

## 0.8.0

### Minor Changes

- 14d125d: Add a beat-level `note` field — a handwritten flourish (theme's `fonts.note`, marker color) rendered under the headline on title/center/hero beats. Enables a logo-lockup closer like `{ layout: "center", headline: "Secondlayer", note: "Streams" }`.

## 0.7.3

### Patch Changes

- 8f64e8f: Align the result panel card's entrance with the code window so both cards animate in on the same frame. They previously used different default entrance delays (code window 12, panel card 30), so the panel slid in ~18 frames late. Both now default to a shared `CARD_ENTER` spec. The panel's _content_ reveal (rows running as the code finishes typing) is unchanged.

## 0.7.2

### Patch Changes

- d6902a4: Three split/center-beat refinements:

  - **Center beats are truly vertically centered.** `layout:"center"` (install opener/closer, hero) now centers its content in the full frame instead of sitting in the lower band.
  - **Paired code+panel beats show both cards at once.** The result panel's card + header now mount immediately alongside the code window; only the panel's _content_ (rows, counters, draws) waits for the code to finish typing — via a new `reveal` frame offset threaded to every panel. Previously the whole panel was hidden until the code was done.
  - **Softer headline scrim.** The white-text shadow over image backgrounds is ~halved and re-tinted from near-black to slate, so it reads without looking like a heavy outline.

## 0.7.1

### Patch Changes

- 57a9ca3: Strengthen headline/eyebrow/subhead legibility over image backgrounds with a layered dark scrim-glow text-shadow, so white text reads on bright painterly skies without switching to dark text.

## 0.7.0

### Minor Changes

- f78d43e: New `browser` panel kind (Finder-style folder/file listing) and an inverted launch flow for the `feature-launch` template.

  - **`browser` panel** — a result card that pairs beside a code window: sectioned folder/file rows (folders get a chevron, files a right-aligned size), e.g. the result of a `list({ prefix, delimiter })` call.
  - **`hero` beat flag** — render a centered title card (big headline + `caption` as a sub-tagline) to close on.
  - **`feature-launch` default flow change** — it now opens on the install terminal (`$ npm i pkg` + feature pills) and closes on a hero title card (package + tagline), matching a launch-reel structure. Pass `flow: "title-open"` to keep the previous title-open / install-close behavior. `milestone` and `changelog-reel` are unchanged.

### Patch Changes

- b750148: Fix the global `cadence` CLI silently no-opping when installed as a scoped package. Bin resolution assumed the hoisted `.bin` sat one level above the package root, which holds for an unscoped install but not a scoped one (`node_modules/@scope/<pkg>`), where the hoist is two levels up. The runner is now found at either depth, and a launch that can't find its runner fails loudly with a non-zero exit instead of exiting 0 with no output.

## 0.6.1

### Patch Changes

- 74988f9: `cadence study --out <path>` now creates the output path's directory instead of
  always creating a `themes/` dir — so writing a theme into a project's `.cadence/`
  no longer leaves an empty `themes/` behind.

## 0.6.0

### Minor Changes

- `cadence art --brand` tints generated backgrounds toward the project's
  `.cadence/theme.json` palette (accent + paper), so painted backdrops match the
  rest of the video's brand.

## 0.5.0

### Minor Changes

- Generative custom backgrounds. `cadence art --prompt "<scene>" --name x` paints a
  backdrop from any prompt (the Texas landmark set becomes the bundled default
  pack); `--pack <file.json>` supplies reusable subject sets and `--style-file`
  overrides the look. Generated art is project-local — it lands in
  `<project>/.cadence/backgrounds/`, `cadence art --promote <name>` moves a keeper to
  `backgrounds/`, and renders stage a merged public dir so project art and built-in
  assets both resolve. Batches print a cost estimate and require `--yes`; the default
  `--quality` is now `medium`.

## 0.4.0

### Minor Changes

- Project-local `.cadence/` support. cadence now auto-discovers a
  `<project>/.cadence/theme.json` (brand + code styling) when run against a repo —
  no `--theme-file` needed — and writes outputs to `<project>/.cadence/out`
  (anchored to the project, not the cwd; override with `--out <dir>`). Themes gain
  `codeChrome: "minimal"` for a chromeless, docs-style code window so a video's code
  snippets can match a project's documentation.

## 0.3.0

### Minor Changes

- Add `cadence storyboard` (and `cadence create … --dry-run`): a dry-run preview that prints the beat-by-beat plan and renders one still per beat as a single contact-sheet PNG — iterate on a video before committing to a full render. Backgrounds now stay continuous across consecutive same-backdrop beats (only the content transitions; a real backdrop change crossfades). Plus seven task-oriented usage guides under `docs/guides/`.

## 0.2.0

### Minor Changes

- First public release of cadence on the `@waits` scope: a local-first changelog/announcement video engine that renders on-brand videos from a repo or a beats file — honest code only, your theme, no hosted service.
