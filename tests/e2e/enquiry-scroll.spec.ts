import { expect, test } from '@playwright/test';
import { getRoute } from '../../src/i18n/config';
import { mockTurnstile } from './helpers/turnstile';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
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

for (const locale of ['pl', 'ru', 'en', 'uk'] as const) {
  test(`${locale} a tall expanded enquiry puts its text below the mobile header`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 560 });
    await page.goto(getRoute(locale, 'home'));
    const example = page.locator('[data-enquiry-example]').first();
    const text = (await example.textContent())!.trim();
    await example.locator('span').click();
    await expect(page.locator('#message')).toHaveValue(text);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const input = document.querySelector('#message')!.getBoundingClientRect();
          const header = document.querySelector('.mobile-bar')!.getBoundingClientRect();
          return Math.abs(input.top - header.bottom - 12);
        }),
      )
      .toBeLessThan(2);
    await expect(page.locator('[data-enquiry-details]')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBe(0);
    if (locale === 'pl')
      await page.screenshot({ path: 'reports/enquiry-scroll-2026-10-27/mobile.png' });
  });
}

test('a form that fits moves only enough to bring the whole card into view', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 180, behavior: 'instant' }));
  expect(
    await page
      .locator('main .lead-enquiry')
      .evaluate((el) => el.getBoundingClientRect().top),
  ).toBeLessThan(0);
  await page.locator('[data-enquiry-example]').first().click();
  await expect
    .poll(() =>
      page
        .locator('main .lead-enquiry')
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top - 12)),
    )
    .toBeLessThan(2);
  const bounds = (await page.locator('main .lead-enquiry').boundingBox())!;
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(988);
  await page.screenshot({ path: 'reports/enquiry-scroll-2026-10-27/desktop.png' });
});

test('an already visible expanded form does not move the page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  const before = await page.evaluate(() => scrollY);
  await page.locator('[data-enquiry-example]').first().click();
  await expect(page.locator('[data-enquiry-details]')).toBeVisible();
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBe(before);
});

test('opening a smaller viewport after selection realigns the field', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await page.locator('[data-enquiry-example]').first().click();
  await page.setViewportSize({ width: 1440, height: 420 });
  await expect
    .poll(() =>
      page
        .locator('#message')
        .evaluate((el) => Math.abs(el.getBoundingClientRect().top - 12)),
    )
    .toBeLessThan(2);
});

test('manual scrolling cancels later viewport corrections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await page.locator('[data-enquiry-example]').first().click();
  await page.mouse.wheel(0, 100);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(50);
  const before = await page.evaluate(() => scrollY);
  await page.setViewportSize({ width: 1440, height: 420 });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBe(before);
});
