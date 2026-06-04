# Hill Country Sublime

The house painting style for Secondlayer launch art. One genuine point of view:
**Austin and the Texas Hill Country, painted in the 19th-century Luminist
tradition of the Hudson River School — then exaggerated into sublime fantasy.**

It is not "AI landscape." It is a specific lineage (Bierstadt, Moran, Church)
pointed at a specific place (Austin / Edwards Plateau / the Southwest), composed
deliberately as a *backdrop for software*.

## Why this, and why it's ours

Every chain product reaches for neon-on-black. We reach for a 150-year-old oil
painting of a river at golden hour. The contrast *is* the brand: calm
infrastructure, quiet competence, design as the product. The Field Notebook UI
(Sora, Fira Code, hairlines, one Signal-Blue pointer, one Caveat pink mark) sits
on top of a luminous wilderness — the machine-made precision against the
hand-painted sublime.

## The lineage

Luminism: soft, diffuse, glowing light; a single warm source; deep atmospheric
perspective; drifting haze and god-rays; monumental scale held in a contemplative
stillness. Invisible brushwork. The American sublime — nature as cathedral.

## The fantasy logic

Take a **recognizable Austin landmark** and set it inside a wilderness that is
grander than Texas ever was. The landmark grounds it ("that's the 360 bridge");
the exaggerated terrain makes it myth. We do not invent generic mountains — we
inflate *this* place: the Colorado widened into an alpine basin, limestone bluffs
raised into canyon walls, the caprock pushed into mesas, snow-dusted Southwest
peaks summoned onto the horizon.

Dial it with three settings (`prompts/art/fantasy.ts`):
- **Grounded** — plausibly Texan, only the light idealized.
- **Heightened** — recognizable but sublime. *The default launch register.*
- **Mythic** — full Bierstadt fever-dream; the landmark just barely identifiable.

## Palette

Warm and atmospheric, never garish — and tuned so the brand UI reads on top:
ochre, terracotta, caliche white, sage + cedar green, dusty rose, golden amber,
and a luminous turquoise-to-cream sky. These are warm neutrals with one cool
sky; Signal Blue (#2563eb) and Marker Pink (#ff00aa) stay legible against them.

## Light & composition

- One warm light source, glowing horizon, haze deepening with distance.
- **Composed for UI.** Every painting reserves negative space for the overlay:
  a calm, uncluttered sky in the upper third (for the headline) and a still,
  mirror-like water plane in the lower third (under the code/panel). The focal
  landform sits in the middle distance, slightly off-center. Per-format crops
  (16:9 / 1:1 / 9:16) are encoded in `prompts/art/style.ts → COMPOSITION`.
- A repoussoir element (a foreground bluff, a leaning cedar) anchors one side.

## The landmarks (`prompts/art/landmarks.ts`)

Pennybacker (360) Bridge · UT Tower · Texas Capitol · Congress Ave bridge (bats)
· Mount Bonnell · Enchanted Rock · Hamilton Pool · Barton Springs. Add more as
clauses in the same voice — "in the manner of X" keeps them recognizable without
being literal postcards.

## Workflow

```bash
bun run art --landmark pennybacker --level heightened --format 16x9
bun run art --all --level heightened          # whole Austin board
```
Outputs land in `public/backgrounds/_candidates/` (gitignored) and register in a
manifest. Review them on the `ContactSheet` composition (`remotion still
ContactSheet out/contact.png`), then **move the winners to
`public/backgrounds/`** — those are committed and become beat backgrounds.

## The rule

The painting is the *backdrop*. It never competes with the UI: if a composition
fights the headline or the windows, regenerate it — quiet the sky, lower the
horizon, open the water. The art carries the feeling; the Field Notebook carries
the message.
