---
"@waits/cadence": minor
---

Unify the authoring model and make every on-screen degree of freedom introspectable.

**Breaking:** a beat is now a single `components` node tree — the legacy flat fields
(`headline`/`eyebrow`/`code`/`panel`/`caption`/`badge`/`note`/`hero`) and the desugar
path are removed. Author nodes terse with key-shorthand (`{ title: "…" }`,
`{ code: {…} }`, `{ panel: {…} }`), which the engine normalizes into the canonical
`{ type, … }` model before render. `layout` gains a `hero` value (`split | center | hero`).

- **Tokens, not constants:** typing speed, output gap, settle, and entrance/exit
  durations are now template `motion.timing` tokens; per-element `motion` overrides win.
- **Background scrim:** a `background.scrim` legibility wash; `hero` beats over an image
  get a template-default scrim so light titles stay readable over bright art.
- **`cadence capabilities`:** a machine-readable manifest of the full beat vocabulary
  (every node, panel kind, motion preset, placement option, and token with
  type/default/range/example), generated from the zod schemas with a `schemaDigest`.
- **`cadence inspect <beats> --beat <id>`:** the computed regions, per-element reveal
  timings, and resolved colors for an authored beat.
- **`cadence art`:** `--help` and a bare invocation now print usage instead of
  generating a default image.

Rendering of existing-shaped beats is byte-identical; migrate authored beats files
to the `components` model (see the cadence skill's authoring reference).
