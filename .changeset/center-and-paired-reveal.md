---
"@waits/cadence": patch
---

Three split/center-beat refinements:

- **Center beats are truly vertically centered.** `layout:"center"` (install opener/closer, hero) now centers its content in the full frame instead of sitting in the lower band.
- **Paired code+panel beats show both cards at once.** The result panel's card + header now mount immediately alongside the code window; only the panel's *content* (rows, counters, draws) waits for the code to finish typing — via a new `reveal` frame offset threaded to every panel. Previously the whole panel was hidden until the code was done.
- **Softer headline scrim.** The white-text shadow over image backgrounds is ~halved and re-tinted from near-black to slate, so it reads without looking like a heavy outline.
