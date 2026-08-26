import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'itbiz-consent-v1',
      JSON.stringify({
        necessary: true,
        analytics: false,
        advertising: false,
        version: 1,
      }),
    );
  });
});

test('home page exposes one clear B2B path without horizontal overflow', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Firmowa sieć bez przypadkowych połączeń.',
  );
  await expect(
    page.getByText('Wyłącznie dla firm i organizacji').first(),
  ).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBe(dimensions.client);
});

test('mobile navigation opens and exposes the primary action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.mobile-bar').getByRole('button', { name: 'Menu' }).click();
  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Opisz zadanie' })).toBeVisible();
});

test('privacy choices can be changed and reopened from the footer', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ustawienia prywatności' }).click();
  const dialog = page.locator('[data-consent-dialog]');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Analityka').check();
  await dialog.getByRole('button', { name: 'Zapisz ustawienia' }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Ustawienia prywatności' }).click();
  await expect(dialog.getByLabel('Analityka')).toBeChecked();
});

test('draft service remains noindex and preselects its form topic', async ({
  page,
}) => {
  await page.goto('/uslugi/wifi-dla-biur/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://itbiz.pl/uslugi/wifi-dla-biur/',
  );
  await expect(page.getByLabel('Temat')).toHaveValue('office-wifi');
});

test('preview form validates without pretending to deliver a lead', async ({
  page,
}) => {
  await page.goto('/kontakt/');
  await page.getByLabel('Nazwa firmy lub organizacji').fill('Testowa organizacja');
  await page.getByLabel('Osoba kontaktowa').fill('Jan Testowy');
  await page.getByLabel('E-mail służbowy').fill('test@example.org');
  await page.getByLabel('Temat').selectOption('office-wifi');
  await page
    .getByLabel('Co dzieje się w firmowej infrastrukturze?')
    .fill('Test pełnej ścieżki formularza w środowisku preview.');
  await page
    .getByLabel(
      'Kontaktuję się w imieniu firmy, organizacji, biura lub innego podmiotu.',
    )
    .check();
  await page.getByRole('button', { name: 'Wyślij zapytanie B2B' }).click();
  await expect(page.locator('[data-form-status]')).toContainText(
    'Tryb preview: walidacja zakończona. Zapytanie nie zostało dostarczone.',
  );
});
