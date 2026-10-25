import { expect, test } from '@playwright/test';
import { getRoute } from '../../src/i18n/config';
import { getUi } from '../../src/i18n/ui';
import { getEnquiry } from '../../src/i18n/enquiry';
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
  test(`${locale} modal accepts only description and contact without changing the inline enquiry`, async ({
    page,
  }) => {
    let posted = '';
    await page.route('**/api/contact', (route) => {
      posted = route.request().postData() || '';
      return route.fulfill({ json: { preview: true, requestId: 'modal-test' } });
    });
    await page.goto(getRoute(locale, 'home'));
    const inline = page.locator('main [data-lead-form]');
    await inline
      .locator('[name="message"]')
      .fill('Keep this office enquiry while another form is used.');
    const trigger = page.locator('.side-actions [data-enquiry-open]');
    await trigger.click();
    const dialog = page.locator('[data-enquiry-dialog]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('textarea')).toBeFocused();
    await expect(dialog.locator('[required]')).toHaveCount(2);
    await expect(dialog.locator('[data-enquiry-examples]')).toHaveCount(0);
    await expect(dialog.locator('[name="contactName"]')).toBeHidden();
    await expect(dialog.locator('[name="serviceId"]')).toHaveValue('other');
    await dialog
      .getByLabel(getUi(locale).form.message, { exact: true })
      .fill('Our company needs a visit to diagnose its network.');
    await dialog
      .getByPlaceholder(getUi(locale).form.contactMethod)
      .fill('test@example.org');
    await dialog
      .getByRole('button', { name: getUi(locale).form.submit, exact: true })
      .click();
    await expect(dialog.locator('[data-form-status]')).toContainText('modal-test');
    expect(posted).toContain('test-turnstile-token');
    await expect(inline.locator('[name="message"]')).toHaveValue(
      'Keep this office enquiry while another form is used.',
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test(`${locale} contact page covers all service topics and uses two columns only on wide screens`, async ({
    page,
  }) => {
    await page.goto(getRoute(locale, 'contact'));
    const form = page.locator('main [data-lead-form]');
    const ids = await form
      .locator('[data-service-id]')
      .evaluateAll((nodes) =>
        nodes
          .filter((n) => !n.hasAttribute('data-example-clone'))
          .map((n) => n.getAttribute('data-service-id')),
      );
    expect(new Set(ids).size).toBe(12);
    await expect(form.locator('[name="serviceId"]')).toHaveValue('other');
    await expect(form.locator('[data-enquiry-details]')).toBeHidden();
    for (const width of [320, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const geometry = await page.evaluate(() => {
        const i = document.querySelector('.contact-intro')!.getBoundingClientRect();
        const f = document.querySelector('main .lead-enquiry')!.getBoundingClientRect();
        return {
          iBottom: i.bottom,
          iRight: i.right,
          fTop: f.top,
          fLeft: f.left,
          fWidth: f.width,
          overflow: document.documentElement.scrollWidth - innerWidth,
        };
      });
      expect(geometry.overflow).toBe(0);
      expect(geometry.fWidth).toBeLessThanOrEqual(640);
      if (width < 1280) expect(geometry.fTop).toBeGreaterThan(geometry.iBottom);
      else expect(geometry.fLeft).toBeGreaterThan(geometry.iRight);
    }
    await form.locator('[data-examples-all]').click();
    const example = form.locator('[data-service-id="rack-cabinet-cleanup"]').first();
    const text = (await example.textContent())!.trim();
    await example.locator('span').click();
    await expect(form.locator('[name="message"]')).toHaveValue(text);
    await expect(form.locator('[name="serviceId"]')).toHaveValue(
      'rack-cabinet-cleanup',
    );
    await expect(form.locator('[name="contact"]')).toBeVisible();
    await form.locator('.enquiry-extras summary').click();
    for (const name of ['contactName', 'companyName', 'address']) {
      const field = form.locator(`[name="${name}"]`);
      await expect(field).toBeVisible();
      await expect(field).not.toHaveAttribute('required');
      await expect(field).not.toHaveAttribute(
        'placeholder',
        new RegExp(getEnquiry(locale).optional),
      );
    }
    const labels = await form
      .locator('label[for]')
      .evaluateAll((nodes) =>
        nodes.every((n) => Boolean(n.closest('.visually-hidden'))),
      );
    expect(labels).toBe(true);
  });
}

test('mobile menu services expand and enquiry modal returns focus to menu toggle', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/uslugi/porzadkowanie-szafy-rack/');
  await expect(page.locator('.hero-actions a[href="#scope"]')).toHaveCount(0);
  await page.locator('[data-menu-toggle]').click();
  const menu = page.locator('#mobile-menu');
  await menu.locator('.services-menu summary').click();
  await expect(menu.locator('.services-menu a')).toHaveCount(7);
  await expect(menu.locator('.services-menu a').first()).toBeVisible();
  await menu.locator('[data-enquiry-open]').click();
  const dialog = page.locator('[data-enquiry-dialog]');
  await expect(menu).toBeHidden();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[name="serviceId"]')).toHaveValue(
    'rack-cabinet-cleanup',
  );
  await dialog.locator('[data-enquiry-close]').click();
  await expect(page.locator('[data-menu-toggle]')).toBeFocused();
});

test('message uses one short guidance line without a hint', async ({ page }) => {
  await page.goto('/');
  await page.locator('#message').fill('Krótko');
  await expect(page.locator('.enquiry-hint')).toHaveCount(0);
  await page.locator('#contactMethod').focus();
  await expect(page.locator('#message-minimum')).toHaveClass(/field-error/);
  await expect(page.locator('.enquiry-message small').first()).toHaveText(
    'Min. 20 znaków, bez haseł.',
  );
  await expect(page.locator('main .enquiry-message small')).toHaveCount(1);
  await expect(page.locator('#message-error')).toHaveCount(0);
  await page.locator('#message').fill('Poprawny opis problemu z siecią w firmie.');
  await expect(page.locator('#message-minimum')).not.toHaveClass(/field-error/);
});
