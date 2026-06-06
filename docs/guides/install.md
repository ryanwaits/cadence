# Installation & Quickstart

Cadence is a changelog video engine that refuses to fabricate your product. Point
it at a repo or a release and get an on-brand launch / changelog / announcement
video — real code from your project, your colors, rendered locally. No invented
APIs, no hosted service, no API key.

There are two ways to drive it: **ask your agent** (the skill) or **run the CLI**.
Both produce the same MP4s, locally and free.

---

## Path A — Ask your agent (the skill)

Install the skill into Claude Code, Cursor, or Codex:

```bash
npx skills add ryanwaits/cadence
```

Then just ask, from inside your project:

> *"make a changelog video for this release"*

The agent reads your repo, writes the beats (a small `*.beats.json`), and renders
an MP4 — showing only code it can verify in your repo.

---

## Path B — The CLI

### Prerequisites

- **Node** — used to run the `cadence` bin (it spawns `tsx` under the hood).

That's it for rendering. Rendering is 100% local and free; no API key is involved.

### Install

Two supported paths:

```bash
# 1. Global binary — a persistent `cadence` command
npm i -g @waits/cadence
cadence themes

# 2. No install — run it with npx
npx @waits/cadence themes
```

(Inside the engine repo itself, the same verbs run via `bun run cli …`.)

### Verify it works

```bash
cadence themes      # list the 18 built-in themes
cadence --help      # the full verb list and shared flags
```

`cadence --help` prints the commands (`create`, `study`, `audit`, `redesign`,
`guide`) and the flags shared by `create`/`render`/`redesign`:
`--format 16x9|1x1|9x16`, `--theme <name>`, `--theme-file <path>`, `--frame <n>`.

---

## A 60-second first video

The deterministic, no-LLM path reads a GitHub release, lays out the features, and
renders — one command:

```bash
cadence create --release owner/name --install "npm i your-pkg"
```

What happens:

1. Cadence reads the latest release from `owner/name` (via the `gh` CLI).
2. It applies a template (default: `changelog-reel`) to build the beats.
3. It renders to an MP4.

The finished video lands in **`out/`**, alongside the generated
`out/make-<product>.beats.json` it rendered from.

### Preview a still first

A full render takes a moment. To check the look fast, ask for a single frame with
`--frame <n>` — it writes a PNG to `out/` instead of an MP4:

```bash
cadence create --release owner/name --install "npm i your-pkg" --frame 150
```

### Useful flags on `create`

| Flag | What it does |
| --- | --- |
| `--release owner/name` | Source the video from a GitHub release |
| `--changelog ./CHANGELOG.md` | Source from a changelog file instead |
| `--install "npm i your-pkg"` | The verified install line to show |
| `--template <name>` | Pick a template (`cadence templates` to list) |
| `--format 16x9 \| 1x1 \| 9x16` | Aspect ratio |
| `--theme <name>` | One of the 18 built-ins (`cadence themes`) |
| `--theme-file <path>` | A custom theme JSON (e.g. from `cadence study`) |
| `--frame <n>` | Render a single still PNG instead of the MP4 |
| `--headline "…"` | Override the opening headline |
| `--stat-value` / `--stat-label` / `--stat-sub` | Inject a headline stat |

You can also hand `create` a beats file directly — `cadence create my.beats.json
--format 9x16` — and it renders that instead of the repo flow.

---

## Editor matrix

The skill works the same across editors that share the standard skill layout —
**Claude Code, Cursor, and Codex**. Install it once with
`npx skills add ryanwaits/cadence` and ask your agent in whichever you use.

---

## Optional: painterly backgrounds (the only API-key part)

The default backdrop is procedural and needs no key. An optional pack swaps in
landscape-painting backdrops via `cadence art` — and is the **only** part of the
toolchain that calls an external API, requiring `OPENAI_API_KEY`. See
[ART-DIRECTION.md](../../ART-DIRECTION.md).
