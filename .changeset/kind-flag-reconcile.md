---
"@waits/cadence": patch
---

Reconcile the repo→video flag naming with the kind × template split.

`cadence create --release …` (and the GitHub Action) now take `--kind` / `kind:` for
the structural arc and `--template` / a beats `template` field for the styling layer
— matching `cadence new` and the rest of the CLI. `--template` naming the arc is a
**deprecated alias** (still honored, with a notice) so existing commands and Action
workflows keep working; the Action gains a `kind` input alongside the deprecated
`template`. As a bonus, the repo one-shot now supports the styling template too
(`--template terminal`).
