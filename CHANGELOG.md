# @waits/cadence

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
