---
"@waits/cadence": minor
---

Composition v2 — a bounded, agent-editable component tree.

Beats now compose. The flat `components[]` becomes a recursive tree with layout
containers (`row`/`col`/`grid`/`group`) that nest inside the named regions, so
layouts like "code over result" or N-up tiles are expressible as data (and reflow
across formats automatically). Every node takes an optional `style` override
(color/bg as theme roles, `gap`/`padding`/`chrome`/`size`) and data-driven
sequencing (a node `id` + another node's `placement.revealAfter`, or a container
`stagger`).

Panels and components now dispatch through a registry, so adding a panel kind is a
schema entry + a component + one registry line — no renderer or union edits (the new
`quote` panel ships this way). `cadence edit --explain` and the skill's allowed-set
docs are generated from that registry, with a `sync-skill --check` drift-lint.

Fully backward compatible: every existing `*.beats.{ts,json}` validates and renders
byte-identically (guarded by a new render-snapshot regression gate). Legacy beat
fields desugar into the new tree unchanged.
