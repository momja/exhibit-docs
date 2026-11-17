/**
 * Capture screenshots for the docs.
 *
 * Usage:
 *   EXHIBIT_URL=http://localhost:8080 DOCS_URL=http://localhost:3000 npm run screenshots
 *
 * Reads ./screenshots.config.json, visits each route with Playwright Chromium,
 * and writes PNG/WebP files into ../../public/screenshots/.
 *
 * Requires: `npx playwright install chromium` once. Exhibit server and docs
 * dev server must already be running (`./bin/server` in Exhibit, `npm run dev` here).
 *
 * Framework conventions:
 * - File names are kebab-case, e.g. `gallery-home.png`.
 * - Keep images under ~500KB; prefer PNG for UI, WebP for large pages.
 * - Reference from MDX as root-absolute: `![caption](/screenshots/gallery-home.png)`.
 * - Never commit review-only captures; only curated images listed in the config.
 */
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const configPath = join(root, 'scripts', 'screenshots', 'screenshots.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const exhibitBase = process.env.EXHIBIT_URL ?? config.exhibitUrl;
const docsBase = process.env.DOCS_URL ?? config.docsUrl;
const outDir = join(root, config.outDir);
mkdirSync(outDir, { recursive: true });

const { chromium } = await import('playwright').catch(() => {
  console.error(
    'playwright is not installed. Run: npm i -D playwright && npx playwright install chromium',
  );
  process.exit(1);
});

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: config.viewport ?? { width: 1440, height: 900 },
});

for (const shot of config.shots) {
  const base = shot.base === 'docs' ? docsBase : exhibitBase;
  const url = `${base}${shot.path}`;
  const out = join(outDir, `${shot.name}.png`);
  console.log(`capture ${url} -> ${out}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (shot.waitFor) {
      await page.waitForSelector(shot.waitFor, { timeout: 10000 }).catch(() => {});
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: out });
  } catch (err) {
    console.warn(`skip ${shot.name}: ${err.message}`);
  }
}

await browser.close();
console.log(`done. images in ${config.outDir}/`);
