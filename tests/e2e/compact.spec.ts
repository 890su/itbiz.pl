import { expect, test } from '@playwright/test';
import {
  getRoute,
  locales,
  routeTranslations,
  type TranslationKey,
} from '../../src/i18n/config';
import { getCompact } from '../../src/i18n/compact';
import { getUi } from '../../src/i18n/ui';
import { mockTurnstile } from './helpers/turnstile';

test.beforeEach(async ({ page }) => {
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
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: mockTurnstile() }),
  );
});

for (const locale of locales) {
  test(`${locale} inline form has no redundant heading and matches the navigation palette`, async ({
    page,
  }) => {
    await page.goto(getRoute(locale, 'home'));
    const form = page.locator('main [data-lead-form]');
    await expect(page.locator('main .lead-enquiry h2')).toHaveCount(0);
    await expect(form).toHaveAttribute('aria-label', getUi(locale).form.heading);
    await page
      .locator('#message')
      .fill('Company network task for layout verification.');
    await expect(form.locator('.form-notice')).toHaveText(
      getUi(locale).form.notice + ' ' + getUi(locale).form.privacyLink + '.',
    );
    await expect(form.locator('.form-notice a')).toHaveAttribute(
      'href',
      getRoute(locale, 'privacy'),
    );
    for (const theme of ['light', 'dark']) {
      await page.locator('html').evaluate((html, theme) => {
        html.dataset.theme = theme;
      }, theme);
      const palette = await page.evaluate(() => ({
        form: getComputedStyle(document.querySelector('main .lead-enquiry')!)
          .backgroundColor,
        menu: getComputedStyle(document.querySelector('.side-panel')!).backgroundColor,
        submit: getComputedStyle(document.querySelector('main button[type="submit"]')!)
          .backgroundColor,
        menuAction: getComputedStyle(
          document.querySelector('.side-actions .button-primary')!,
        ).backgroundColor,
      }));
      expect(palette.form).toBe(palette.menu);
      expect(palette.submit).toBe(palette.menuAction);
    }
  });

  test(`${locale} service pages keep only the decision essentials within three mobile screens`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const keys = Object.keys(routeTranslations).filter((key) =>
      key.startsWith('service.'),
    ) as TranslationKey[];
    for (const key of keys) {
      await page.goto(getRoute(locale, key));
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main [name="serviceId"]')).toHaveValue(key.slice(8));
      await expect(page.locator('#scope h2')).toHaveCount(4);
      await expect(page.locator('#scope')).toContainText(getCompact(locale).result);
      await expect(page.locator('#scope')).toContainText(getCompact(locale).limits);
      await expect(page.locator('#scope')).toContainText(getCompact(locale).request);
      await expect(
        page.locator(
          'main .process-grid, main .work-steps, main .legal-copy, main .private-support',
        ),
      ).toHaveCount(0);
      const geometry = await page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        overflow: document.documentElement.scrollWidth - innerWidth,
        form: document.querySelector('main #enquiry')!.getBoundingClientRect().top,
      }));
      expect(geometry.height, key).toBeLessThanOrEqual(844 * 3);
      expect(geometry.form, key).toBeLessThan(844);
      expect(geometry.overflow, key).toBe(0);
      await page
        .locator('#message')
        .fill('Company network task for layout verification.');
      await expect(page.locator('main [name="contact"]')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight),
        key + ' expanded form',
      ).toBeLessThanOrEqual(844 * 3);
    }
  });

  test(`${locale} secondary pages stay short and lead to the existing enquiry`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const key of [
      'home',
      'services',
      'solutions',
      'about',
      'contact',
      'area.warsaw',
    ] as const) {
      await page.goto(getRoute(locale, key));
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight),
        key,
      ).toBeLessThanOrEqual(844 * 3);
      await expect(page.locator('main a[href*="naserwis.pl"]')).toHaveCount(0);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
    }
    await page.goto(getRoute(locale, 'about'));
    await page.locator('main [data-enquiry-open]').click();
    await expect(page.locator('[data-enquiry-dialog]')).toBeVisible();
    await expect(page.locator('#modal-message')).toBeFocused();
  });
}
