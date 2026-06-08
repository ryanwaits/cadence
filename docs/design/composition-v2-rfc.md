# Cadence Composition v2 — RFC: the bounded component tree

**Status:** ACCEPTED (open decisions resolved §7). No code yet — ready to convert to an execution plan.
**Builds on:** `docs/design/composition-architecture-spec.md` (Phase 1, shipped at 0.9.x — the kind × template × theme split + a flat `components[]` layer + `desugarBeat`).
**Goal:** unlock the four walls below without a big-bang rewrite, under a byte-identical regression gate.

> ⚠️ **Correction vs Phase 1:** Phase 1's spec §6 *specified* a byte-identical render gate, but it was never built — `scripts/smoke.ts` only asserts "renders without error," and `desugar.test.ts` golden-locks the field→region *mapping*, not rendered output. **v2 must build the real gate (golden render snapshot + diff) as its first Sprint-2 task; it cannot be inherited.** This is the make-or-break dependency for T5.

---

## 0. Where we actually are (read this first)

Phase 1 already landed. The kickoff's four "walls" are not the *old* engine — they are exactly what Phase 1 **deliberately deferred** (spec §5 "free x/y declined", "new region = PR", "new component = PR"; no node-level style at all). So this RFC is not a rewrite proposal — it's the *next* phase that the composition layer was scaffolded for.

What Phase 1 gave us, and what it stopped short of:

| Phase 1 shipped | Stopped short of (the wall) |
|---|---|
| `components: ComponentInstance[]` — a **flat** list of 7 fixed node types (`title \| eyebrow \| note \| caption \| badge \| code \| panel`) (`src/schema/composition.ts:41`) | A node **cannot contain other nodes** — no tree, so no "code on top / result below," no "3 mini-panels." |
| `placement = { region, align, size, order }` over 4 named regions (`composition.ts:20`) | Regions are routing *hints*, not layout. The renderer doesn't walk them generically — it `pick()`s known types and hardcodes a 3-block layout (`ChangelogScene.tsx:65-79`). |
| Panel kinds as a Zod discriminated union (`primitives.ts:42`) dispatched by a hand-written switch (`panels/index.tsx:26`) | New panel = schema member + component + switch case + `--explain` list. **Engine PR, not a registry add.** |
| One theme + one template per video, resolved once at bundle time (`theme/index.ts:35`, `templates/active.ts`) | **Zero** per-node style surface. `placement` has no `style`; components read `STYLES.*`/`resolveRole()` constants directly (`ChangelogScene.tsx:149`). |

**The throughline:** beats are still *data poured into a fixed-shape renderer*. The renderer, not the data, owns structure. v2 inverts that — the data describes a tree; the renderer becomes a generic, registry-driven tree-walker — **while keeping named regions and size tiers as the on-brand guardrail** so freedom doesn't produce slop.

---

## 1. Rigidity map (the four walls → exact enforcement sites)

**Wall 1 — closed panel enum.**
- `src/schema/primitives.ts:42-120` — `panelSchema` = hardcoded 10-member `discriminatedUnion("kind", …)`.
- `src/components/panels/index.tsx:26-49` — `switch (spec.kind)` + `assertNever`. New kind ⇒ edit here.
- `scripts/edit.ts` (`--explain`) + `skills/cadence/SKILL.md:204` panel table — the closed set is also re-typed in three docs. Adding a panel touches schema + component + switch + explain + SKILL.

**Wall 2 — binary layout.**
- `src/schema/beats.ts:57` — `layout: z.enum(["split","center"])`.
- `src/components/ChangelogScene.tsx:46-49` — `const stack = !isWide || centered`. Layout is a boolean: 16:9-split ⇒ row(code,panel); everything else ⇒ column.
- `ChangelogScene.tsx:96-125` — the lead/trailing band is a hand-written two-`div` flexbox. There is no "code full-width on top, result below in 16:9," no grid of N items — those shapes have no representation.
- Geometry lives in `LAYOUT_MODEL.regions[format]` / `bands[format]` (`templates/types.ts:81`), per-region/per-format, **template-owned, not beat-overridable** beyond the `hero` variant.

**Wall 3 — theme-global styling.**
- `src/theme/index.ts:35` `activeTheme` + `templates/active.ts` `activeTemplate`/`STYLES`/`LAYOUT_MODEL` — module singletons, bundle-time, immutable.
- `src/templates/active.ts:32` `resolveRole = (r) => activeTheme.colors[r]` — no override parameter.
- `composition.ts:41-50` — node schemas are `.strict()` with `{type, placement, text|code|panel}`. **No `style`, `color`, `variant`, `className` field exists anywhere.** A node cannot say "make this row gold / tighten this / drop the chrome."

**Wall 4 — data into fixed shapes (the root cause).**
- `ChangelogScene.tsx:55-79` — renderer calls `desugarBeat`, then `pick(components, "title")`, `pick(…, "code")`, `pick(…, "panel")` … and emits three fixed blocks. The composition array is *queried for known types*, never *walked*. So even though the data looks composable, the renderer collapses it back to the legacy shape. **This is why agent edits beyond "fill a known field" have nowhere to land.**

---

## 2. json-render evaluation — borrow the pattern, don't adopt the package

json-render (`json-render.dev`) is exactly the pattern: a **component registry** maps catalog `type`s to React components; a **flat tree** of `{type, props, children}` is **Zod-validated against the catalog** so an LLM can only emit declared components. That is precisely the shape cadence wants for walls 1 & 4.

**But adopt-as-dependency fails three non-negotiables:**

| Concern | Finding | Verdict |
|---|---|---|
| Animation / sequencing | json-render docs describe **no** frame model, motion, or sequencing. Cadence's entire moat is frame-based typewriter + code→panel reveal coupling (`CodeWindow.codeTypingDoneFrame`, `ChangelogScene.panelStart`). | Renderer must be Remotion-frame-aware. json-render's renderer is not. |
| Runtime / framework | Multi-framework (`@json-render/react|vue|svelte`). Cadence is React 19 + Remotion only. The cross-framework indirection is dead weight. | Abstraction tax with no payoff. |
| License / hosted dep | License + runtime deps unspecified in docs; "local render, no hosted dependency" is a hard line. | Risk we don't need to take. |

**Recommendation: build a ~150-line cadence-native registry + recursive renderer on top of the Zod schema we already have.** We already use Zod (the honest-code moat); json-render would *replace* that with its own catalog. We keep ours and borrow only the three ideas: **(1) registry-as-source-of-truth, (2) recursive validated tree, (3) schema-per-component.** Zero new runtime dependency; full control of the frame/motion layer.

---

## 3. Target model — the bounded composition tree

Four changes, each killing one wall, each additive over Phase 1.

### 3.1 Nodes nest (kills walls 2 & 4)

Promote `components: ComponentInstance[]` from a flat list to a **recursive tree**. Add **container** node types alongside the existing **leaf** types:

```ts
// Containers (NEW) — they carry children, not content:
{ type: "row",   gap?, align?, justify?, children: Node[] }   // horizontal band
{ type: "col",   gap?, align?, justify?, children: Node[] }   // vertical stack  (a.k.a. "stack")
{ type: "grid",  cols, gap?, children: Node[] }               // N-up tiles
{ type: "group", children: Node[] }                            // styling/motion scope, no layout effect

// Leaves (UNCHANGED from Phase 1): title | eyebrow | note | caption | badge | code | panel
```

`Node = z.lazy(() => z.discriminatedUnion("type", [...leaves, ...containers]))` — recursion via `z.lazy`, still a discriminated union, still `.strict()`, still honest.

**The guardrail (answers "how much freedom before it's ugly?"):** the **top level stays region-routed.** A beat's `components` are still grouped into `header / lead / trailing / footer` by `placement.region` — that is the on-brand skeleton, unchanged. **Containers are only used *inside* a region.** So "code full-width on top, result below" becomes:

```jsonc
{ "type": "col", "placement": { "region": "lead" }, "gap": 24, "children": [
  { "type": "code",  "code":  { … } },
  { "type": "panel", "panel": { "kind": "data-table", … } }
] }
```

No free x/y, no absolute positioning, no anarchy — just `row`/`col`/`grid` with `gap`/`align`/`justify`, sized by the same `size` tiers. This is the minimum that unlocks the wall and is still byte-regression-testable across all three formats.

### 3.2 The renderer becomes a generic walker (kills wall 4)

`ChangelogScene` stops `pick()`-ing known types. New shape:

```
group top-level nodes by region (header/lead/trailing/footer)
for each region: <RegionLayout>{ node.map(renderNode) }</RegionLayout>
renderNode(node):
  container → <Row|Col|Grid> with node.children.map(renderNode)  // recurse
  leaf      → registry[node.type].Component(node)                // dispatch
```

One concession kept from Phase 1 for byte-identity: when `header`+`lead` text instances came from the legacy desugar path, re-composite them into the single `<Headline>` block (the spec's "logical region" note, `desugar.ts` §3). That stays — it's the one place region is logical, not a DOM band.

### 3.3 Everything dispatches through a registry (kills wall 1)

Replace the panel `switch` **and** the component-type union with a single registry keyed by `type` (panels keyed by `kind` within the `panel` leaf):

```ts
// src/components/registry.ts
export const REGISTRY = {
  title:   { schema: titleSchema,   Component: Title },
  code:    { schema: codeNodeSchema, Component: CodeNode },
  panel:   { schema: panelNodeSchema, Component: PanelNode },  // panel sub-registry, see below
  row: …, col: …, grid: …,
};
export const PANEL_REGISTRY = {
  feed:       { schema: feedSchema,   Component: FeedPanel },
  "data-table": { … }, … // today's 10
};
```

The Zod unions are **assembled from the registry** (`z.discriminatedUnion("type", Object.values(REGISTRY).map(r => r.schema))` — verified viable in Zod 4.4.3, including `z.lazy` recursive members), so **schema and dispatch can never drift**. `edit --explain` and the SKILL panel table can be **generated from the registry** (`Object.keys`) instead of hand-maintained in three places — *with a CI lint that fails if generated output and registry disagree* (a stale registry must not silently produce lying docs).

**Scope this honestly:** the registry removes the *dispatch* surgery (the `switch` + union edit + `--explain` edit + SKILL edit). A genuinely new leaf still needs a new React component file — that's unavoidable and stays code. The win is: **one new file + one registry line, with zero `ChangelogScene`/union/switch edits.** The data-vs-code boundary holds; the moat is intact.

### 3.4 Per-node style overrides (kills wall 3)

Add an **optional, constrained** `style` to every node:

```ts
const styleSchema = z.object({
  color:   colorRef.optional(),      // ColorRole | raw token (role-first, raw escape hatch)
  bg:      colorRef.optional(),
  gap:     z.number().optional(),
  padding: z.string().optional(),
  track:   z.number().optional(),    // letter-spacing
  chrome:  z.enum(["window","minimal","none"]).optional(),  // e.g. drop window chrome on a code node
  size:    sizeSchema.optional(),    // per-instance tier override (already a concept)
}).strict();
```

Resolution chain at render: **node.style → template `STYLES.*` → theme token.** `resolveRole` gains an override arg: `resolveRole(role, node.style?.color)`. It is **not** arbitrary CSS — a closed, validated prop set, so it stays honest and on-brand (no `style={{ /* anything */ }}` escape). "Make this row gold / tighten this panel / drop the chrome here" all become expressible, per-instance, without touching the global theme.

### 3.5 Motion & sequencing in a free tree (resolves the open question)

Ownership stays **component-owned + template-defaulted** (today's model), generalized by two tree-aware additions:

- **`stagger` on a container** — a `col`/`grid` can stagger its children's enter (today's per-row stagger, lifted to data).
- **`revealAfter` on placement** — the deferred Strategy (b) from spec §3 ("`placement.revealAfter: <id>`"). The renderer computes a node's reveal frame from the referenced sibling's done-frame. This **generalizes today's hardcoded `code → panel` coupling** (`ChangelogScene.panelStart`) into data: any node can wait on any sibling. When omitted, the renderer keeps the automatic `code→panel` default, so legacy stays byte-identical.

**Remotion stays happy because** durations remain pre-known (`beat.durationInFrames`), reveal is *offset arithmetic over static data* (not DOM measurement), and named-region + size tiers mean **no content-measured layout** — the tree walk is a pure, deterministic function of `(props, frame)`, exactly what `calculateMetadata` + `<Series.Sequence>` require. This is the reason we hold the line at named regions and decline free x/y: free positioning would invite measure-dependent timing and break determinism.

> **Hard rule (enforce in review, ideally a lint):** no node component may read layout from the DOM — no `useRect`, `getBoundingClientRect`, `ResizeObserver`, or measured reflow. All sizing flows from `size` tiers + `LAYOUT_MODEL`. Reveal/stagger frames are computed from the static tree before render. This is the single invariant that keeps the recursive renderer Remotion-deterministic; breaking it silently regresses render reproducibility.

---

## 4. Schema-per-component keeps the moat (non-negotiable check)

The honest-code moat *strengthens*, not weakens:
- Every node validates against its registry Zod schema; `.strict()` everywhere; unknown `type`/`kind`/style key ⇒ parse error surfaced by `cadence edit` (today's loop, unchanged).
- The registry is the **single source of truth** for "what the agent may emit" — `--explain` and SKILL docs generate from it, so the agent's knowledge can never exceed what the engine actually renders.
- The data-vs-code boundary is unchanged in spirit: composing/styling/laying-out within the registry = data; a genuinely new leaf component or motion preset = code PR. Walls 1–3 just move a *lot* more of "what used to need a PR" (layout shapes, per-node style, panel composition) onto the data side.

---

## 5. Migration path (no breaking rewrite — same playbook as Phase 1)

The compat *mechanism* is already proven: Phase 1 made legacy beats desugar into `components[]`. v2 reuses that mechanism — but must build the byte-identical *gate* itself (see the correction at the top; it was specified, never implemented).

1. **Legacy flat fields** (`headline`/`code`/`panel`/…): `desugarBeat` already maps these to placed nodes (`desugar.ts`). Extend it to emit the **v2 tree** — specifically, wrap the legacy `lead` code + `trailing` panel in the implicit row/column the renderer used to hardcode. Output is the same pixels.
2. **Phase-1 flat `components[]`**: a flat array of region-placed leaves **is already a valid v2 tree** (depth-0, no containers). The recursive walker renders it identically. No migration needed.
3. **No codemod required for authors.** Every existing `*.beats.json`/`*.beats.ts` parses and renders unchanged. New capability is purely additive (containers, `style`, `revealAfter`).
4. **Regression gate (the hard line — must be BUILT, not inherited):** a golden render snapshot of every file in `src/content/*.beats.ts` (e.g. `remotion still` per beat mid-frame → hashed/diffed), wired into CI. `smoke.ts` today only checks "no error" — insufficient. This gate must exist *before* T5 lands, and nothing merges without it.

---

## 6. Phased plan (atomic, demoable)

> Reuses Phase 1's discipline: schema/desugar first, renderer byte-identity gate is the crux, surface last. A file is owned by one task at a time.

**Sprint 0 — Build the safety net first (de-risk T5).**
- [ ] T0: Build the golden render-snapshot gate: `remotion still` per beat (mid-frame) across all `src/content/*.beats.ts` × all 3 formats → store hashes/PNGs → `scripts/regression.ts` diffs against golden. Wire into `check:render`/CI. → validates: runs green on `main` today (captures the *current* pixels as the baseline). **Blocks T5.**

**Sprint 1 — Tree schema + registry skeleton (no renderer change; everything still renders via the old path).**
- [ ] T1: Add container node schemas (`row`/`col`/`grid`/`group`) + recursive `Node` via `z.lazy`; keep leaves as-is. **Define container reflow semantics in the schema/docs here** (§ below), not at render time. → validates: all content files still parse; a nested `col` fixture parses; reflow rules written down.
- [ ] T2: Introduce `src/components/registry.ts` + `PANEL_REGISTRY`; **assemble the existing Zod unions from it** (no behavior change). → validates: `panelSchema`/`componentSchema` deep-equal their pre-refactor shape (snapshot test); `tsc` green.
- [ ] T3: Add optional `style` schema to nodes (parsed, not yet applied). → validates: parses; absent on every legacy file ⇒ no diff.

**Sprint 2 — Generic renderer + the byte-identity crux.**
- [ ] T4: Extend `desugarBeat` to emit the v2 tree (wrap legacy lead/trailing in the implicit container). → validates: golden snapshot of `desugarBeat(legacy)` per content file.
- [ ] T5: Rewrite `ChangelogScene` to group-by-region + recursive `renderNode` over the registry; keep the header+lead `<Headline>` re-composite. **Render nested fixtures across all 3 formats** to exercise reflow. → validates: **T0 gate passes byte-identical** on all content files × formats. Demoable: `cadence storyboard` on every existing file is pixel-unchanged.
- [ ] T6: Implement `RegionLayout`/`Row`/`Col`/`Grid` container components (flex/grid, size tiers from `LAYOUT_MODEL`), honoring the reflow rules from T1. → validates: a "code-on-top / panel-below" fixture renders correctly in 16:9 **and** stacks sanely in 9x16/1x1; storyboard sheet looks right.

**Sprint 3 — Sequencing-as-data + style overrides.**
- [ ] T7: Implement `stagger` (containers) + `placement.revealAfter` (cross-node reveal); refactor the legacy `code→panel` coupling to fall out of the *same* mechanism (don't keep two timing paths). Storyboard's mid-frame picker must walk the tree for reveal frames. → validates: panel-waits-for-code timing byte-identical on legacy; a hand-authored two-panel staggered beat sequences correctly; storyboard stills land on settled frames.
- [ ] T8: Apply `node.style` in the resolution chain (`resolveRole(role, override)`, container `gap`/`padding`, code `chrome`). → validates: a fixture with one gold row + one chrome-less code node renders; files without `style` are byte-identical.

**Sprint 4 — Surface + agent knowledge.**
- [ ] T9: Generate `edit --explain` + SKILL panel/component tables from the registry (with the CI lint that fails on drift); document containers/`style`/`revealAfter` in `references/authoring.md`; `bun run sync-skill`. → validates: `--explain` lists containers; adding a throwaway registry entry shows up in `--explain` with no doc edit; lint catches a deliberately-stale doc.
- [ ] T10: Add 1–2 new leaf components purely as registry entries (proving the seam — e.g. `quote`, `metric-row`). → validates: each is one new file + one registry line, no `ChangelogScene`/switch/union edit; renders in a fixture.

**Critical path:** `T0 → (T1∥T2∥T3) → T4 → T5 → T6 → T7 → T8 → T9 → T10`. T0 (the gate) gates T5; T5 (byte-identity) is the make-or-break.

### Container reflow semantics (decide in T1, before any render code)

The guardrail only works if nesting reflows predictably across formats. Proposed rules (the gap the reviewer flagged):
- A `row` **becomes a `col`** when `format !== "16x9"` (or the region is in `stack` mode) — same rule the legacy band already uses (`ChangelogScene.tsx:46`). This is what makes "code-left / panel-right" degrade to "code-above / panel-below" on 9x16/1x1 for free.
- A `grid` **collapses `cols → 1`** below 16:9 (tiles stack).
- `col` is format-invariant (already vertical).
- `size: "fill"` inside a container means "flex within the container's main axis"; `auto`/`md`/tiers resolve against `LAYOUT_MODEL.bands[format]` as today. Nesting does **not** introduce new pixel constants — children still draw from the band tiers.

These rules are pure functions of `(node, format)` — no measurement — preserving the determinism invariant.

---

## 7. Decisions (resolved)

1. **Altitude → bounded tree.** Recursion *inside* region-routed top-level slots. A `freeform` escape-hatch region (absolute positioning, exempt from the determinism guardrail) is **left open as a future option, out of scope for this phase.** Rationale: flat can't express wall 2; fully-free breaks Remotion determinism + on-brand guardrails.
2. **Container set → `row` / `col` / `grid` / `group` only.** `overlay` (z-stack) and `spacer` deferred — add later as registry entries if a real beat needs them; not worth the regression surface now.
3. **`style` scope → roles + tiers only for color; raw allowed for `gap`/`padding`.** No raw hex for color (keeps on-brand + themeable — a raw color would dodge the theme and break re-skinning). `chrome` stays an enum. This is the honest, brandable middle.
4. **`revealAfter` → in scope, Sprint 3 / T7.** Build cross-node timing as data now and refactor the legacy `code→panel` coupling onto the same mechanism. Avoids maintaining two timing paths; the tree makes it cheap.
5. **Registry-generated docs → yes, with a CI drift-lint.** `edit --explain` + the SKILL panel/component tables generate from the registry; lint fails the build if generated output and registry disagree. Stops hand-maintaining the closed sets in three places.
6. **Second template → deferred.** The generic renderer proves the per-region-layout seam on its own; a 2nd template multiplies the regression surface (every content file × format × template) for no new capability this phase. Revisit once the v2 renderer + gate are green.
