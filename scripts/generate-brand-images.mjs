import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

// Raster derivatives of the existing approved favicon and site identity.
const icon = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const assets = new URL('../public/assets/', import.meta.url);
await mkdir(assets, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 96, height: 96 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:96px;height:96px}</style>${icon}`,
  );
  await page.screenshot({
    path: new URL('favicon-v1.png', assets).pathname.replace(/^\/([A-Z]:)/, '$1'),
  });
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!doctype html><html lang="pl"><meta charset="utf-8"><style>
    *{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px}
    body{background:#07101f;color:#ecf3fc;font-family:'Segoe UI',sans-serif;padding:72px;display:flex;flex-direction:column;justify-content:space-between}
    .identity{display:flex;align-items:center;gap:32px}svg{width:112px;height:112px}
    strong{font-size:88px;letter-spacing:2px}p{font-size:30px;color:#a7b6ca;margin:0}
    footer{border-top:2px solid #425875;padding-top:30px;display:flex;justify-content:space-between;font-size:28px;color:#63a7ff}
    </style><body><div class="identity">${icon}<strong>ITBIZ.PL</strong></div>
    <p>GOODSERVICE sp. z o.o. · NIP 5272714609</p>
    <footer><span>itbiz.pl</span><span>+48 573 012 321</span></footer></body></html>`);
  await page.screenshot({
    path: new URL('share-itbiz-v1.png', assets).pathname.replace(/^\/([A-Z]:)/, '$1'),
  });
} finally {
  await browser.close();
}
