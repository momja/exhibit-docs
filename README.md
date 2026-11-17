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

## Content (end-user guides — how to USE Exhibit, not host it)

- `content/docs/index.mdx` — user guide landing
- `content/docs/what-is-exhibit.mdx` — basic ideas in plain language
- `content/docs/tour.mdx` — sign in, spaces, cards, search, mini-tour
- `content/docs/add.mdx` — the New page: Build with agent / Paste HTML / From URL
- `content/docs/find.mdx` — search, stars, tags, collections, Activity, Shared
- `content/docs/use.mdx` — opening cards, permission prompts, sync expectations
- `content/docs/share.mdx` — Share dialog: public link, people, data modes
- `content/docs/edit.mdx` — edit page: source, widget, permissions, saved data, versions
- `content/docs/agent.mdx` — agent chat UI: context, preview, history, questions
- `content/docs/screenshots.mdx` — image conventions + capture pipeline
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
