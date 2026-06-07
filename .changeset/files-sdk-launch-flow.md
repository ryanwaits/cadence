---
"@waits/cadence": minor
---

New `browser` panel kind (Finder-style folder/file listing) and an inverted launch flow for the `feature-launch` template.

- **`browser` panel** — a result card that pairs beside a code window: sectioned folder/file rows (folders get a chevron, files a right-aligned size), e.g. the result of a `list({ prefix, delimiter })` call.
- **`hero` beat flag** — render a centered title card (big headline + `caption` as a sub-tagline) to close on.
- **`feature-launch` default flow change** — it now opens on the install terminal (`$ npm i pkg` + feature pills) and closes on a hero title card (package + tagline), matching a launch-reel structure. Pass `flow: "title-open"` to keep the previous title-open / install-close behavior. `milestone` and `changelog-reel` are unchanged.
