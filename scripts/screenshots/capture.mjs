/**
 * Capture screenshots for the docs.
 *
 * Usage:
 *   EXHIBIT_URL=http://localhost:8080 DOCS_URL=http://localhost:3000 npm run screenshots
 *
 * Reads ./screenshots.config.json, visits each route with Playwright Chromium,
 * and writes PNG files into ../../public/screenshots/.
 *
 * Fail-loud behavior: every shot must succeed. The runner exits 1 if any shot
 * fails — non-2xx HTTP status, login/auth redirect, missing `waitFor`
 * selector, absent storage-state file, or screenshot write error. Nothing is
 * silently skipped.
 *
 * Requires (one-time):
 *   npm install
 *   npx playwright install chromium        # browsers are environment-specific,
 *                                          # never vendored via npm
 *
 * Exhibit server and docs dev server must already be running
 * (`./bin/server` in Exhibit, `npm run dev` here).
 *
 * Auth (optional, per-shot or global):
 *   shots can set `storageState: "<path>"`, or the config can set a global
 *   `auth.storageState` reused by every shot that omits its own. The path is
 *   a Playwright storage-state JSON file (see README.md for how to create it
 *   with a one-time headed login). Shots without a storage state run signed
 *   out. Docs pages are public and need no auth by default.
 *
 * Framework conventions:
 * - File names are kebab-case, e.g. `gallery-home.png`.
 * - Keep images under ~500KB; prefer PNG for UI, WebP for large pages.
 * - Reference from MDX as root-absolute: `![caption](/screenshots/gallery-home.png)`.
 * - Never commit review-only captures; only curated images listed in the config.
 */
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const configPath = join(root, 'scripts', 'screenshots', 'screenshots.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const exhibitBase = process.env.EXHIBIT_URL ?? config.exhibitUrl;
const docsBase = process.env.DOCS_URL ?? config.docsUrl;
const outDir = join(root, config.outDir);
mkdirSync(outDir, { recursive: true });

const globalStorageState = config.auth?.storageState ?? null;

/** Matches login/sign-in/auth pages: /login, /signin, /sign-in, /auth, ... */
const AUTH_RE = /(^|\/)(login|signin|sign-in|sign_in|auth)($|\/|\?|#)/i;

function resolveStorageState(value) {
  const raw = value ?? globalStorageState;
  if (!raw) return null;
  return resolve(root, raw);
}

const { chromium } = await import('playwright').catch(() => {
  console.error(
    'playwright is not installed. Run: npm install && npx playwright install chromium',
  );
  process.exit(1);
});

let browser;
try {
  browser = await chromium.launch();
} catch (err) {
  console.error(`FAIL browser launch: ${err.message}`);
  console.error('Is Chromium installed? Run: npx playwright install chromium');
  process.exit(1);
}

const results = [];

for (const shot of config.shots) {
  const base = shot.base === 'docs' ? docsBase : exhibitBase;
  const url = `${base}${shot.path}`;
  const out = join(outDir, `${shot.name}.png`);
  const label = `${shot.name} (${url})`;

  const fail = (reason) => {
    console.error(`FAIL ${label}: ${reason}`);
    results.push({ name: shot.name, url, ok: false, reason });
  };
  const pass = () => {
    console.log(`PASS ${label} -> ${out}`);
    results.push({ name: shot.name, url, ok: true });
  };

  // Resolve auth for this shot before navigating so a missing file is loud.
  const storageStatePath = resolveStorageState(shot.storageState);
  if ((shot.storageState ?? globalStorageState) && !existsSync(storageStatePath)) {
    fail(
      `storageState file not found: ${storageStatePath} ` +
        `(expected ${shot.storageState ? `per-shot "storageState"` : `global "auth.storageState"`}; ` +
        `see scripts/screenshots/README.md to create it)`,
    );
    continue;
  }

  let context = null;
  try {
    context = await browser.newContext({
      viewport: config.viewport ?? { width: 1440, height: 900 },
      ...(storageStatePath ? { storageState: storageStatePath } : {}),
    });
    const page = await context.newPage();

    let response = null;
    try {
      response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (err) {
      fail(`navigation failed: ${err.message}`);
      continue;
    }

    const status = response?.status();
    if (!response || status == null) {
      fail(`no HTTP response for expected URL ${url}`);
      continue;
    }
    if (status < 200 || status >= 300) {
      fail(`HTTP ${status} for expected URL ${url} (refusing to capture error page)`);
      continue;
    }

    if (shot.waitFor) {
      try {
        await page.waitForSelector(shot.waitFor, { timeout: 10000 });
      } catch {
        fail(
          `waitFor selector "${shot.waitFor}" not found within 10000ms ` +
            `(expected URL ${url}, landed on ${page.url()})`,
        );
        continue;
      }
    }

    await page.waitForTimeout(800);

    const finalUrl = page.url();
    let finalPath = finalUrl;
    let targetPath = url;
    try {
      finalPath = new URL(finalUrl).pathname + new URL(finalUrl).search;
    } catch {
      /* keep raw string */
    }
    try {
      targetPath = new URL(url).pathname + new URL(url).search;
    } catch {
      /* keep raw string */
    }
    if (AUTH_RE.test(finalUrl) && !AUTH_RE.test(url)) {
      fail(
        `login/auth redirect: expected ${url} (${targetPath}) ` +
          `but landed on ${finalUrl} (${finalPath}) — ` +
          `this page needs sign-in; capture a storageState file and set ` +
          `"storageState" for this shot (see README.md)`,
      );
      continue;
    }

    try {
      await page.screenshot({ path: out });
    } catch (err) {
      fail(`screenshot write failed: ${err.message}`);
      continue;
    }

    if (!existsSync(out)) {
      fail(`screenshot missing after capture: ${out}`);
      continue;
    }

    pass();
  } catch (err) {
    fail(`unexpected error: ${err?.message ?? err}`);
  } finally {
    await context?.close().catch(() => {});
  }
}

await browser.close().catch(() => {});

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log(`\nsummary: ${passed} passed, ${failed.length} failed (${results.length} total).`);
for (const r of results) {
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.ok ? '' : ` — ${r.reason}`}`);
}

if (failed.length > 0) {
  console.error(`\ndone with failures. images in ${config.outDir}/`);
  process.exit(1);
}
console.log(`\ndone. images in ${config.outDir}/`);
