# Exhibit Docs

Fumadocs site covering how [Exhibit](https://github.com/momja/Exhibit) works.
Seeded small: core mental model, quickstart, gallery workflows, and a
screenshot framework.

## Develop

```bash
npm install
npm run dev
# open http://localhost:3000/docs
```

## Content

- `content/docs/index.mdx` — landing
- `content/docs/what-is-exhibit.mdx` — concepts + stack
- `content/docs/quickstart.mdx` — run it, save first tool
- `content/docs/how-it-works.mdx` — two origins, one write path
- `content/docs/using-the-gallery.mdx` — day-to-day workflows
- `content/docs/screenshots.mdx` — image conventions + pipeline
- `content/docs/meta.json` — sidebar order

Images live in `public/screenshots/` and are referenced root-absolute:
`![caption](/screenshots/gallery-home.png)`.

## Screenshots

See `scripts/screenshots/README.md`. TL;DR:

```bash
npm i -D playwright
npx playwright install chromium
EXHIBIT_URL=http://localhost:8080 DOCS_URL=http://localhost:3000 npm run screenshots
```

## Source of truth

Long-form spec stays in `momja/Exhibit` (`README.md`, `docs/`). These pages are
the friendly on-ramp, not a fork.
