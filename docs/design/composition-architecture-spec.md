# Cadence Phase-1 SPEC — kind × template × theme + composition layer

**Status:** DESIGN CONTRACT (Phase 1). No code changes in this phase. Phase-2 agents implement this verbatim.
**Target version:** 0.9.0 (see Open Decision #7). **Regression goal:** byte-identical render of all existing `*.beats.json`/`*.beats.ts`.

---

## 0. Vocabulary (the spine — resolves the naming collision)

The word "template" is overloaded today. We split it into two axes and free the name for the new styling layer:

- **kind** = structural arc (which beats, what order). Today's `src/templates/` `Template` fns → renamed `src/kinds/` `Kind` fns. Members: `launch` (was `feature-launch`), `changelog` (was `changelog-reel`), `milestone`, + new `announcement`, `showcase`.
- **template** = NEW stylistic layer (component styling + default layout regions + motion personality + default backgrounds + a bound theme). Member #1: `field-notebook` (the current look, extracted). Lives in `src/templates/` (name freed by the rename above).
- **theme** = tokens only (colors/fonts/codeTheme/shadows). Unchanged. A template references one.

**One sentence:** *theme = what color/font; template = how big/heavy/spaced/animated; kind = what beats in what order.*

---

## 1. LAYERING — responsibilities + type shapes

| Layer | Owns | Must NOT own | Artifact |
|---|---|---|---|
| **kind** | beat structure: which beats, order, durations, eyebrows, `layout`/`hero` flags, semantic content. Plus `meta { name, description, whenToUse, format }`. | any hex, px, font, shadow, motion curve. Emits *semantic* beats only. | `Kind = (manifest, opts) => ChangelogInput` + sibling `KindMeta`, in `KINDS` registry. |
| **template** | component styling (type scale, weights, tracking, shadows, surfaces, padding), default region geometry per format, motion personality (default presets/easing/distance/`cardEnter`), default backgrounds, and a **bound default theme name**. | raw tokens (defers to theme via *roles*); narrative structure. | `TemplateStyle` object in `TEMPLATES` registry; resolved once as `activeTemplate`. |
| **theme** | tokens only: `colors`, `fonts` (stacks), `codeTheme`, `shadows`, `codeChrome`, `backdrop`. | scale/weight/layout/motion/structure. | `ThemeConfig` (existing, **no shape change**). |

**Binding direction:** template names a default theme; `--theme` at render still overrides. Theme has zero knowledge of templates (keeps `study`/`deriveTheme` template-agnostic). Theme stays the leaf.

### Type shapes (field names — the contract)

```ts
// src/kinds/types.ts
export type KindMeta = { name: string; description: string; whenToUse: string; format: Format };
export type Kind = (manifest: UpdateManifest, opts?: KindOpts) => ChangelogInput; // KindOpts = today's TemplateOpts, renamed
// KINDS registry entries are { fn: Kind, meta: KindMeta }.

// src/templates/types.ts  (NEW styling layer)
export type TemplateStyle = {
  name: string;
  description: string;
  theme: string;                 // bound default theme, e.g. "default"; --theme overrides
  styles: TemplateStyles;
  layout: LayoutModel;
  motion: MotionPersonality;
  backgrounds: { default: BackgroundSpec };
};

export type TemplateStyles = {
  headline: {
    scale: Record<Format, { top: string; size: number; eyebrow: number; track: number; max: string }>;
    headlineWeight: number; headlineTracking: string; headlineLineHeight: number;
    eyebrowWeight: number; eyebrowUppercase: boolean;
    subheadScale: number; subheadWeight: number; noteScale: number;
    shadows: { headline: string; headlineLight: string; eyebrow: string; subhead: string };
    eyebrowColor: ColorRole; headlineColor: ColorRole; headlineLightColor: ColorRole;
    subheadColor: ColorRole; noteColor: ColorRole;
  };
  panel: {
    surface: string; border: string; radius: number; shadowRole: "float";
    headerPadding: string; headerHairlineRole: ColorRole; bodyFontRole: "mono";
    titleSize: number; titleWeight: number;
    byKind: Record<PanelKind, Record<string, unknown>>; // per-panel literals (OD #1 — RESOLVED: nested under panel.byKind)
  };
  badge:   { size: number; track: string; radius: number; bgRole: ColorRole; fgRole: ColorRole };
  caption: { footerSize: number; subheadSize: number; weight: number; colorRole: ColorRole };
  radius:  { sm: number; md: number; lg: number; xl: number; full: number };
};

/** A color ROLE names a theme token; component resolves at render via resolveRole(). */
export type ColorRole = keyof ThemeColors;

export type MotionPersonality = {
  cardEnter: MotionSpecData;        // was CARD_ENTER = { enter:"settle", delay:12 }
  defaultEnter: EnterPreset;        // "rise"
  defaultEasing: "smooth" | "snappy";
  enterDistance: number;            // 24
  ease: { smooth: BezierTuple; snappy: BezierTuple };
};

export type LayoutModel = {
  regions: Record<Format, Partial<Record<RegionName, RegionGeom>>>;
  defaultRegion: Record<ComponentType, RegionName>;
  defaultSize: Partial<Record<ComponentType, SizeHint>>;
  variants: { hero: Partial<Record<RegionName, RegionGeom>> }; // layout:center / hero override
};
export type RegionName = "header" | "lead" | "trailing" | "footer"; // RESOLVED (see OD #1)
export type RegionGeom = { top?: string; bottom?: string; dir?: "row" | "column"; gap?: number; pad?: string; align?: Align; maxWidth?: string };
```

> **Override note (region naming):** the `layout-model` analysis proposed a 5th split — `header/lead/stage/aside/footer` (with `stage`+`aside` as the row-band). The other three analyses converge on **`header/lead/trailing/footer`**, where `lead`+`trailing` *are* the row-band. Adopt the 4-region model: minimal set that maps 1:1 to the legacy zones; `lead/trailing` already carries the "two seats in one band" semantics the `stage/aside` pair was invented for. The `header` region absorbs the eyebrow; the headline/note live in `lead` for non-hero. Locked pending OD #1.

---

## 2. COMPOSITION SCHEMA

A beat gains an **optional** `components: ComponentInstance[]`. The renderer runs *only* on `components`; legacy fields desugar into that array (§3). Beat stays `.strict()` with both shapes; all current files validate untouched.

```ts
// src/schema/composition.ts  (NEW)
export const regionSchema = z.enum(["header", "lead", "trailing", "footer"]);
export const alignSchema  = z.enum(["start", "center", "end"]);
export const sizeSchema   = z.enum(["auto", "sm", "md", "lg", "fill"]);

export const placementSchema = z.object({
  region: regionSchema.optional(),     // optional → falls to template.defaultRegion[type]
  align:  alignSchema.optional(),
  size:   sizeSchema.optional(),
  order:  z.number().int().optional(), // intra-region sort
}).strict();

// Text-component prop shapes (decomposed Headline + caption bar)
const titleProps   = z.object({ text: z.string(), motion: motionSchema.optional() }).strict();
const eyebrowProps = z.object({ text: z.string() }).strict();
const noteProps    = z.object({ text: z.string() }).strict();
const captionProps = z.object({ text: z.string(), variant: z.enum(["footer","subhead"]).default("footer") }).strict();
const badgeProps   = z.object({ text: z.string() }).strict();

const withPlacement = (type, shape) => z.object({ type: z.literal(type), placement: placementSchema.default({}), ...shape }).strict();

export const componentSchema = z.discriminatedUnion("type", [
  withPlacement("title",   titleProps.shape),
  withPlacement("eyebrow", eyebrowProps.shape),
  withPlacement("note",    noteProps.shape),
  withPlacement("caption", captionProps.shape),
  withPlacement("badge",   badgeProps.shape),
  z.object({ type: z.literal("code"),  placement: placementSchema.default({}), code:  codeSchema  }).strict(),  // reuse codeSchema verbatim
  z.object({ type: z.literal("panel"), placement: placementSchema.default({}), panel: panelSchema }).strict(),  // reuse panelSchema verbatim
]);
export type ComponentInstance = z.infer<typeof componentSchema>;
export type ComponentType = ComponentInstance["type"]; // "title"|"eyebrow"|"note"|"caption"|"badge"|"code"|"panel"
```

**`Code`/`panel` props are referenced (1:1 spread of existing `codeSchema`/`panelSchema`), never re-shaped** → zero drift, byte-identical. `kind` stays *inside* `panel` (so `type:"panel"`, `panel.kind:"feed"`); panel kinds remain a discriminated union and are the standalone panel components.

**Placement model = named regions, NOT free x/y.** All four analyses agree (closed enum set is the only thing you can regression-test byte-identically and the only thing that reflows across 3 formats by definition). `size` enum → per-format pixel tiers owned by the template:

| `size` | 16x9 | 1x1 / 9x16 |
|---|---|---|
| `fill` | `flex:1 1 0; maxW:codeMax(820)` | `width:100%; maxW:itemMax(940)` |
| `md` | `width:panelW(620)` | `width:100%` |
| `auto` | content width | content width |

(`sm`/`lg` reserved — map to template tiers; unused by desugar.)

### Beat schema change (the *only* change to existing fields)

```ts
export const beatSchema = z.object({
  // ...all existing fields unchanged EXCEPT:
  headline: z.string().optional(),        // ⚠ was required → relaxed
  components: z.array(componentSchema).optional(), // NEW, additive
}).strict()
  .refine(b => b.components || b.headline, "beat needs `components` or a legacy `headline`");
```

`changelogSchema` gains an **optional top-level** `template?: string` (one look per video, mirrors `format`): `{ format, template?, beats, audio? }`. `theme` is NOT a doc field — it stays env/`.cadence/theme.json`-resolved.

---

## 3. DESUGAR — legacy Beat → composition, byte-identical

`desugarBeat(beat): Beat & { components: ComponentInstance[] }`. Runs in **`prepare.ts` before shiki tokenization** (so lifted `code.source` still flows through the existing tokenize pass). If `beat.components` present → pass through. Else build from legacy fields. The new `ChangelogScene` walks regions; the old fixed render path is **removed** and becomes the desugar *target* (single source of truth).

### Field → region mapping table

| Legacy field | Condition | → `type` | region | align | size | order | timing |
|---|---|---|---|---|---|---|---|
| `eyebrow` | present | `eyebrow` | `header` | center | auto | 0 | component-owned `eyebrowIn` [14,28] |
| `headline` | always | `title` | `lead` (`hero`→region geom switches via `hero` variant) | center | auto | 0 | `motion`=`beat.headlineMotion` (default `{enter:"rise",delay:8}`) |
| `caption` | **hero** | `caption` `variant:"subhead"` | `lead` | center | auto | 1 | Headline `subheadIn` [18,34] |
| `note` | present | `note` | `lead` | center | auto | 2 | Headline `noteIn` [24,42] |
| `caption` | **not hero** | `caption` `variant:"footer"` | `footer` | center | auto | 1 | footer `captionIn` [40,58] |
| `badge` | present (not hero) | `badge` | `footer` | center | auto | 0 | `captionIn` [40,58] |
| `code` | present | `code` (`code:beat.code`) | `lead` | start | `fill` | 10 | own typewriter |
| `panel` | present | `panel` (`panel:beat.panel`) | `trailing` | start | `md` | 0 | `reveal=panelStart` (below) |

> **Header/lead split note:** today eyebrow, headline, subhead, note all render inside ONE `<Headline>` block. For byte-identity, desugar tags `eyebrow→header` and `headline/note/subhead→lead`, but the **renderer re-composites header+lead text instances back into a single `<Headline>`** when they came from the legacy path. Order numbers reserve 0–2 for text, 10 for code so code never sorts above note within `lead`. (The one place where "region" is logical, not a separate DOM band — locked to preserve shadow/spacing.)

### The one cross-component timing — Code↔panel reveal coupling

Today: `panelStart = beat.code ? codeTypingDoneFrame(beat.code.tokens, beat.code.motion) + OUTPUT_GAP : 0`. **Strategy (a), renderer-derived — RECOMMENDED, default:** desugar bakes NO number. The new scene computes, per beat, `panelStart` from any sibling `code` instance and passes it as `reveal` to every `panel` instance. Identical formula, identical result.

> Strategy (b) `placement.revealAfter: <code-instance-id>` is deferred (only needed for hand-authored multi-code beats — not Phase-1). Document as the forward path; do not implement.

### Format reflow (intrinsically renderer-side, cannot be data)

`lead`+`trailing` render as a **row** when `format==="16x9" && layout!=="center"`, else a centered **column** — exactly today's `stack = !isWide || centered`. `layout:center`/`hero` forces full-frame centered column (`top:0,bottom:0`) via the `hero` layout variant. Per-format numerics (`top/gap/pad/codeFont/codeMax/panelW/itemMax`, the `H` type scale) move to `template.layout.regions[format]` + `template.styles`, keyed by region+format — **not** into beat data.

### Cannot desugar cleanly → fix

| Problem | Fix |
|---|---|
| `hero`/`layout` are routing inputs, not components | desugar **reads** them to pick the `hero` layout variant + footer-suppression; they never become instances. Hero ⇒ caption goes to `lead` as subhead ⇒ footer auto-empty (matches `!hero && (caption||badge)`). |
| Format split is renderer-only | encoded as region semantics (`lead/trailing` row-vs-column). |
| Per-format numeric tuning | template/format styling layer, not composition data. |
| Hardcoded reveal windows (`eyebrowIn`/`subheadIn`/`noteIn`/`captionIn`) | stay inside the now-isolated components; inherited, not desugared. |

---

## 4. TEMPLATE-AWARENESS

**Mechanism (ONE, recommended): env-injected `activeTemplate`, resolved once at bundle time — exact mirror of `activeTheme`. NOT React context.** Rationale: components already do `import { COLORS } from "../brand/tokens"` (bundle-time from `REMOTION_VIDEO_THEME[_JSON]`); a parallel `REMOTION_VIDEO_TEMPLATE[_JSON]` is zero-surprise, avoids provider-wrapping every `<Sequence>` (smaller/safer diff for the byte-identical goal), and stays deterministic for `waitForFonts`/shiki.

```ts
// src/templates/active.ts (NEW)
export const activeTemplate: TemplateStyle = resolveActiveTemplate(); // env → TEMPLATES[name] → fieldNotebook
export const STYLES = activeTemplate.styles;
export const MOTION = activeTemplate.motion;
export const LAYOUT_MODEL = activeTemplate.layout;
export const resolveRole = (r: ColorRole) => activeTheme.colors[r]; // role → theme token; the only template↔theme coupling
```

`scripts/render.ts` sets `REMOTION_VIDEO_TEMPLATE[_JSON]` alongside `--theme`, and **seeds `REMOTION_VIDEO_THEME = activeTemplate.theme` when no `--theme`/`--theme-file` given** (template implies its bound theme; explicit `--theme` always wins — OD #6).

### Field-notebook extraction inventory (what MOVES OUT of components into `field-notebook.ts`)

Values are copied **verbatim** → render is byte-identical (diff = "move literal X, read it back").

- **`Headline.tsx`** → `STYLES.headline`: the `H` per-format scale map; `headlineWeight 700`; `letterSpacing -0.025em`; `lineHeight 1.0`; eyebrow `weight 600`+uppercase+track; subhead `×0.32/weight500/marginTop22`; note `×0.5`; all 4 shadow consts; color-**role** choices (gold/titleWhite/ink/markerPink — tokens stay in theme, the *which-role* decision is template).
- **`panels/PanelCard.tsx`** → `STYLES.panel`: `rgba(252,251,247,0.95)` surface, `rgba(255,255,255,0.6)` border, `RADIUS.xl+8`, `FONTS.mono` body default, `PanelHeader` `padding "20px 26px"` + hairline.
- **`panels/*.tsx`** → `STYLES.panel.byKind`: every literal `fontSize`/`fontWeight`/padding/`marginTop`, `STATE_COLOR` role mapping, badge framing.
- **`ChangelogScene.tsx`** footer bar literals (badge pill, caption sizes/shadow) → `STYLES.badge`/`STYLES.caption`; the `LAYOUT` map + geometry → `LAYOUT_MODEL.regions`.
- **`motion/useMotion.ts`** → `MOTION`: `CARD_ENTER`→`MOTION.cardEnter`; default `enter "rise"`, `distance 24`, easing `smooth`.
- **`brand/tokens.ts`** → template: `RADIUS`→`STYLES.radius`, `EASE`→`MOTION.ease`, `BACKDROP`→`backgrounds.default`, `FLOAT_SHADOW`/`CARET_BG` re-sourced. `tokens.ts` keeps exporting these names for back-compat but values become template-resolved.

**Stays GENERIC (does NOT move):** preset *implementations* (`enterStyle`/`exitStyle`/`typewriterChars`/`drawDashoffset`/`countValue`), `useMotion` timing math, panel component *structure/logic* (count-up, stagger, reveal gating), `Format` handling, `brand/fonts.ts` font-loading, `theme/*`, `schema/*`, `prepare.ts` core. `FONTS.mono/display/body/note` stay theme tokens (only scale/weight/tracking/shadow/role move).

---

## 5. CLI + BOUNDARY

### Verbs

```
cadence new  <kind> [--release o/n | --changelog <p> | --repo <p>] [--install "<cmd>"]
                    [--template <style>] [--theme <name>] [--format ...] [--headline "<h>"] [--name <slug>] [--out <dir>]
cadence fork <file> [--kind <k>] [--template <style>] [--theme <name>] [--format ...] [--headline "<h>"] [--name <slug>] [--out <dir>]
cadence edit <file> ["<nl instruction>"]   # nl arg consumed by the SKILL, never the binary
cadence kinds      # structural arcs + metadata
cadence templates  # stylistic layers + metadata (re-pointed to the NEW registry)
cadence themes     # tokens (unchanged)
```

- **`new`/`fork` = kind→durable beats file, no render.** Write a user-owned source file then STOP (print path + `→ cadence storyboard <file>`). Output: `--out`→resolve; else `.cadence/<slug>.beats.json`; else `./<slug>.beats.json`. Distinct from `make.ts` (ephemeral repo→MP4 for the Action) and `create` (beats→MP4). Extract shared source→manifest→kind→opts half into **`scripts/_author.ts`**. No-repo `new` ⇒ honest placeholder manifest, skill fills code.
- **`fork`:** `loadBeats`→re-apply. `--template`/`--theme`/`--format` = pure restyle. `--kind` = re-derive arc (only with a `--release`/`--changelog` source — no lossy reverse-adapter; OD #5). `--headline` overwrites opener.
- **`edit` = deterministic validate+normalize gate; LLM lives only in the skill.** Engine does: `loadBeats`→`changelogSchema.parse`→`desugarBeat`→`auditBeats`+`rankFindings` (soft warnings)→on zod error print issue path/message + **exit non-zero**→on success print 1-line summary + `→ cadence storyboard`. **The NL string is the skill's prompt, never an engine input.** Optional `cadence edit --explain` dumps allowed component types + regions. (Rejected: a `--patch` DSL.)
- **`kinds`/`templates`/`themes`:** mirror today's `themes` branch in `cli.ts`, with metadata columns. Keep **separate** commands (orthogonal axes). Each prints its binding (`template ... · theme: default`).

### Data-vs-code boundary

**The schema IS the boundary; `edit`'s parse step is the enforcer.** Satisfies `changelogSchema` → pure data. Parse rejects unknown `type`/`region`/`kind`/`motion` → engine primitive needed; skill stops and reports "needs a PR."

| Edit | Side | Why |
|---|---|---|
| text (headline/eyebrow/caption/note) | **data** | prop on existing component |
| swap panel kind / rows / columns | **data** | union member exists |
| reorder beats, retime `durationInFrames`, drop beat | **data** | array + scalar |
| move component region↔region, re-`align`, `size` tier, `order` | **data** | placement is data |
| add/remove a standalone component the template styles | **data** | composition is a list |
| `layout: split↔center` | **data** | desugars to different region routing |
| swap theme / template / format | **data** | doc fields + desugar |
| background per video | **data** | `background` spec |
| pick a different motion *preset* | **data** | enumerated vocabulary (`names.ts`) |
| **new panel kind** | **PR** | new union member + `panels/*.tsx` + index switch |
| **new standalone component** (`Quote`, `Avatar`) | **PR** | new component + schema type + region eligibility |
| **new region** / free x/y | **PR (free x/y declined)** | named-region model is the on-brand guardrail |
| **new motion preset / easing curve** | **PR** | `names.ts` is code |
| **new template** | **PR** | styling+layout+motion bundle = code |

---

## 6. PHASE-2 EXECUTION DAG

The "5 parallel workstreams" framing is **wrong** — schema/composition underpins the template, CLI, and skill; the rename touches everything. **A file is owned by exactly one stage at a time.**

### STAGE 0 — FOUNDATION (blocks everything)

- **0a. Kind rename.** `src/templates/` → `src/kinds/`: `index.ts` (`TEMPLATES`→`KINDS`, add `meta`), `types.ts` (`Template`→`Kind`, `TemplateOpts`→`KindOpts`, add `KindMeta`), `feature-launch.ts`→`launch.ts`, `changelog-reel.ts`→`changelog.ts`, `milestone.ts`, `parts.ts`. Update importers (`make.ts`, `cli.ts`). Add back-compat aliases `feature-launch→launch`, `changelog-reel→changelog`. **Frees `TEMPLATES`.** OWNS: all of `src/templates/`→`src/kinds/`, importer lines.
- **0b. Composition schema + desugar (no renderer wiring yet).** New `src/schema/composition.ts`; modify `src/schema/beats.ts` (relax `headline`, add `components`, refine; add `template?` to `changelogSchema`). Add `desugarBeat` (`src/schema/desugar.ts`). OWNS: `src/schema/*`. Disjoint from 0a → run 0a∥0b, join before Stage 1. *validates:* every existing beats file still parses; `desugarBeat(legacy)` golden snapshot.
- **0c. Template type/registry skeleton.** `src/templates/types.ts` (new `TemplateStyle`), `active.ts`, `registry.ts`, `field-notebook.ts` (EMPTY shell + `resolveRole`). **Depends on 0a** (name `TEMPLATES` free). OWNS: `src/templates/*` (new).

> **STAGE 0 GATE:** rename done, schema+desugar landed with golden tests, template skeleton compiles.

### STAGE 1 — RENDERER + EXTRACTION (the byte-identical crux)

- **1a. Field-notebook extraction.** Fill `field-notebook.ts` with verbatim literals; make components read from `STYLES`/`MOTION`/`resolveRole`. OWNS: `Headline.tsx`, `panels/*.tsx`, `PanelCard.tsx`, `motion/useMotion.ts`, `brand/tokens.ts`, `field-notebook.ts`.
- **1b. Region-walking `ChangelogScene`.** Consume `desugarBeat(...).components`, group by region, re-composite header+lead text into one `<Headline>`, render `lead/trailing` band with format reflow, footer bar, compute+pass `reveal`. OWNS: `ChangelogScene.tsx`, `prepare.ts`.

> Run **1a then 1b sequentially** (1b's byte-identity depends on 1a's extracted values).
> **STAGE 1 GATE (regression):** full byte-identical render diff of all existing beats files passes. The hard gate — nothing ships without it.

### STAGE 2 — SURFACE (parallel, after Stage 1 gate)

- **2a. CLI verbs.** `new`/`fork`/`edit`, `scripts/_author.ts`, re-point `templates`, add `kinds`, `HELP`. OWNS: `scripts/cli.ts`, `scripts/_author.ts`, `scripts/new.ts`, `scripts/fork.ts`, `scripts/edit.ts`, `scripts/render.ts` (add `--template`, seed theme).
- **2b. New kinds.** `announcement.ts`, `showcase.ts` + `meta` on all five. OWNS: `src/kinds/announcement.ts`, `src/kinds/showcase.ts`, `src/kinds/index.ts`.
- **2c. Skill update.** `SKILL.md` + `references/authoring.md` + `bun run sync-skill`. OWNS: `.claude/skills/cadence/*`. Finalizes after 2a's verb signatures freeze.

**Critical path:** `0a∥0b → 0c → 1a → 1b → [2a, 2b] → 2c`. The rename (0a) and schema (0b) are the only safe true-parallel start; everything stylistic and surface-level is gated on the Stage-1 byte-identity proof.

---

## 7. OPEN DECISIONS (need sign-off before Phase 2)

1. **Region names** — `header/lead/trailing/footer` (4) vs `header/lead/stage/aside/footer` (5). *Recommend 4.*
2. **Per-panel styling location** — `STYLES.panel.byKind.<kind>` vs co-located. *Recommend `byKind`.*
3. **`ColorRole` indirection vs raw values.** *Recommend roles.*
4. **Second template in Phase 2 or deferred.** *Recommend deferring* (Phase 1 ships only `field-notebook`; 2nd template proves the seam but isn't needed for the rewrite).
5. **`edit` verb split** — engine validate-only, NL in skill. *Recommend yes.*
6. **`--template` implies its bound theme, explicit `--theme` wins.** *Recommend yes.*
7. **Version bump** — 0.9.0 vs 1.0.0. *Recommend 0.9.0.*

Smaller: `fork --kind` requires a source flag (no reverse-adapter) — yes; `template?` top-level on `changelogSchema` — yes; `edit` writes in-place (skill holds pre-edit copy) — yes.
