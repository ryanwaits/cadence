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

`cadence --help` prints the commands (`create`, `storyboard`, `study`, `audit`,
`redesign`, `guide`, plus the `render`/`changes`/`art`/`templates`/`themes`
utilities) and the flags shared by `create`/`render`/`redesign`/`storyboard`:
`--format 16x9|1x1|9x16`, `--theme <name>`, `--theme-file <path>`, `--frame <n>`,
`--out <dir>`.

---

## Per-project setup (`.cadence/`)

Cadence anchors its work to the target repo, not your current directory. A repo
can carry its own cadence config under `<project>/.cadence/`:

- **`<project>/.cadence/theme.json`** — your brand (colors, mono font, code
  syntax + chrome). Cadence auto-discovers it when run against the project, so
  every render takes on *your* palette without a `--theme-file` flag.
- **`<project>/.cadence/out`** — where finished MP4s, stills, and the generated
  beats land (instead of `./out`). Override with `--out <dir>`.
- **`<project>/.cadence/backgrounds/`** — where generated art lands when you run
  `cadence art` against the project.

No project-specific files live in the cadence engine itself. Full walkthrough of
the convention: **[project-setup.md](project-setup.md)**. For the brand / theme
detail see **[branding-and-formats.md](branding-and-formats.md)**; for the
generated-art workflow see **[Branding, Themes & Formats](branding-and-formats.md)**.

---

## A 60-second first video

The deterministic, no-LLM path reads a GitHub release, lays out the features, and
renders — one command:

```bash
cadence create --release owner/name --install "npm i your-pkg"
```

What happens:

1. Cadence reads the latest release from `owner/name` (via the `gh` CLI).
2. It builds the beats with the default `changelog` arc.
3. It renders to an MP4.

> This one-shot path defaults to the `changelog` arc and the default look. Pick the
> arc with `--kind` and the look with `--template` (see the flags table below), or use
> the durable flow — `cadence new <kind> --template <style>` → edit → `cadence create
> <file>` — for full control. See **[Videos](videos.md)**.

The finished video lands in the project's **`.cadence/out`** (or `./out` if the
repo has no `.cadence/` dir), alongside the generated `make-<product>.beats.json`
it rendered from.

### Preview before you render

A full render takes a moment. Preview first — get the whole plan plus one still
per beat (no MP4) so you can check the features, pacing, theme, and backgrounds
cheaply. Pass `--dry-run` to `create`, or run `storyboard` directly on a beats
file:

```bash
cadence create --release owner/name --install "npm i your-pkg" --dry-run
cadence storyboard .cadence/out/make-your-pkg.beats.json   # same preview, on a beats file
```

Each writes a `<name>.storyboard.png` contact sheet. To check a single frame at
full fidelity instead, use `--frame <n>` — it writes one PNG rather than the MP4:

```bash
cadence create --release owner/name --install "npm i your-pkg" --frame 150
```

### Useful flags on `create`

| Flag | What it does |
| --- | --- |
| `--release owner/name` | Source the video from a GitHub release |
| `--changelog ./CHANGELOG.md` | Source from a changelog file instead |
| `--install "npm i your-pkg"` | The verified install line to show |
| `--kind <arc>` | The structural arc: `changelog` (default), `launch`, `milestone`, `announcement`, `showcase` |
| `--template <style>` | The visual template: `field-notebook` (default), `terminal`, `instructional` |
| `--format 16x9 \| 1x1 \| 9x16` | Aspect ratio |
| `--theme <name>` | One of the 18 built-ins (`cadence themes`) |
| `--theme-file <path>` | A custom theme JSON (e.g. from `cadence study`) |
| `--frame <n>` | Render a single still PNG instead of the MP4 |
| `--dry-run` | Preview only — plan + one still per beat, no MP4 |
| `--out <dir>` | Override the output dir (default: `.cadence/out` or `./out`) |
| `--headline "…"` | Override the opening headline |
| `--stat-value` / `--stat-label` / `--stat-sub` | Inject a headline stat |

You can also hand `create` a beats file directly — `cadence create my.beats.json
--format 9x16` — and it renders that instead of the repo flow (add `--dry-run` to
storyboard it rather than render).

---

## The command surface

| Command | What it does |
| --- | --- |
| `cadence create` | A repo OR a beats file → a video (the main entry point) |
| `cadence storyboard <beats>` | A beats file → a preview sheet (plan + one still per beat, no MP4) |
| `cadence study` | A brand color / URL / screenshot → a theme JSON |
| `cadence audit <beats>` | Check a beats file for issues |
| `cadence redesign <beats>` | Re-skin a beats file with a new look |
| `cadence guide` | Interactive walkthrough — start here |
| `cadence render <beats>` | A beats file → an MP4 (`create` delegates here for beats files) |
| `cadence changes` | A repo → an `UpdateManifest` (JSON) |
| `cadence art` | Generate painterly backgrounds (optional, needs `OPENAI_API_KEY`) |
| `cadence templates` / `cadence themes` | List the built-in templates / themes |

Shared by `create` / `render` / `redesign` / `storyboard`:
`--format 16x9｜1x1｜9x16`, `--theme <name>`, `--theme-file <path>`, `--frame <n>`,
`--out <dir>`.

---

## Editor matrix

The skill works the same across editors that share the standard skill layout —
**Claude Code, Cursor, and Codex**. Install it once with
`npx skills add ryanwaits/cadence` and ask your agent in whichever you use.

---

## Optional: painterly backgrounds (the only API-key part)

The default backdrop is procedural and needs no key. To swap in a painted
backdrop, `cadence art` generates one from any prompt:

```bash
cadence art --prompt "misty redwood coastline at dawn" --name redwood
```

Art lands in the project's `.cadence/backgrounds/` (under `_candidates/` until you
`--promote` it). This is the **only** part of the toolchain that calls an external
API, requiring `OPENAI_API_KEY`. Full workflow — prompts, branding, promoting,
referencing the result in a beat — in
[Branding, Themes & Formats](branding-and-formats.md).
