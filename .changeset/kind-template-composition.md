---
"@waits/cadence": minor
---

Two-axis system (kind × template) + a composition layer, with full back-compat.

- **kinds** (structural arc): the old `templates/` is renamed to `kinds/` — `launch` (was `feature-launch`), `changelog` (was `changelog-reel`), `milestone`, plus new `announcement` and `showcase`. Old names keep working as aliases. `cadence kinds` lists them.
- **templates** (stylistic layer): a new layer that owns component styling, layout geometry, motion personality, default backgrounds, and a bound theme. Three ship: `field-notebook` (the existing look, extracted), `terminal` (dark IDE, binds a new `midnight` dark theme), and `instructional` (light editorial). Components read styling from the active template. `cadence templates` lists them; `--template <style>` selects one.
- **composition layer**: a beat can be an explicit list of placeable `components` (Title/Eyebrow/Note/Caption/Badge/Code/Panel) with `placement { region, align, size, order }` over a closed region set (header/lead/trailing/footer). Legacy beats desugar into this model and render byte-identically — every existing beats file keeps working unchanged.
- **CLI**: `cadence new <kind>` (scaffold a durable beats file), `cadence fork` (restyle/retarget), `cadence edit` (deterministic validate/normalize gate), and `cadence kinds`/`cadence templates` listings.
