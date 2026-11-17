# Screenshots framework

Curated captures for the docs. Source of truth for *how* images get made.

## Layout

- `screenshots.config.json` — routes, viewport, output dir (`public/screenshots`).
- `capture.mjs` — Playwright script; run via `npm run screenshots` from repo root.
- Output goes to `../../public/screenshots/<name>.png`.

## Run

```bash
# one-time setup
npm i -D playwright
npx playwright install chromium

# terminal 1 — Exhibit (from the Exhibit checkout)
make build && ./bin/server
# serves http://localhost:8080

# terminal 2 — docs site (here)
npm run dev
# serves http://localhost:3000

# terminal 3 — capture
EXHIBIT_URL=http://localhost:8080 DOCS_URL=http://localhost:3000 npm run screenshots
```

Edit `screenshots.config.json` to add a shot:

```json
{ "name": "gallery-search", "path": "/search", "waitFor": "main" }
```

Use `"base": "docs"` for docs-site pages.

## Rules

- Kebab-case filenames, `![caption](/screenshots/<name>.png)` in MDX.
- Keep each file < ~500KB.
- Only curated images belong in `public/screenshots/` — no review dumps.
- Placeholders (`*.svg`) are fallbacks until real PNGs land.
