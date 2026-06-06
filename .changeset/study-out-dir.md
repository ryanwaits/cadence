---
"@waits/cadence": patch
---

`cadence study --out <path>` now creates the output path's directory instead of
always creating a `themes/` dir — so writing a theme into a project's `.cadence/`
no longer leaves an empty `themes/` behind.
