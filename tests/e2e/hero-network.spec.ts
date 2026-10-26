import { expect, test } from '@playwright/test';
import { getCompact } from '../../src/i18n/compact';
import { getRoute, locales } from '../../src/i18n/config';

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
});

for (const locale of locales) {
  test(`${locale} scope is a distinct band and the decorative network stays out of the form`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(getRoute(locale, 'service.cctv-emergency'));
    await expect(page.locator('.hero-network')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.hero-network')).toHaveCSS('pointer-events', 'none');
    await expect(page.locator('main [role="switch"]')).toHaveAccessibleName(
      getCompact(locale).motionLabel,
    );
    for (const theme of ['light', 'dark']) {
      await page.locator('html').evaluate((html, theme) => {
        html.dataset.theme = theme;
      }, theme);
      const colors = await page.evaluate(() => {
        const scope = getComputedStyle(document.querySelector('#scope')!);
        const canvas = getComputedStyle(document.body).backgroundColor;
        return {
          scope: scope.backgroundColor,
          canvas,
          clip: scope.clipPath,
          shadow: scope.boxShadow,
        };
      });
      expect(colors.scope).not.toBe(colors.canvas);
      expect(colors.scope).not.toBe('rgba(0, 0, 0, 0)');
      expect(colors.clip).toContain('inset');
      expect(colors.shadow).not.toBe('none');
    }
    await page
      .locator('#message')
      .fill('Company cameras have stopped recording and need diagnosis.');
    await expect(page.locator('[data-hero-network]')).toHaveCount(1);
    await expect(page.locator('#message')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
}

test('background motion pauses by choice, while editing, offscreen and under reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.locator('.network-hero');
  const switchControl = hero.getByRole('switch');
  const light = page.locator('.hero-network-light');
  await expect(hero).toHaveAttribute('data-motion-running', 'true');
  await expect(light).toHaveCSS('animation-play-state', 'running');
  const start = await light.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => light.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(start);
  const control = page.locator('.hero-motion-toggle');
  await control.evaluate((el) =>
    el.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  await control.click();
  await expect(switchControl).not.toBeChecked();
  await expect(light).toHaveCSS('animation-play-state', 'paused');
  await expect(page.locator('.hero-motion-play')).toBeVisible();
  await switchControl.focus();
  await page.keyboard.press('Space');
  await expect(switchControl).toBeChecked();
  await expect(light).toHaveCSS('animation-play-state', 'running');
  await page.locator('#message').focus();
  await expect(light).toHaveCSS('animation-play-state', 'paused');
  await page.locator('#services a').first().focus();
  await hero.scrollIntoViewIfNeeded();
  await expect(light).toHaveCSS('animation-play-state', 'running');
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-motion-running', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(light).toHaveCSS('animation-name', 'none');
  await expect(switchControl).toBeHidden();
});
