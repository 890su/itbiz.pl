import { test, expect } from '@playwright/test';
import { getRoute, locales } from '../../src/i18n/config';

for (const locale of locales) {
  test(`${locale} call is centred below the enquiry and the footer remains dark`, async ({
    page,
  }) => {
    await page.addInitScript(() =>
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
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const key of ['home', 'service.cctv-emergency'] as const) {
        await page.goto(getRoute(locale, key));
        const form = (await page.locator('main .lead-enquiry').boundingBox())!;
        const call = (await page.locator('.enquiry-support a').boundingBox())!;
        expect(call.y).toBeGreaterThanOrEqual(form.y + form.height);
        expect(
          Math.abs(call.x + call.width / 2 - form.x - form.width / 2),
        ).toBeLessThan(1);
        await expect(
          page.locator('[data-hero-motion],.hero-motion-toggle'),
        ).toHaveCount(0);
        for (const theme of ['light', 'dark']) {
          await page
            .locator('html')
            .evaluate((el, theme) => (el.dataset.theme = theme), theme);
          const colors = await page.evaluate(() => ({
            footer: getComputedStyle(document.querySelector('.site-footer')!)
              .backgroundColor,
            panel: getComputedStyle(document.querySelector('main .lead-enquiry')!)
              .backgroundColor,
            text: getComputedStyle(document.querySelector('.site-footer')!).color,
          }));
          expect(colors.footer).toBe(colors.panel);
          expect(colors.text).not.toBe(colors.footer);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBe(0);
      }
    }
  });
}
