# @waits/cadence

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
