import { loadFont as Sora } from "@remotion/google-fonts/Sora";
import { loadFont as Inter } from "@remotion/google-fonts/Inter";
import { loadFont as PublicSans } from "@remotion/google-fonts/PublicSans";
import { loadFont as Manrope } from "@remotion/google-fonts/Manrope";
import { loadFont as SpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as PlusJakartaSans } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as Outfit } from "@remotion/google-fonts/Outfit";
import { loadFont as DMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as Figtree } from "@remotion/google-fonts/Figtree";
import { loadFont as Epilogue } from "@remotion/google-fonts/Epilogue";
import { loadFont as Archivo } from "@remotion/google-fonts/Archivo";
import { loadFont as WorkSans } from "@remotion/google-fonts/WorkSans";
import { loadFont as Geist } from "@remotion/google-fonts/Geist";
import { loadFont as PlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as Spectral } from "@remotion/google-fonts/Spectral";
import { loadFont as Fraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as FiraCode } from "@remotion/google-fonts/FiraCode";
import { loadFont as JetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as IBMPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as SpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as GeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as Caveat } from "@remotion/google-fonts/Caveat";
import { activeTheme } from "../theme";

// A theme declares fonts as CSS stacks ("Sora, ui-sans-serif, …"); the first
// token is the family we load via @remotion/google-fonts. Importing a loader is
// cheap (just binds a function) — only the active theme's families are actually
// fetched, so a 22-family registry costs nothing per render beyond the ~4 in use.
// Loosely typed: each @remotion/google-fonts loader has a font-specific `style`
// union, so we erase the param types to register them in one map.
// biome-ignore lint/suspicious/noExplicitAny: heterogeneous loader signatures
type GoogleLoader = (...args: any[]) => { waitUntilDone: () => Promise<void> };

const LOADERS: Record<string, GoogleLoader> = {
  Sora,
  Inter,
  "Public Sans": PublicSans,
  Manrope,
  "Space Grotesk": SpaceGrotesk,
  "Plus Jakarta Sans": PlusJakartaSans,
  Outfit,
  "DM Sans": DMSans,
  Figtree,
  Epilogue,
  Archivo,
  "Work Sans": WorkSans,
  Geist,
  "Playfair Display": PlayfairDisplay,
  Spectral,
  Fraunces,
  "Fira Code": FiraCode,
  "JetBrains Mono": JetBrainsMono,
  "IBM Plex Mono": IBMPlexMono,
  "Space Mono": SpaceMono,
  "Geist Mono": GeistMono,
  Caveat,
};

/** First family of a CSS stack, e.g. "Sora, ui-sans-serif" → "Sora". */
const primary = (stack: string) => stack.split(",")[0].trim();

const families = new Set(
  [activeTheme.fonts.display, activeTheme.fonts.body, activeTheme.fonts.mono, activeTheme.fonts.note].map(primary),
);
const loaded = [...families]
  .map((f) => LOADERS[f])
  .filter(Boolean)
  .map((load) => load("normal", { subsets: ["latin"] }));

/** Active font stacks (from the theme). */
export const FONTS = activeTheme.fonts;

/** Await before a still / Lambda render — fonts load async; capture real faces. */
export const waitForFonts = () => Promise.all(loaded.map((f) => f.waitUntilDone()));
