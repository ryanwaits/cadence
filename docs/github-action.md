# GitHub Action — auto-video on every release

`action.yml` is a composite action that reads a GitHub release and renders a
changelog video in the runner (local render — free, no AWS, no LLM). It's the
recurring wedge: ship a release, get a video.

## Use it in your repo

```yaml
# .github/workflows/cadence.yml
name: Changelog video on release
on:
  release:
    types: [published]
jobs:
  video:
    runs-on: ubuntu-latest
    steps:
      - id: video
        uses: <owner>/<this-repo>@v1
        with:
          install: "npm i your-package"          # real install line for the closer
          kind: changelog                         # the arc: changelog | launch | milestone | announcement | showcase
          format: "16x9"                          # or 1x1 | 9x16
          background: "gradient:#312e81,#0b1120"  # or image:/solid:
          # theme-file: themes/yourbrand.json     # optional brand colors
      - uses: actions/upload-artifact@v4
        with: { name: cadence, path: "${{ steps.video.outputs.video }}" }
      - env: { GH_TOKEN: "${{ github.token }}" }
        run: gh release upload "${{ github.event.release.tag_name }}" "${{ steps.video.outputs.video }}" --repo "${{ github.repository }}"
```

`repo` and `tag` default to the release that triggered the run. It reads the
release notes with the runner's `GITHUB_TOKEN`, parses them into a manifest,
applies the kind (the arc), and renders. The MP4 is exposed as `outputs.video`.

## Brand colors

Generate a theme once and commit it, then pass `theme-file`:

```bash
cadence study --from-url https://yourbrand.dev --name yourbrand   # → themes/yourbrand.json
```

## Notes / limits

- **Local render in the runner** is free and runs entirely on your own GitHub
  Actions minutes — no hosted service. Keep videos short (the arcs are);
  renders are bounded by runner memory/time.
- Remotion downloads a headless Chrome on first render (adds ~30-60s).
- Artifacts expire; the example also `gh release upload`s the MP4 so it's permanent.
- Commercial rendering by a company may require a Remotion Company License — that
  obligation is yours (the rendering party), the same as any tool built on Remotion.

## Status

Built and self-contained; validate by pushing this repo to GitHub and publishing a
test release (the workflow at `.github/workflows/example-release-video.yml` runs it
against this repo). Not yet exercised in CI.
