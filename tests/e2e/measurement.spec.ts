import { expect, test } from '@playwright/test';
import { mockTurnstile } from './helpers/turnstile';

for (const scenario of [
  { name: 'accepted production enquiry', status: 201, preview: false, events: 1 },
  { name: 'honeypot acknowledgement', status: 202, preview: false, events: 0 },
  { name: 'preview enquiry', status: 202, preview: true, events: 0 },
  { name: 'delivery failure', status: 503, preview: false, events: 0 },
]) {
  test(`measurement distinguishes ${scenario.name}`, async ({ page }) => {
    const requestId = 'a1234567-1234-4234-8234-123456789abc';
    await page.addInitScript(() => {
      (window as any).verifiedLeads = [];
      window.addEventListener('itbiz:b2b-lead-submit', (event) => {
        (window as any).verifiedLeads.push((event as CustomEvent).detail);
      });
    });
    await page.route('https://challenges.cloudflare.com/**', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: mockTurnstile() }),
    );
    let submitted = '';
    await page.route('**/api/contact', (route) => {
      submitted = route.request().postData() || '';
      return route.fulfill({
        status: scenario.status,
        json: { requestId, preview: scenario.preview },
      });
    });
    await page.goto('/?utm_source=chatgpt.com&email=private@example.org');
    await page
      .locator('#message')
      .fill('TEST: Office network needs a diagnostic visit.');
    await page.locator('#contactMethod').fill('test@example.org');
    const submit = page.locator('main [data-lead-form] button[type="submit"]');
    await submit.click();
    await expect(page.locator('main [data-form-status]')).toHaveAttribute(
      'data-state',
      scenario.status === 503 ? 'error' : 'success',
    );
    await expect(submit).toBeEnabled();
    const events = await page.evaluate(() => (window as any).verifiedLeads);
    expect(events).toHaveLength(scenario.events);
    if (scenario.events)
      expect(events[0]).toEqual({
        requestId,
        serviceId: 'other',
        formId: 'inline',
        locale: 'pl',
      });
    expect(submitted).toContain('chatgpt.com');
    expect(submitted).not.toContain('private@example.org');
    const stored = await page.evaluate(() =>
      sessionStorage.getItem('itbiz-attribution-v1'),
    );
    expect(stored).toBeNull();
  });
}
