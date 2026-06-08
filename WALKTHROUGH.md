# Walkthrough — what this is, how it works, how to adjust it

Run the interactive version any time: **`bun run cli guide`**. This doc is the map.

## The one-line idea

Point it at a repo / release → get an on-brand changelog or announcement video.
Honest (real code/data, never fabricated) and branded (your colors/fonts), which is
what generic AI video can't do.

## The pipeline

```
repo ─[adapter]→ UpdateManifest ─[template]→ beats ─[engine]→ mp4
                                     ▲            ▲
                                 themeable    no LLM (deterministic)
```

There are **two ways** to make the beats:
- **Deterministic kinds** (`cli create --release …`) — fast, no LLM, honest by
  omission (shows feature titles + the real install, no invented code). This is what
  the GitHub Action uses.
- **The brain (the `cadence` skill)** — reads the target repo's *types* to
  write real code snippets (the honesty ladder: types → examples → README →
  install-only, never invent). Higher fidelity, needs an LLM in the loop.

## Stage by stage (and where to adjust each)

| Stage | What it does | Files | Adjust / extend |
|------|--------------|-------|-----------------|
| **Adapter** | release notes / changelog → `UpdateManifest` | `src/adapters/` (`parse.ts`, `index.ts`) | parsing heuristics, what counts as a "feature" |
| **Kind** | manifest → beats (the structural arc) | `src/kinds/` | add a kind → register in `kinds/index.ts` |
| **Template** | the styling layer (scale/weight/spacing/motion + bound theme) | `src/templates/` | add a template → register in `templates/registry.ts` |
| **Schema** | the beats + composition contract (zod, `.strict()`) | `src/schema/` (`beats.ts`, `composition.ts`, `primitives.ts`) | new beat/component/panel fields |
| **Engine** | beats → video (Remotion) | `src/components/` | `ChangelogScene` (region walk), `layout/` (containers), `CodeWindow`, `Headline`, `panels/*` |
| **Panels** | the "output window" | `src/components/panels/` + `registry.ts` | add a panel → one schema entry + component + a `PANEL_REGISTRY` line |
| **Motion** | named enter/exit transitions | `src/motion/` + `MOTION.md` | new preset → `names.ts` + `presets.ts` + doc |
| **Theme** | colors, fonts, code palette, shadow | `src/theme/` | add a preset, or `cli theme` to derive one |
| **Style packs** | background: gradient / solid / image | `src/components/Background.tsx` | new pack mode |
| **Render** | TS/JSON beats → mp4 | `scripts/render.ts` | flags, output |

## Commands

```bash
cli guide                                   # interactive walkthrough (start here)
cli changes --release owner/name            # see the parsed manifest
cli new <kind> --release owner/name --install …    # repo → a durable beats file (no render)
cli edit <beats.json>                       # validate + normalize gate (re-run after each edit)
cli storyboard <beats.json>                 # preview: plan + one still per beat (no MP4)
cli create <repo|beats.json> [--format 9x16] [--template terminal] [--theme slate]   # render the MP4
cli study --from-url https://brand.dev --name brand   # → themes/brand.json
cli kinds | templates | themes              # list the three axes
cli art --landmark pennybacker --level heightened     # painterly backgrounds
bun run check && bun run check:render && bun run check:motion && bun run check:skill   # the gates
```

## The two key invariants (don't break these)

1. **Honest code.** Never show an API that isn't real. The deterministic path avoids
   code entirely; the skill verifies symbols against the repo. This is the product's
   credibility.
2. **No baked-in brand.** The engine reads identity from the theme + style pack. A
   customer's video is their brand because the theme is theirs, not ours.

## Authoring a video by hand

A video is a `src/content/<name>.beats.ts` (default-exported `ChangelogInput`). See
`sdk-6.5-mempool.beats.ts` (SDK), `clarinet-3.18.beats.ts` (CLI), `gradient-demo`
(AI-free), and the `streams-launch` showcase. Full field reference:
`.claude/skills/cadence/references/authoring.md`.

## Going to production

- **Ship on release:** `docs/github-action.md` — auto-render a video on every release,
  free, on your own GitHub Actions minutes (no hosted service).
