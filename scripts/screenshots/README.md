# Screenshots framework

Curated captures for the docs. Source of truth for *how* images get made.

## Layout

- `screenshots.config.json` — routes, viewport, output dir (`public/screenshots`),
  plus optional `auth.storageState` (global) and per-shot `storageState`.
- `capture.mjs` — Playwright script; run via `npm run screenshots` from repo root.
  Fail-loud: exits 1 if any shot fails (see below).
- Output goes to `../../public/screenshots/<name>.png`.

## One-time setup

```bash
# from this repo (exhibit-docs)
npm install
npx playwright install chromium
```

Browsers are environment-specific and are **not** vendored through npm —
every machine that captures runs `npx playwright install chromium` once.
`playwright` itself *is* a devDependency, so `npm install` provides the runner.

## Run

```bash
# terminal 1 — Exhibit (from the Exhibit checkout)
make build && ./bin/server
# serves http://localhost:8080

# terminal 2 — docs site (here)
npm run dev
# serves http://localhost:3000

# terminal 3 — capture
EXHIBIT_URL=http://localhost:8080 DOCS_URL=http://localhost:3000 npm run screenshots
```

`EXHIBIT_URL` / `DOCS_URL` override `screenshots.config.json`
(`exhibitUrl` / `docsUrl`). Edit the config to add a shot:

```json
{ "name": "gallery-search", "path": "/search", "waitFor": "main" }
```

Use `"base": "docs"` for docs-site pages. Docs pages are public and need no
auth by default.

## Signed-in captures (storage state)

Exhibit pages that require sign-in redirect to a login page when captured
signed out — and the runner **fails** those shots instead of saving the
login page (see fail-loud behavior).

To capture a signed-in page:

1. Create the storage-state file once with a headed login. Either use
   codegen and sign in manually:

   ```bash
   npx playwright codegen http://localhost:8080 --save-storage=scripts/screenshots/auth-exhibit.json
   # sign in inside the opened browser, then close it
   ```

   or write a small login script that fills your credentials and calls
   `context.storageState({ path: 'scripts/screenshots/auth-exhibit.json' })`.

2. Reuse it — per shot or globally (paths resolve relative to the repo root):

   ```json
   { "name": "gallery-mine", "path": "/", "waitFor": "main", "storageState": "scripts/screenshots/auth-exhibit.json" }
   ```

   ```json
   { "auth": { "storageState": "scripts/screenshots/auth-exhibit.json" } }
   ```

   A per-shot `storageState` wins; otherwise the global `auth.storageState`
   applies; shots with neither run signed out.

3. Never commit the storage-state file — it contains session cookies.
   It is git-ignored; each capturer creates their own.

## Fail-loud behavior

`npm run screenshots` exits 0 only when **every** shot captures. Any shot
fails (and the run exits 1) when:

- navigation fails or times out;
- the HTTP status is not 2xx (error pages are never saved as screenshots);
- the final URL is a login/auth redirect — the error records expected vs
  actual URL, e.g.
  `login/auth redirect: expected http://localhost:8080/ (/) but landed on
  http://localhost:8080/login (/login)`;
- the configured `waitFor` selector never appears (missing element =
  failure, not warn-and-continue);
- the `storageState` file is missing, or the screenshot cannot be written.

Output ends with a per-shot summary:

```text
summary: 3 passed, 1 failed (4 total).
  PASS gallery-home
  FAIL gallery-search — waitFor selector "main" not found within 10000ms ...
```

Fix the cause and re-run; partial output is kept but the non-zero exit
signals the docs images are incomplete.

## Verification status

> Not yet verified end-to-end against a seeded Exhibit library. The runner
> was hardened to fail loudly, but no full capture against a real gallery
> (with PNGs on disk) has been completed in this repo yet.

Manual verification steps:

1. Seed a local Exhibit library with representative content.
2. Start Exhibit (`./bin/server`) and the docs dev server (`npm run dev`).
3. Run `npm run screenshots` — expect `summary: N passed, 0 failed` and
   exit 0, with one PNG per config entry in `public/screenshots/`.
4. If Exhibit requires sign-in, create `auth-exhibit.json` per the runbook
   above first; without it, signed-in shots fail with a login-redirect
   error (by design).
5. Confirm the failure mode is loud: stop the Exhibit server and re-run —
   expect `FAIL` lines and exit code 1, not a silent success.

## Rules

- Kebab-case filenames, `![caption](/screenshots/<name>.png)` in MDX.
- Keep each file < ~500KB.
- Only curated images belong in `public/screenshots/` — no review dumps.
- Placeholders (`*.svg`) are fallbacks until real PNGs land.
- `screenshots.config.json` is pure JSON (no comments) — new fields are
  documented here and in `content/docs/screenshots.mdx`, not inline.
