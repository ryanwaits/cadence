---
"@waits/cadence": minor
---

refactor(cli)!: consolidate the verb surface. `audit` → `edit` (deprecated alias kept), `redesign` → `fork --background/--enter/--exit` + `create` (alias kept, no auto-render), `make`/`theme` aliases now print deprecation notes. Removed: the `feature-launch`/`changelog-reel` kind aliases, the `--template`-as-kind shim, and the Action's deprecated `template` input (use `kind`).
