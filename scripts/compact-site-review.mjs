import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.REVIEW_URL || 'http://127.0.0.1:8787';
const label = process.env.REVIEW_LABEL || 'after';
const directory = `reports/compact-site-2026-10-26/${label}`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const rows = [];
const cases = [
  ['home', '/', 1440, 900, 'light'],
  ['home', '/', 390, 844, 'light'],
  ['solutions', '/rozwiazania/', 390, 844, 'dark'],
  ['cctv', '/uslugi/awaria-monitoringu-w-firmie/', 390, 844, 'light'],
  ['move', '/ru/uslugi/it-pereezd-ofisa/', 320, 740, 'dark'],
  ['catalogue', '/uslugi/', 390, 844, 'light'],
  ['cctv', '/uslugi/awaria-monitoringu-w-firmie/', 1440, 900, 'dark'],
  ['home-uk', '/uk/', 320, 740, 'dark'],
  ['contact', '/kontakt/', 390, 844, 'light'],
  ['about', '/o-nas/', 390, 844, 'dark'],
  ['area', '/obszar-dzialania/warszawa/', 390, 844, 'light'],
  ['tool', '/narzedzia/pogoda-a-internet-w-firmie/', 390, 844, 'light'],
];
for (const [name, route, width, height, theme] of cases) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: 'reduce',
  });
  await context.addInitScript((theme) => {
    localStorage.setItem('itbiz-theme', theme);
    localStorage.setItem(
      'itbiz-consent-v2',
      JSON.stringify({
        necessary: true,
        analytics: false,
        advertising: false,
        version: 2,
      }),
    );
  }, theme);
  const page = await context.newPage();
  await page.goto(base + route);
  await page.locator('html').evaluate((html, theme) => {
    html.dataset.theme = theme;
  }, theme);
  await page.screenshot({
    path: `${directory}/${name}-${width}-${theme}.png`,
    fullPage: true,
  });
  rows.push(
    await page.evaluate(
      ({ name, route, width, height }) => ({
        name,
        route,
        width,
        height,
        pageHeight: document.documentElement.scrollHeight,
        screens: +(document.documentElement.scrollHeight / height).toFixed(2),
        overflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        words: document.querySelector('main')?.innerText.split(/\s+/).filter(Boolean)
          .length,
        formTop: document.querySelector('main #enquiry')?.getBoundingClientRect().top,
      }),
      { name, route, width, height },
    ),
  );
  if (label === 'final' && name === 'cctv' && width === 390) {
    await page
      .locator('#message')
      .fill('Company CCTV has stopped recording and needs diagnosis.');
    await page.screenshot({
      path: `${directory}/cctv-expanded-390.png`,
      fullPage: true,
    });
  }
  await context.close();
}
await browser.close();
await writeFile(`${directory}/metrics.json`, JSON.stringify(rows, null, 2));
console.log(JSON.stringify(rows, null, 2));
