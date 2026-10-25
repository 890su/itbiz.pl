import { expect, test } from '@playwright/test';
import { getRoute } from '../../src/i18n/config';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'itbiz-consent-v2',
      JSON.stringify({
        necessary: true,
        analytics: false,
        advertising: false,
        version: 2,
      }),
    );
  });
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({ body: '' }),
  );
});

for (const locale of ['pl', 'ru', 'en', 'uk'] as const) {
  test(`${locale} hero form follows the introduction at mobile and tablet sizes and sits beside it on desktop`, async ({
    page,
  }) => {
    for (const width of [320, 1024, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const key of [
        'home',
        'service.cctv-emergency',
        'service.office-it-move',
      ] as const) {
        await page.goto(getRoute(locale, key));
        await expect(page.locator('[data-lead-form]')).toHaveCount(1);
        await expect(page.locator('[data-enquiry-details]')).toBeHidden();
        await expect(page.locator('#message')).toBeVisible();
        await expect(page.locator('.enquiry-hero .button-primary')).toBeHidden();
        const geometry = await page.evaluate(() => {
          const intro = document.querySelector('.enquiry-intro')!;
          const form = document.querySelector('.lead-enquiry')!;
          const support = document.querySelector('.enquiry-support')!;
          const i = intro.getBoundingClientRect();
          const f = form.getBoundingClientRect();
          const s = support.getBoundingClientRect();
          return {
            introBottom: i.bottom,
            introRight: i.right,
            formTop: f.top,
            formRight: f.right,
            formLeft: f.left,
            formBottom: f.bottom,
            formWidth: f.width,
            supportTop: s.top,
            adjacent: intro.nextElementSibling === form,
            overflow: document.documentElement.scrollWidth - innerWidth,
          };
        });
        expect(geometry.adjacent).toBe(true);
        expect(geometry.formWidth).toBeLessThanOrEqual(640);
        expect(geometry.overflow).toBe(0);
        if (width < 1440) {
          expect(geometry.formTop).toBeGreaterThan(geometry.introBottom);
          expect(geometry.supportTop).toBeGreaterThan(geometry.formBottom);
        } else {
          expect(geometry.formLeft).toBeGreaterThan(geometry.introRight);
          await page
            .locator('#message')
            .fill('Test office network enquiry to expand the form.');
          const gap = await page.evaluate(
            () =>
              document.querySelector('.enquiry-support')!.getBoundingClientRect().top -
              document.querySelector('.enquiry-intro')!.getBoundingClientRect().bottom,
          );
          expect(gap).toBeLessThan(50);
        }
      }
    }
  });

  test(`${locale} choosing an example reveals the second stage, preselects the topic and types its description`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(getRoute(locale, 'home'));
    await page.locator('[data-examples-all]').click();
    const example = page.locator('[data-enquiry-example]').first();
    const text = (await example.textContent())!.trim();
    await page.locator('#message').evaluate((input) => {
      input.addEventListener('input', () => {
        if (
          (input as HTMLTextAreaElement).value.length > 0 &&
          (input as HTMLTextAreaElement).value.length < 10
        )
          (input as HTMLElement).dataset.sawPartialInput = 'true';
      });
    });
    await example.locator('span').click();
    await expect(page.locator('[data-enquiry-details]')).toBeVisible();
    await expect(page.locator('[data-enquiry-examples]')).toBeHidden();
    await expect(page.locator('select[name="serviceId"]')).toHaveValue(
      'network-emergency',
    );
    await expect(page.locator('#message')).toHaveValue(text);
    await expect(page.locator('#message')).toHaveAttribute(
      'data-saw-partial-input',
      'true',
    );
    await page.locator('[name="requestType"][value="broken"]').check();
    await page.locator('[name="urgency"][value="soon"]').check();
    await expect(page.locator('[name="urgency"][value="soon"]')).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });

  test(`${locale} failed delivery retains fields and retry includes refinements, then resets the first stage`, async ({
    page,
  }) => {
    let attempts = 0;
    let posted = '';
    await page.route('**/api/contact', async (route) => {
      attempts++;
      posted = route.request().postData() || '';
      await route.fulfill(
        attempts === 1
          ? { status: 503, json: { message: 'Test delivery unavailable' } }
          : { json: { preview: true, requestId: 'enquiry-test-only' } },
      );
    });
    await page.goto(getRoute(locale, 'service.cctv-emergency'));
    const description = 'Test: cameras in the office have stopped recording.';
    await page.locator('#message').fill(description);
    await page.locator('#contactName').fill('Test Contact');
    await page.locator('#contactMethod').fill('test@example.org');
    await page.locator('#officeAddress').fill('Test office address');
    await page.locator('[name="requestType"][value="broken"]').check();
    await page.locator('[name="urgency"][value="urgent"]').check();
    await page.locator('[data-lead-form] button[type="submit"]').click();
    await expect(page.locator('[data-form-status]')).toHaveAttribute(
      'data-state',
      'error',
    );
    await expect(page.locator('#message')).toHaveValue(description);
    await expect(page.locator('#officeAddress')).toHaveValue('Test office address');
    await page.locator('[data-lead-form] button[type="submit"]').click();
    await expect(page.locator('[data-form-status]')).toContainText('enquiry-test-only');
    expect(attempts).toBe(2);
    expect(posted).toContain('cctv-emergency');
    expect(posted).toContain('Test office address');
    expect(posted).toContain('name="urgency"');
    expect(posted).toContain('urgent');
    await expect(page.locator('[data-enquiry-details]')).toBeHidden();
    await expect(page.locator('[data-enquiry-examples]')).toBeVisible();
    await expect(page.locator('#message')).toHaveValue('');
  });
}

for (const route of ['/', '/uslugi/awaria-sieci-w-firmie/']) {
  for (const gesture of ['wheel', 'touch'] as const) {
    test.describe(`automatic examples ${route} ${gesture}`, () => {
      test.use({
        viewport: { width: gesture === 'touch' ? 390 : 1440, height: 1000 },
        isMobile: gesture === 'touch',
        hasTouch: gesture === 'touch',
      });
      test('gestures scroll the page while examples keep moving', async ({ page }) => {
        await page.goto(route);
        const list = page.locator('.enquiry-example-list');
        await list.scrollIntoViewIfNeeded();
        const box = (await list.boundingBox())!;
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        const before = await list.evaluate((el) => el.scrollTop);
        await expect
          .poll(() => list.evaluate((el) => el.scrollTop))
          .toBeGreaterThan(before + 5);
        const documentBefore = await page.evaluate(() => scrollY);
        if (gesture === 'wheel') await page.mouse.wheel(0, 120);
        else {
          const client = await page.context().newCDPSession(page);
          await client.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: [{ x, y }],
          });
          for (let step = 1; step <= 6; step++) {
            await client.send('Input.dispatchTouchEvent', {
              type: 'touchMove',
              touchPoints: [{ x, y: y - step * 20 }],
            });
            await page.waitForTimeout(30);
          }
          await client.send('Input.dispatchTouchEvent', {
            type: 'touchEnd',
            touchPoints: [],
          });
          await client.detach();
        }
        await expect
          .poll(() => page.evaluate(() => scrollY))
          .toBeGreaterThan(documentBefore + 30);
        const after = await list.evaluate((el) => el.scrollTop);
        await expect
          .poll(() => list.evaluate((el) => el.scrollTop))
          .toBeGreaterThan(after + 3);
        await expect(page.locator('[data-enquiry-details]')).toBeHidden();
      });
    });
  }
}

test('keyboard selection supports manual editing and a partially typed example can submit its full text', async ({
  page,
}) => {
  let posted = '';
  await page.route('**/api/contact', async (route) => {
    posted = route.request().postData() || '';
    await route.fulfill({ json: { preview: true, requestId: 'keyboard-test' } });
  });
  await page.goto('/');
  await page.locator('[data-examples-all]').click();
  const example = page.locator('[data-enquiry-example]').first();
  await example.focus();
  await page.keyboard.press('Enter');
  await page.locator('#message').press('ControlOrMeta+A');
  await page
    .locator('#message')
    .pressSequentially('Manually written office network enquiry.');
  await page.waitForTimeout(300);
  await expect(page.locator('#message')).toHaveValue(
    'Manually written office network enquiry.',
  );
  await page.reload();
  // Prefill the second stage, then return to the suggestions without losing contact.
  await page
    .locator('#message')
    .fill('Temporary description to reveal contact fields.');
  await page.locator('#contactName').fill('Test Contact');
  await page.locator('#contactMethod').fill('test@example.org');
  await page.locator('#message').fill('');
  await page.locator('[data-examples-all]').click();
  const fullText = (await example.textContent())!.trim();
  await example.focus();
  await page.keyboard.press('Enter');
  await page.locator('[data-lead-form] button[type="submit"]').click();
  await expect(page.locator('[data-form-status]')).toContainText('keyboard-test');
  expect(posted).toContain(fullText);
});

test('short service lists can complete a whole loop without hitting the scroll limit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/uslugi/naprawa-gniazda-lan-w-biurze/');
  const list = page.locator('.enquiry-example-list');
  const lengths = await list.evaluate((el) => ({
    maximum: el.scrollHeight - el.clientHeight,
    loop:
      (el.querySelector('[data-example-clone]') as HTMLElement).offsetTop -
      (el.firstElementChild as HTMLElement).offsetTop,
  }));
  expect(lengths.maximum).toBeGreaterThanOrEqual(lengths.loop);
});

test('the empty padding of an example row remains clickable', async ({ page }) => {
  await page.goto('/en/');
  await page.locator('[data-examples-all]').click();
  const example = page.locator('[data-enquiry-example]').first();
  await example.scrollIntoViewIfNeeded();
  const text = (await example.textContent())!.trim();
  const box = (await example.boundingBox())!;
  await page.mouse.click(box.x + 3, box.y + box.height / 2);
  await expect(page.locator('[data-enquiry-details]')).toBeVisible();
  await expect(page.locator('#message')).toHaveValue(text);
});
