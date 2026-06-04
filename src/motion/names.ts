/**
 * Frozen vocabulary of motion preset names. Single source of truth shared by
 * the presets implementation (Sprint A), the beats schema (Sprint B), and
 * MOTION.md. Adding a transition means adding it here first.
 */
export const ENTER_PRESETS = [
  "rise", // translateY up + fade — headlines, cards
  "settle", // scale 1.03→1 + fade — windows/panels arriving
  "bloom", // fade + de-blur — backgrounds
  "type", // character-by-character typewriter — code/terminal
  "stagger", // sequential rise of children — list rows
  "draw", // SVG stroke reveal — diagrams, the NEW badge circle
  "count", // numeric tween 0→value — metrics
] as const;

export const EXIT_PRESETS = [
  "sink", // translateY up + fade out
  "dissolve", // fade out
  "lift", // scale 1→1.02 + fade out
  "cut", // instant
] as const;

export type EnterPreset = (typeof ENTER_PRESETS)[number];
export type ExitPreset = (typeof EXIT_PRESETS)[number];

export const isEnterPreset = (s: string): s is EnterPreset =>
  (ENTER_PRESETS as readonly string[]).includes(s);
export const isExitPreset = (s: string): s is ExitPreset =>
  (EXIT_PRESETS as readonly string[]).includes(s);
