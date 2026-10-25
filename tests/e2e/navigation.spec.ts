import { expect, test } from '@playwright/test';
import { getRoute } from '../../src/i18n/config';
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

for (const locale of ['pl', 'ru', 'en', 'uk'] as const) {
  test(`${locale} mobile header, scrollable menu and contact actions stay reachable`, async ({
    page,
  }) => {
    for (const size of [
      { width: 320, height: 740 },
      { width: 390, height: 844 },
      { width: 667, height: 375 },
    ]) {
      await page.setViewportSize(size);
      await page.goto(getRoute(locale, 'service.network-emergency'));
      const header = page.locator('.mobile-bar');
      const dock = page.locator('.mobile-contact-bar');
      await expect(header.locator('.menu-label')).toHaveCount(0);
      await expect(header.locator('.mobile-locale-switcher a')).toHaveCount(4);
      await expect(dock).toBeVisible();
      await expect(dock.locator('a[href="tel:+48573012321"] svg')).toBeVisible();
      await dock.locator('[data-enquiry-open]').click();
      await expect(page.locator('[data-enquiry-dialog]')).toBeVisible();
      await expect(dock).toBeHidden();
      await page.keyboard.press('Escape');
      await expect(dock.locator('[data-enquiry-open]')).toBeFocused();
      await header.locator('[data-menu-toggle]').click();
      const menu = page.locator('#mobile-menu');
      await menu.locator('.services-menu summary').click();
      const before = await page.evaluate(() => {
        const rect = (s: string) => {
          const r = document.querySelector(s)!.getBoundingClientRect();
          return { x: r.x, y: r.y, bottom: r.bottom, width: r.width, height: r.height };
        };
        const scroll = document.querySelector('.mobile-menu-scroll')!;
        return {
          header: rect('.mobile-bar'),
          actions: rect('.mobile-menu-actions'),
          scroll: rect('.mobile-menu-scroll'),
          overflow: document.documentElement.scrollWidth - innerWidth,
          scrollable: scroll.scrollHeight > scroll.clientHeight,
        };
      });
      expect(before.overflow).toBe(0);
      expect(before.header.y).toBe(0);
      expect(before.actions.bottom).toBeLessThanOrEqual(size.height);
      expect(before.scroll.bottom).toBeLessThanOrEqual(before.actions.y + 1);
      if (size.height < 800) expect(before.scrollable).toBe(true);
      const actionBoxes = await menu
        .locator('.contact-actions a')
        .evaluateAll((nodes) =>
          nodes.map((n) => {
            const r = n.getBoundingClientRect();
            return { y: r.y, height: r.height };
          }),
        );
      expect(actionBoxes).toHaveLength(2);
      expect(actionBoxes[0]!.y).toBe(actionBoxes[1]!.y);
      if (before.scrollable) {
        await menu.locator('.mobile-menu-scroll').hover();
        await page.mouse.wheel(0, 900);
        await expect
          .poll(() => menu.locator('.mobile-menu-scroll').evaluate((n) => n.scrollTop))
          .toBeGreaterThan(0);
      }
      expect((await menu.locator('.mobile-menu-actions').boundingBox())!.y).toBe(
        before.actions.y,
      );
      await expect(header.locator('.mobile-locale-switcher')).toBeVisible();
      await menu.locator('[data-enquiry-open]').click();
      await expect(menu).toBeHidden();
      await expect(page.locator('[data-enquiry-dialog]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(header.locator('[data-menu-toggle]')).toBeFocused();
      await expect(page.locator('main')).not.toHaveAttribute('inert');
    }
  });
}

test('short desktop sidebar scrolls its links while languages and actions stay fixed', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 560 });
  await page.goto('/');
  await page.locator('.side-panel .services-menu summary').click();
  const before = await page.evaluate(() => {
    const rect = (s: string) => {
      const r = document.querySelector(s)!.getBoundingClientRect();
      return { y: r.y, bottom: r.bottom };
    };
    const nav = document.querySelector('.side-nav')!;
    return {
      languages: rect('.side-heading .utility-row'),
      nav: rect('.side-nav'),
      actions: rect('.side-actions'),
      scrollable: nav.scrollHeight > nav.clientHeight,
    };
  });
  expect(before.scrollable).toBe(true);
  expect(before.actions.bottom).toBeLessThanOrEqual(560);
  expect(before.nav.bottom).toBeLessThan(before.actions.y);
  await page.locator('.side-nav').hover();
  await page.mouse.wheel(0, 900);
  await expect
    .poll(() => page.locator('.side-nav').evaluate((n) => n.scrollTop))
    .toBeGreaterThan(0);
  expect((await page.locator('.side-actions').boundingBox())!.y).toBe(before.actions.y);
  expect((await page.locator('.side-heading .utility-row').boundingBox())!.y).toBe(
    before.languages.y,
  );
  await page.locator('.side-actions [data-enquiry-open]').click();
  await expect(page.locator('[data-enquiry-dialog]')).toBeVisible();
});

test('desktop actions follow the menu without a large empty gap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const nav = (await page.locator('.side-nav').boundingBox())!;
  const actions = (await page.locator('.side-actions').boundingBox())!;
  expect(actions.y - nav.y - nav.height).toBeLessThanOrEqual(18);
  expect(actions.y + actions.height).toBeLessThan(1000);
});

test.describe('touch navigation', () => {
  test.use({ viewport: { width: 390, height: 600 }, hasTouch: true, isMobile: true });
  test('a swipe scrolls only the menu and resizing restores page access', async ({
    page,
  }) => {
    await page.goto('/ru/');
    await page.locator('[data-menu-toggle]').click();
    await page.locator('#mobile-menu .services-menu summary').click();
    const scroll = page.locator('.mobile-menu-scroll');
    const bounds = (await scroll.boundingBox())!;
    const actionsBefore = (await page.locator('.mobile-menu-actions').boundingBox())!;
    const client = await page.context().newCDPSession(page);
    const x = bounds.x + bounds.width / 2,
      y = bounds.y + bounds.height - 30;
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 6; step++) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y - step * 30 }],
      });
      await page.waitForTimeout(30);
    }
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await client.detach();
    await expect.poll(() => scroll.evaluate((n) => n.scrollTop)).toBeGreaterThan(40);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect((await page.locator('.mobile-menu-actions').boundingBox())!.y).toBe(
      actionsBefore.y,
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(page.locator('main')).not.toHaveAttribute('inert');
    await expect(page.locator('.side-panel [data-enquiry-open]')).toBeVisible();
  });
});
