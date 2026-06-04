/**
 * Code → themed tokens, run once per beat inside `calculateMetadata` (async, off
 * the render hot path). Primary path is shiki with a brand light theme; if shiki
 * fails to load (e.g. WASM under the bundler), a regex fallback keeps renders
 * working. Output is plain JSON (lines of {content,color}) so it serializes into
 * Remotion input props.
 */
import type { Highlighter } from "shiki";

export type CodeToken = { content: string; color: string };
export type CodeLine = CodeToken[];

export type Lang = "ts" | "tsx" | "bash" | "json";

import { activeTheme } from "../theme";

const C = activeTheme.codeTheme;

const FIELD_NOTEBOOK_LIGHT = {
  name: "field-notebook-light",
  type: "light",
  colors: { "editor.background": activeTheme.codeBg, "editor.foreground": C.fg },
  settings: [
    { settings: { foreground: C.fg } },
    { scope: ["keyword", "keyword.control", "storage", "storage.type", "storage.modifier"], settings: { foreground: C.kw } },
    { scope: ["keyword.operator.new", "keyword.operator.expression.new"], settings: { foreground: C.nw } },
    { scope: ["string", "string.quoted", "string.template", "constant.character"], settings: { foreground: C.str } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: C.num } },
    { scope: ["entity.name.function", "support.function", "meta.function-call.identifier", "entity.name.type", "entity.name.class", "support.class"], settings: { foreground: C.fn } },
    { scope: ["variable", "support.variable", "meta.object-literal.key", "variable.other.property"], settings: { foreground: C.punct } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: C.comment, fontStyle: "italic" } },
    { scope: ["punctuation", "meta.brace", "keyword.operator"], settings: { foreground: C.punct } },
  ],
} as const;

const SHIKI_LANG: Record<Lang, string> = { ts: "typescript", tsx: "tsx", bash: "bash", json: "json" };

let highlighterPromise: Promise<Highlighter> | null = null;
const getHighlighter = async () => {
  if (!highlighterPromise) {
    const { createHighlighter } = await import("shiki");
    highlighterPromise = createHighlighter({
      themes: [FIELD_NOTEBOOK_LIGHT as never],
      langs: ["typescript", "tsx", "bash", "json"],
    });
  }
  return highlighterPromise;
};

export async function tokenize(source: string, lang: Lang): Promise<CodeLine[]> {
  try {
    const hl = await getHighlighter();
    const { tokens } = hl.codeToTokens(source, { lang: SHIKI_LANG[lang] as never, theme: "field-notebook-light" });
    return tokens.map((line) => line.map((t) => ({ content: t.content, color: t.color ?? C.fg })));
  } catch {
    return fallbackTokenize(source, lang);
  }
}

// ─── Regex fallback (resilience only; shiki is the real path) ─────────────────

const TS_KEYWORDS = /\b(import|from|export|const|let|var|new|await|async|return|function|type|interface|for|of|if|else|class|extends)\b/;
const fallbackTokenize = (source: string, lang: Lang): CodeLine[] =>
  source.split("\n").map((line) => {
    if (lang === "bash") {
      const m = line.match(/^(\s*\$?\s*)(\S+)?(.*)$/);
      if (!m) return [{ content: line, color: C.fg }];
      return [
        { content: m[1], color: C.punct },
        { content: m[2] ?? "", color: C.fn },
        { content: m[3] ?? "", color: C.fg },
      ].filter((t) => t.content);
    }
    // crude TS: split on words/strings/numbers, color each chunk
    const out: CodeToken[] = [];
    const re = /("[^"]*"|'[^']*'|`[^`]*`|\b\d+(\.\d+)?\b|[A-Za-z_$][\w$]*|\s+|[^\w\s])/g;
    for (const [tok] of line.matchAll(re)) {
      let color: string = C.punct;
      if (/^["'`]/.test(tok)) color = C.str;
      else if (/^\d/.test(tok)) color = C.num;
      else if (TS_KEYWORDS.test(tok)) color = C.kw;
      else if (/^[A-Za-z_$]/.test(tok)) color = C.fg;
      else if (/^\s+$/.test(tok)) color = C.fg;
      out.push({ content: tok, color });
    }
    return out.length ? out : [{ content: "", color: C.fg }];
  });

/** Code window background, from the active theme. */
export const CODE_BG = activeTheme.codeBg;
