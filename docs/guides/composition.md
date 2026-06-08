# Composition — the component tree

Most beats are written with the **legacy fields** (`headline`, `code`, `panel`,
`eyebrow`, `caption`, `badge`, `note`) and that's the fast path. When you need more
control — a piece moved to a different region, two panels side by side, code *over* a
result, a gold row, a panel that reveals after another — drop to the **composition
layer**: a beat carries an explicit `components` tree instead of (or alongside) the
legacy fields.

The legacy fields **desugar** into this exact tree, so both shapes are valid and
render identically. Author `components` only where you need the control.

> Everything here is plain JSON, schema-validated. Run `cadence edit <file>` after
> each change; `cadence edit --explain` dumps the current allowed types / regions /
> panel kinds (generated from the engine, so it's never stale). Exact per-type
> fields live in [`authoring.md`](../../.claude/skills/cadence/references/authoring.md).

---

## Nodes: leaves + containers

`components` is a tree of **nodes**. A node is either a **leaf** (renders content) or
a **container** (arranges children).

**Leaves** — the seven content types:

```jsonc
{ "type": "title",   "text": "Stream every event." }
{ "type": "eyebrow", "text": "new in streams" }
{ "type": "note",    "text": "Secondlayer" }
{ "type": "caption", "text": "subscribe · verify", "variant": "footer" }  // or "subhead"
{ "type": "badge",   "text": "v1.0" }
{ "type": "code",    "code":  { "filename": "events.ts", "lang": "ts", "source": "…" } }
{ "type": "panel",   "panel": { "kind": "feed", "rows": [ … ] } }          // panel.kind stays inside
```

`code`/`panel` reuse the exact shapes from the legacy fields — nothing is re-shaped.

**Containers** — four ways to arrange children (see *Layout containers* below):
`row`, `col`, `grid`, `group`.

The schema is **strict**: an unknown `type` (or a stray prop) fails `cadence edit` —
which means it's a code change, not data (see *Data vs. code*).

---

## Placement: regions

Every node takes an optional `placement`; each field falls back to the template's
default for that node type when omitted.

```jsonc
"placement": {
  "region": "header" | "lead" | "trailing" | "footer",  // CLOSED set
  "align":  "start" | "center" | "end",
  "size":   "auto" | "sm" | "md" | "lg" | "fill",        // per-format pixel tiers, template-owned
  "order":  0                                             // intra-region sort
}
```

The **top level is region-routed** — that's the on-brand skeleton:

- **`header`** — the eyebrow row.
- **`lead`** — the main column: title / note, and the code window.
- **`trailing`** — the second seat in the row band (the panel, at 16:9; it stacks
  below `lead` in square/vertical formats).
- **`footer`** — the bottom bar: caption / badge.

A minimal hand-authored beat:

```jsonc
{
  "id": "events", "durationInFrames": 235,
  "components": [
    { "type": "eyebrow", "placement": { "region": "header" }, "text": "new in streams" },
    { "type": "title",   "placement": { "region": "lead" },   "text": "Stream every event." },
    { "type": "code",    "placement": { "region": "lead", "size": "fill" },
      "code": { "filename": "events.ts", "lang": "ts", "source": "const { events } = await sl.index.events({ limit: 50 });" } },
    { "type": "panel",   "placement": { "region": "trailing" },
      "panel": { "kind": "feed", "title": "index.events", "rows": [ { "badge": "sBTC", "label": "SP2J6…", "value": "1,200.00" } ] } }
  ]
}
```

---

## Layout containers

The top level is region-routed; to arrange content *inside* a region, nest a
container. A child of a container **inherits the container's region**.

| container | does | reflow below 16:9 |
|-----------|------|-------------------|
| `col` | stack children vertically | (already vertical) |
| `row` | lay children side-by-side | **becomes a column** |
| `grid` | tile `cols` across | **collapses to 1 column** |
| `group` | scope style/motion, **no layout effect** | — |

Reflow is automatic and measurement-free, so a layout degrades sanely across all
three formats. The classic example the legacy `split` band can't express — **code
full-width on top, the result below** — is a `col` in `lead` (leave `trailing`
empty):

```jsonc
{ "type": "col", "placement": { "region": "lead" }, "gap": 24, "children": [
  { "type": "code",  "code":  { "filename": "list.ts", "lang": "ts", "source": "await sl.list({ prefix: 'events/' });" } },
  { "type": "panel", "panel": { "kind": "browser", "title": "list({ prefix })", "sections": [ … ] } }
] }
```

Containers take `gap`, `align`, `justify` (and `grid` takes `cols`).

---

## Per-node style

Any node takes an optional `style` — a **closed, validated** set (not arbitrary CSS),
so per-instance tweaks stay honest and on-brand:

```jsonc
"style": {
  "color": "gold",        // a theme ROLE, never a raw hex — so a theme swap re-colors it
  "bg":    "goldSoft",    // container background tint (a role)
  "gap":   18,            // container child gap
  "padding": "28px",      // container inset
  "track": 0.02,          // letter-spacing
  "chrome": "none",       // code window: "window" (default) | "minimal" | "none"
  "size":  "lg"           // per-instance size-tier override
}
```

Resolution chain: **`style` → the template's default → the theme token.** Because
`color`/`bg` are roles, not hex, overrides survive a theme swap (the moat that keeps
videos re-skinnable). "Make this row gold", "tighten this panel", "drop the chrome
here" all become expressible per-instance — without touching the global theme.

```jsonc
{ "type": "title", "placement": { "region": "lead" }, "text": "Per-node style.", "style": { "color": "gold" } }
```

---

## Sequencing as data

By default the engine sequences a beat for you: a panel waits for the paired code to
finish typing, then "runs". To sequence explicitly, give a node an `id` and point
another node at it:

```jsonc
{ "type": "row", "placement": { "region": "lead" }, "gap": 40, "children": [
  { "type": "panel", "id": "first",  "panel": { "kind": "stat", "value": "1000000", "label": "events" } },
  { "type": "panel", "placement": { "revealAfter": "first" }, "panel": { "kind": "stat", "value": "250000", "label": "requests / day" } }
] }
```

- **`placement.revealAfter: "<id>"`** — this node reveals only after the referenced
  node finishes (typing-done for code; entrance-settle otherwise) + a small gap.
- **`stagger: <frames>`** on a container — offsets each child's reveal by
  `i × stagger`, sequencing a row/grid of items in one after another.

The legacy code→panel coupling is just the default case of this same mechanism, so
existing beats are unchanged.

---

## Data vs. code — the boundary

The schema **is** the boundary, and `cadence edit`'s parse step enforces it: **if
`cadence edit` accepts it, it's data you compose in JSON; if it rejects an unknown
type/region/kind, that needs an engine PR.**

**Compose it yourself (data):**

- text, placement (move region, re-align, size tier, order)
- swap a `panel.kind` or its rows/columns
- **layout** — wrap nodes in a `row`/`col`/`grid`/`group`
- **per-node `style`** — color/bg role, gap/padding, chrome, size
- **sequencing** — node `id` + `revealAfter`, container `stagger`
- pick a different motion **preset** from the named vocabulary

**Needs an engine PR (stop and report):**

- a **new component type** or a **new panel kind** — though that's now small: a
  schema entry + a component + one registry line (no renderer edits). See the
  [registry](../../src/components/registry.ts).
- a **new region** or free x/y positioning (the named-region set is the guardrail)
- a **new motion preset / easing curve**, or a **new template**

Run `cadence edit --explain` for the live allowed sets.

---

See also: [Videos](videos.md) (the kind × template workflow) ·
[Branding, Themes & Formats](branding-and-formats.md) ·
[`authoring.md`](../../.claude/skills/cadence/references/authoring.md) (exact fields).
