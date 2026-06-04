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
  /** Light [from, to] gradient for the procedural default backdrop (Background "shapes"). */
  backdrop?: [string, string];
};
