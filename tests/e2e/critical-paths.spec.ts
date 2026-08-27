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

test('home page keeps a concise business scope without horizontal overflow', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Firmowa sieć bez przypadkowych połączeń.',
  );
  await expect(page.getByRole('heading', { name: 'Zakres firmowy' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBe(dimensions.client);
});

test('content sections alternate tonal bands in light and dark themes', async ({
  page,
}) => {
  await page.goto('/');
  for (const theme of ['light', 'dark'] as const) {
    await page.locator('html').evaluate((html, value) => {
      html.dataset.theme = value;
    }, theme);
    const backgrounds = await page
      .locator('.page-section')
      .evaluateAll((sections) =>
        sections
          .slice(0, 3)
          .map((section) => getComputedStyle(section).backgroundColor),
      );
    expect(new Set(backgrounds).size).toBeGreaterThan(1);
  }
});

const demandTestLandings = [
  ['/uslugi/awaria-sieci-w-firmie/', 'network-emergency'],
  ['/uslugi/naprawa-gniazda-lan-w-biurze/', 'lan-outlet-repair'],
  ['/uslugi/audyt-wifi-malego-biura/', 'small-office-wifi-audit'],
  ['/uslugi/porzadkowanie-szafy-rack/', 'rack-cabinet-cleanup'],
  ['/uslugi/przeprowadzka-it-biura/', 'office-it-move'],
  ['/uslugi/okablowanie-pod-monitoring/', 'cctv-cabling'],
  ['/uslugi/montaz-ekranu-w-biurze/', 'meeting-room-display'],
] as const;

for (const [path, serviceId] of demandTestLandings) {
  test(`${serviceId} landing keeps the ad and form intent aligned`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await expect(
      page.getByText('Wyłącznie dla firm i organizacji w Warszawie'),
    ).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('select[name="serviceId"]')).toHaveValue(serviceId);
    await expect(page.locator('input[name="companyName"]')).toHaveAttribute(
      'required',
      '',
    );
    await expect(page.locator('a[href*="naserwis.pl"]')).toHaveCount(0);
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll).toBe(dimensions.client);
  });
}

test('service topic filters update cards, status and shareable URL', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/uslugi/');

  const cards = page.locator('[data-service-card]');
  const status = page.locator('[data-service-filter-status]');
  await expect(cards).toHaveCount(12);
  await expect(page.locator('[data-service-card]:visible')).toHaveCount(12);

  await page.getByRole('button', { name: 'Wi‑Fi', exact: true }).click();
  await expect(page).toHaveURL(/\?temat=wifi$/);
  await expect(page.locator('[data-service-card]:visible')).toHaveCount(4);
  await expect(status).toHaveText('Pokazano 4 z 12 usług.');
  await expect(
    page.getByRole('heading', {
      name: 'Audyt Wi‑Fi w małym biurze — 5–30 stanowisk',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Okablowanie pod monitoring w firmie' }),
  ).toBeHidden();

  await page.reload();
  await expect(page.locator('[data-service-card]:visible')).toHaveCount(4);

  await page.getByRole('button', { name: 'Wszystkie', exact: true }).click();
  await expect(page).toHaveURL(/\/uslugi\/$/);
  await expect(page.locator('[data-service-card]:visible')).toHaveCount(12);

  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBe(dimensions.client);
});

test('translated emergency landing keeps localized service relationships', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/uslugi/awaria-sieci-w-firmie/');
  await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute(
    'href',
    'https://itbiz.pl/ru/uslugi/avariya-seti-v-kompanii/',
  );
  await page.locator('.mobile-bar').getByRole('button', { name: 'Menu' }).click();
  const russianServices = page.locator('.mobile-locale-switcher a[lang="ru"]');
  await expect(russianServices).toHaveAttribute(
    'href',
    '/ru/uslugi/avariya-seti-v-kompanii/',
  );
  await russianServices.click();
  await expect(page).toHaveURL(/\/ru\/uslugi\/avariya-seti-v-kompanii\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru-RU');
});

test('mobile navigation keeps language targets large and clear of the primary action', async ({
  page,
}) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/');
    await page.locator('.mobile-bar').getByRole('button', { name: 'Menu' }).click();

    const menu = page.locator('#mobile-menu');
    const localeSwitcher = menu.locator('.mobile-locale-switcher');
    const localeLinks = localeSwitcher.locator('a');
    const primaryAction = menu.getByRole('link', { name: 'Opisz zadanie' });

    await expect(menu).toBeVisible();
    await expect(primaryAction).toBeVisible();
    await expect(localeLinks).toHaveCount(4);

    const localeSizes = await localeLinks.evaluateAll((links) =>
      links.map((link) => {
        const rect = link.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
    );

    for (const size of localeSizes) {
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
    }

    const switcherBox = await localeSwitcher.boundingBox();
    const primaryActionBox = await primaryAction.boundingBox();
    expect(switcherBox).not.toBeNull();
    expect(primaryActionBox).not.toBeNull();
    expect(switcherBox!.y + switcherBox!.height).toBeLessThan(primaryActionBox!.y);
  }
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

test('privacy prompt stays a compact bottom bar', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-consent-banner]').evaluate((banner) => {
    (banner as HTMLElement).hidden = false;
  });
  const banner = page.locator('[data-consent-banner]');
  await expect(banner).toBeVisible();
  const box = await banner.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.height).toBeLessThan(100);
  expect(Math.round(box!.y + box!.height)).toBe(viewport!.height);
  expect(Math.round(box!.width)).toBe(viewport!.width);
});

test('preview service remains noindex and preselects its form topic', async ({
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
  await expect(
    page.getByText('Wyłącznie dla firm i organizacji w Warszawie'),
  ).toBeVisible();
});

test('language switch keeps the translated page relationship', async ({ page }) => {
  await page.goto('/uslugi/wifi-dla-biur/');
  await page.locator('.side-panel').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/services\/office-wifi\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Office Wi‑Fi design and deployment in Warsaw',
  );
  await expect(page.locator('link[hreflang="pl"]')).toHaveAttribute(
    'href',
    'https://itbiz.pl/uslugi/wifi-dla-biur/',
  );
});

for (const [locale, path, language] of [
  ['pl', '/', 'pl-PL'],
  ['ru', '/ru/', 'ru-RU'],
  ['en', '/en/', 'en-GB'],
  ['uk', '/uk/', 'uk-UA'],
] as const) {
  test(`${locale} home is usable on mobile without horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll).toBe(dimensions.client);
    await expect(page.locator('.mobile-locale-switcher a')).toHaveCount(4);
  });
}

test('preview form validates without pretending to deliver a lead', async ({
  page,
}) => {
  await page.goto('/kontakt/');
  await page.getByLabel('Firma / organizacja').fill('Testowa organizacja');
  await page.getByLabel('Osoba kontaktowa').fill('Jan Testowy');
  await page.getByLabel('E-mail').fill('test@example.org');
  await page.getByLabel('Temat').selectOption('office-wifi');
  await page
    .getByLabel('Co wymaga sprawdzenia?')
    .fill('Test pełnej ścieżki formularza w środowisku preview.');
  await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
  await expect(page.locator('[data-form-status]')).toContainText(
    'Tryb preview: walidacja zakończona. Zapytanie nie zostało zapisane.',
  );
});
