# Ship on Release (CI)

Publish a release, get a video. Drop in the included GitHub Action and every
GitHub release renders an announcement / changelog MP4 — on your own Actions
runner, free, no hosted service and no API key.

This is the quick "ship a video on every release" walkthrough. For the full
input reference and the working example workflow, see
**[github-action.md](../github-action.md)**.

## The goal

Cadence is local-first: a render runs entirely on your machine. CI is the same
render moved onto your runner. The action reads the release that triggered it,
parses the notes into beats, applies a template, and renders the MP4 — the exact
`cadence create --release …` you'd run locally, now automatic on `release:
published`.

## Minimal workflow

```yaml
# .github/workflows/release-video.yml
name: Release video
on:
  release:
    types: [published]
jobs:
  video:
    runs-on: ubuntu-latest
    steps:
      - id: video
        uses: ryanwaits/cadence@v1
        with:
          install: "npm i your-pkg"   # the real install line shown in the closer
```

That's the whole thing. `repo` and `tag` default to the release that triggered
the run, so the action reads its notes with the runner's `GITHUB_TOKEN` and
renders. The rendered MP4 path is exposed as the `video` output.

## Where the video lands

The action does **not** upload anywhere — it renders, copies the MP4 to
`cadence.mp4` at the workspace root, and sets `outputs.video` to that path. Add a
step to keep it.

Attach it to the release (permanent):

```yaml
      - env: { GH_TOKEN: "${{ github.token }}" }
        run: gh release upload "${{ github.event.release.tag_name }}" "${{ steps.video.outputs.video }}" --repo "${{ github.repository }}"
```

Or upload it as a build artifact (expires per your retention settings):

```yaml
      - uses: actions/upload-artifact@v4
        with: { name: cadence, path: "${{ steps.video.outputs.video }}" }
```

## Common config

All inputs are optional. The ones you'll reach for most, mapped to the action's
real inputs:

| Input        | What it does                                            | Example                          |
| ------------ | ------------------------------------------------------- | -------------------------------- |
| `install`    | Real install command shown in the closer                | `"npm i your-pkg"`               |
| `template`   | the arc/kind: `changelog` \| `launch` \| `milestone` (legacy aliases `changelog-reel` / `feature-launch` accepted) | `changelog-reel` (default)       |
| `format`     | `16x9` \| `1x1` \| `9x16`                                | `9x16` for a vertical reel       |
| `background` | `gradient:#a,#b` \| `solid:#hex` \| `image:file.png`    | `gradient:#312e81,#0b1120`       |
| `theme-file` | Path to a committed theme JSON for brand colors         | `themes/yourbrand.json`          |
| `repo`       | `owner/name` to read the release from                   | defaults to the current repo     |
| `tag`        | Release tag to render                                   | defaults to the triggering release |

> Note: the Action's `template` input is the legacy name for the structural **kind**
> (the arc). The standalone CLI splits this into `cadence new <kind>` for the arc and
> `--template <style>` for the look; the Action keeps the single `template` input.

### Branding CI renders

Locally, a repo's `.cadence/theme.json` is auto-discovered and brands every
render with no flag (see
**[Per-Project Setup](project-setup.md)**). The same file brands CI: commit
`.cadence/theme.json` and point `theme-file` at it (`theme-file:
.cadence/theme.json`) so the runner renders in the identical brand. You can also
generate a standalone theme once with `cadence study --from-url`, commit it
(e.g. `themes/yourbrand.json`), and pass that — either way the CI render matches
what you saw locally. See the full input reference in
**[github-action.md](../github-action.md)**.

## Local-first equivalence

The action is not a different code path. It runs:

```bash
cadence create --release owner/name --template changelog --format 16x9 --install "npm i your-pkg"
```

— the same command you run on your laptop, with each `with:` input mapped to a
flag. Tune it locally first (`cadence create --release … --frame 150` for a fast
still), and CI will produce the same video on every release.

> Renders run free on your own GitHub Actions minutes — no hosted service, no
> key. The only part of the toolchain that calls an external API is the optional
> painterly background pack, which CI doesn't touch.
