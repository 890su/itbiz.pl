import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'reports/network-light-2026-10-26';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const metrics = [];
for (const [name, url, width, height, theme] of [
  ['home', '/', 1440, 900, 'light'],
  ['home', '/', 1440, 900, 'dark'],
  ['home-wide', '/', 1920, 1080, 'dark'],
  ['cctv', '/uslugi/awaria-monitoringu-w-firmie/', 390, 844, 'light'],
  ['cctv', '/uslugi/awaria-monitoringu-w-firmie/', 1440, 900, 'dark'],
  ['move', '/ru/uslugi/it-pereezd-ofisa/', 320, 740, 'dark'],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: 'no-preference',
  });
  await context.addInitScript(() =>
    localStorage.setItem(
      'itbiz-consent-v2',
      JSON.stringify({
        necessary: true,
        analytics: false,
        advertising: false,
        version: 2,
      }),
    ),
  );
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8787' + url);
  await page.locator('html').evaluate((el, theme) => {
    el.dataset.theme = theme;
  }, theme);
  await page.locator('.hero-network-light').evaluate((el) => {
    const animation = el.getAnimations()[0];
    if (animation) {
      animation.currentTime = 4000;
      animation.pause();
    }
  });
  await page.screenshot({
    path: `${output}/${name}-${width}-${theme}.png`,
    fullPage: true,
  });
  metrics.push(
    await page.evaluate(
      ({ name, theme, width }) => {
        const scope = document.querySelector('#scope');
        return {
          name,
          theme,
          width,
          overflow: document.documentElement.scrollWidth - innerWidth,
          height: document.documentElement.scrollHeight,
          background: scope ? getComputedStyle(scope).backgroundColor : null,
          foreground: getComputedStyle(document.querySelector('h1')).color,
          heroAnimation: getComputedStyle(document.querySelector('.hero-network-light'))
            .animationName,
          scripts: document.querySelectorAll('script[src="/scripts/hero-network.js"]')
            .length,
        };
      },
      { name, theme, width },
    ),
  );
  await context.close();
}
await browser.close();
await writeFile(`${output}/metrics.json`, JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));
