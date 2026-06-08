/**
 * A video theme. The engine reads colors/shadow/code surfaces from the active
 * theme; nothing in the components hardcodes a brand. Fonts are loaded separately
 * (see brand/fonts.ts) and become themeable with custom fonts later.
 */
export type ThemeColors = {
  ink: string;
  paper: string;
  paperElevated: string;
  chrome: string;
  hairline: string;
  hairlineHover: string;
  textMuted: string;
  textDim: string;
  /** The single pointing accent. */
  signalBlue: string;
  signalBlueSoft: string;
  signalBlueBorder: string;
  /** One human-flourish color. */
  markerPink: string;
  /** Version / NEW marker (eyebrow + pill). */
  gold: string;
  goldSoft: string;
  /** Warm off-white for headlines over imagery. */
  titleWhite: string;
  successGreen: string;
  warningYellow: string;
  dangerRed: string;
  infoBlue: string;
  accentTeal: string;
};

/**
 * Runtime list of color-role names — the single source for the schema enum that
 * constrains a node's `style.color`/`bg` to *roles* (never raw hex), so per-node
 * overrides stay themeable (a theme swap still re-colors them). Kept exactly in
 * sync with `ThemeColors` by the static assertion below: drift is a tsc error.
 */
export const COLOR_ROLES = [
  "ink", "paper", "paperElevated", "chrome", "hairline", "hairlineHover", "textMuted", "textDim",
  "signalBlue", "signalBlueSoft", "signalBlueBorder", "markerPink", "gold", "goldSoft", "titleWhite",
  "successGreen", "warningYellow", "dangerRed", "infoBlue", "accentTeal",
] as const;

// COLOR_ROLES must equal keyof ThemeColors exactly (both directions) — else tsc fails here.
type _RolesMatch = [keyof ThemeColors] extends [(typeof COLOR_ROLES)[number]]
  ? [(typeof COLOR_ROLES)[number]] extends [keyof ThemeColors]
    ? true
    : never
  : never;
const _rolesMatch: _RolesMatch = true;
void _rolesMatch;

/** Syntax-highlight palette for the code window. */
export type CodeTheme = {
  fg: string;
  kw: string; // keywords (import/const/await)
  nw: string; // new / constructor
  str: string; // strings
  num: string; // numbers
  fn: string; // functions / types
  punct: string; // punctuation
  comment: string;
};

/** Font family stacks (must reference families loaded in brand/fonts.ts). */
export type ThemeFonts = {
  display: string;
  body: string;
  mono: string;
  note: string;
};

export type ThemeConfig = {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  /** Floating window/panel shadow. */
  floatShadow: string;
  /** Code window background. */
  codeBg: string;
  /** Typewriter caret fill. */
  caretBg: string;
  /** Syntax colors. */
  codeTheme: CodeTheme;
  /**
   * Code window chrome. `"window"` (default) is a floating editor with traffic-
   * light dots + a filename tab; `"minimal"` is chromeless (just the code surface)
   * to match a docs-style snippet component.
   */
  codeChrome?: "window" | "minimal";
  /** Light [from, to] gradient for the procedural default backdrop (Background "shapes"). */
  backdrop?: [string, string];
};
