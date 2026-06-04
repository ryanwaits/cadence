# Motion vocabulary

The controlled lexicon every changelog beat speaks. Each name is implemented in
`src/motion/presets.ts`, frozen in `src/motion/names.ts`, and resolved by the
`useMotion` hook (`src/motion/useMotion.ts`). Beats reference these names as
strings — they never inline animation code.

## Principles (from the product DESIGN.md)

- **Ease-out only. No bounce, no elastic, never animate layout.** Entrances move
  opacity + `transform`/`filter`, not width/height/top/left.
- **Two easings, two jobs.**
  - `smooth` — `cubic-bezier(0.19, 1, 0.22, 1)`. Pure ease-out. **Every entrance.**
  - `snappy` — `cubic-bezier(0.175, 0.885, 0.32, 1.1)`. Has a deliberate slight
    settle/overshoot. **State-feedback pops only** (the NEW badge, a toggle) —
    never a big entrance.
- **Respect reduced-motion.** Every preset has a `reduced` variant that drops to
  opacity-only.
- **Signal Blue ≤10%, one Marker-Pink gesture per scene** (the `draw`n NEW badge).

## Enter presets

| Name | Motion | Use for |
|------|--------|---------|
| `rise` | translateY ↑ + fade | headlines, single cards |
| `settle` | scale 1.03→1 + fade | windows, data panels arriving |
| `bloom` | fade + blur 8px→0 | painting backgrounds |
| `type` | character-by-character typewriter | code, terminal lines |
| `stagger` | sequential `rise` of children | list / table rows |
| `draw` | SVG stroke reveal | diagrams, the NEW badge circle (Marker Pink) |
| `count` | numeric tween 0→value | metrics, counters |

`type` / `draw` / `count` carry their value internally — the preset gates
visibility, the helpers (`typewriterChars`, `drawDashoffset`, `countValue`,
`staggerDelay`) drive the value.

## Exit presets

| Name | Motion | Use for |
|------|--------|---------|
| `sink` | translateY ↑ + fade out | headlines leaving |
| `dissolve` | fade out | most panels / code |
| `lift` | scale 1→1.02 + fade out | a window departing forward |
| `cut` | instant | hard scene change |

## Style taxonomy — what each content type speaks

The default grammar a beat follows unless overridden. This is the "language":
pick the row, get the motion.

| Content | Enter | Exit | Easing | Notes |
|---------|-------|------|--------|-------|
| Headline | `rise` | `sink` | smooth | eyebrow = Caveat marker-pink, `draw`n in after |
| Eyebrow / NEW badge | `draw` | `dissolve` | smooth | the one human flourish; Marker Pink |
| Code window | `settle` + `type` | `dissolve` | smooth | caret blinks; typing is internal |
| Terminal line | `type` | `dissolve` | smooth | mono, single line |
| Data panel | `settle`, rows `stagger` | `dissolve` | smooth | "streaming…" pulse is ambient, not an entrance |
| Diagram | `draw` (edges) + `settle` (nodes) | `dissolve` | smooth | one filled accent node |
| Metric | `count` | `dissolve` | smooth | Fira Code, tabular-nums |
| Background | `bloom` + Ken Burns | `dissolve` | smooth | slow push-in over the whole beat |

## MotionSpec

```ts
{ enter?, exit?, easing?: "smooth" | "snappy", delay?, durationInFrames?, distance? }
```

`delay` and `durationInFrames` are in frames; `distance` is px travel for `rise`.
`easing` defaults to `smooth`. See the live `MotionReel` composition for each
preset playing.
