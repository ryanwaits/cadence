---
"@waits/cadence": patch
---

Fail loudly on bad theming inputs instead of silently rendering wrong-looking (or `#NaNNaNNaN`) output: `deriveTheme` rejects invalid hex colors, `--theme-file` and `.cadence/theme.json` are validated against a new `themeConfigSchema` before a render starts, unknown `--template` names exit with the valid list, and `cadence study` validates `--accent` and hardens the `--from-url` fetch. `cadence study` also now defaults its output to the discoverable `.cadence/theme.json` when one exists, so the happy path (`study` → `create`) no longer silently ignores the theme it just wrote.
