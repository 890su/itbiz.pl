import { expect, test } from '@playwright/test';
import { getRoute } from '../../src/i18n/config';
import { getUi } from '../../src/i18n/ui';
import { getExperience } from '../../src/i18n/experience';

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
  ['/uslugi/awaria-monitoringu-w-firmie/', 'cctv-emergency'],
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
    await expect(page.locator('input[name="contactName"]')).toHaveAttribute(
      'required',
      '',
    );
    await expect(page.locator('input[name="contact"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="companyName"]')).not.toHaveAttribute(
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
      name: 'Audyt Wi‑Fi małego biura',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Okablowanie kamer IP' }),
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
    const primaryAction = menu.getByRole('link', { name: 'Wyślij zapytanie' });
    const phoneAction = menu.getByRole('link', { name: /\+48 573 012 321/ });

    await expect(menu).toBeVisible();
    await expect(primaryAction).toBeVisible();
    await expect(phoneAction).toHaveAttribute('href', 'tel:+48573012321');
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
    const phoneActionBox = await phoneAction.boundingBox();
    const primaryActionBox = await primaryAction.boundingBox();
    expect(switcherBox).not.toBeNull();
    expect(phoneActionBox).not.toBeNull();
    expect(primaryActionBox).not.toBeNull();
    expect(switcherBox!.y + switcherBox!.height).toBeLessThan(phoneActionBox!.y);
    expect(phoneActionBox!.y + phoneActionBox!.height).toBeLessThan(
      primaryActionBox!.y,
    );
  }
});

test('mobile header scrolls away with the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto('/');

  const header = page.locator('.mobile-bar');
  await expect(header).toHaveCSS('position', 'relative');
  const initialBox = await header.boundingBox();
  expect(initialBox).not.toBeNull();

  await page.evaluate(() => window.scrollTo(0, 600));
  await expect
    .poll(async () => (await header.boundingBox())?.y ?? 0)
    .toBeLessThan(-100);
});

test('mobile menu closes with Escape and returns focus to its button', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('mobile navigation remains reachable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8787/');
  await expect(page.locator('.no-script-nav a[href="/uslugi/"]')).toBeVisible();
  await page.locator('.no-script-nav a[href="/uslugi/"]').click();
  await expect(page.locator('h1')).toBeVisible();
  await context.close();
});

test('home headline stays clear of the topology in every language', async ({
  page,
}) => {
  for (const path of ['/', '/ru/', '/en/', '/uk/']) {
    for (const width of [1280, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(path);
      const bounds = await page.evaluate(() => {
        const heading = document.querySelector('.hero h1');
        const diagram = document.querySelector('.blueprint');
        const range = document.createRange();
        range.selectNodeContents(heading!);
        return {
          right: Math.max(...Array.from(range.getClientRects(), (rect) => rect.right)),
          left: diagram!.getBoundingClientRect().left,
        };
      });
      expect(bounds.right + 16).toBeLessThanOrEqual(bounds.left);
    }
  }
});

test('Turnstile is deferred until the visitor approaches the form', async ({
  page,
}) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('challenges.cloudflare.com/turnstile/'))
      externalRequests.push(request.url());
  });
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.goto('/uslugi/awaria-monitoringu-w-firmie/');
  await page.waitForTimeout(300);
  expect(externalRequests).toHaveLength(0);
  await page.locator('#contactName').focus();
  await expect.poll(() => externalRequests.length).toBe(1);
});

test('confirmed company identity and contacts are published in every locale', async ({
  page,
}) => {
  for (const path of ['/kontakt/', '/ru/kontakt/', '/en/contact/', '/uk/kontakt/']) {
    await page.goto(path);
    const directContact = page.locator('.contact-links');
    await expect(directContact.locator('a[href="tel:+48573012321"]')).toHaveText(
      /\+48 573 012 321/,
    );
    await expect(directContact.locator('a[href="mailto:info@itbiz.pl"]')).toHaveText(
      /info@itbiz\.pl/,
    );
    await expect(page.locator('.site-footer')).toContainText('GOODSERVICE sp. z o.o.');
    await expect(page.locator('.site-footer')).toContainText('NIP 5272714609');
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

test('Google Ads tag and lead conversion require advertising consent', async ({
  page,
}) => {
  const googleTagRequests: string[] = [];
  await page.route('https://www.googletagmanager.com/**', async (route) => {
    googleTagRequests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    });
  });
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ requestId: 'test-request-1' }),
    });
  });

  await page.goto('/kontakt/');
  expect(googleTagRequests).toHaveLength(0);

  await page.getByRole('button', { name: 'Ustawienia prywatności' }).click();
  const dialog = page.locator('[data-consent-dialog]');
  await dialog.getByLabel('Reklama').check();
  await dialog.getByRole('button', { name: 'Zapisz ustawienia' }).click();
  await expect.poll(() => googleTagRequests.length).toBe(1);

  await page.getByLabel('Osoba kontaktowa').fill('Jan Testowy');
  await page.getByLabel('Telefon lub e-mail').fill('test@example.com');
  await page.getByLabel('Temat').selectOption('network-emergency');
  await page
    .getByLabel('Czego potrzebuje firma?')
    .fill('Testowe zgłoszenie firmowej awarii sieci.');
  await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
  await expect(page.locator('[data-form-status]')).toContainText('test-request-1');

  const conversion = await page.evaluate(() =>
    (window as typeof window & { dataLayer?: IArguments[] }).dataLayer
      ?.map((entry) => Array.from(entry))
      .find(
        (entry) =>
          entry[0] === 'event' &&
          entry[1] === 'conversion' &&
          entry[2]?.send_to === 'AW-18394870871/WpLcCOaejeMcENforcNE',
      ),
  );
  expect(conversion?.[2]).toMatchObject({
    value: 1,
    currency: 'PLN',
    transaction_id: 'test-request-1',
  });
});

test('privacy prompt stays a compact bottom-centred card', async ({ page }) => {
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
  expect(box!.y + box!.height).toBeLessThan(viewport!.height);
  expect(viewport!.height - (box!.y + box!.height)).toBeGreaterThanOrEqual(11);
  expect(box!.width).toBeLessThan(viewport!.width);
  const mainWidth = viewport!.width >= 1152 ? viewport!.width - 288 : viewport!.width;
  expect(Math.abs(box!.x - (mainWidth - box!.width) / 2)).toBeLessThan(2);
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
  await page.getByLabel('Osoba kontaktowa').fill('Jan Testowy');
  await page.getByLabel('Telefon lub e-mail').fill('+48 573 012 321');
  await page.getByLabel('Temat').selectOption('office-wifi');
  await page
    .getByLabel('Czego potrzebuje firma?')
    .fill('Test pełnej ścieżki formularza w środowisku preview.');
  await page.getByRole('button', { name: 'Wyślij zapytanie' }).click();
  await expect(page.locator('[data-form-status]')).toContainText(
    'Tryb preview: walidacja zakończona. Zapytanie nie zostało zapisane.',
  );
});

for (const locale of ['pl', 'ru', 'en', 'uk'] as const) {
  test(`${locale} client experience gives clear service choices and a visible CCTV phone`, async ({
    page,
  }) => {
    const copy = getExperience(locale);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(getRoute(locale, 'home'));
    await expect(page.locator('.service-journey')).toHaveCount(3);
    await expect(page.locator('.service-journey a')).toHaveCount(7);
    await expect(page.locator('.handover-sheet figcaption')).toHaveText(
      copy.sampleLabel,
    );
    const heroPhone = page.locator('.hero a[href="tel:+48573012321"]');
    await expect(heroPhone).toBeInViewport();
    const choice = await page.locator('#services').boundingBox();
    const utility = await page.locator('.network-tool-entry').boundingBox();
    expect(choice!.y).toBeLessThan(utility!.y);

    await page.goto(getRoute(locale, 'service.cctv-emergency'));
    const phone = page.locator('.cctv-hero a[href="tel:+48573012321"]');
    await expect(phone).toBeInViewport();
    await expect(page.locator('.diagnostic-path li')).toHaveCount(4);
    await expect(page.locator('.photo-help a')).toHaveAttribute(
      'href',
      'mailto:info@itbiz.pl',
    );
    await expect(page.locator('.side-actions > .button')).toHaveAttribute(
      'href',
      '#enquiry',
    );
    const form = await page.locator('#enquiry').boundingBox();
    expect(form!.y).toBeLessThan(3500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });

  test(`${locale} form identifies bad fields locally and retains a corrected enquiry`, async ({
    page,
  }) => {
    const copy = getExperience(locale).form;
    let requests = 0;
    await page.route('**/api/contact', async (route) => {
      requests += 1;
      await route.fulfill({ json: { preview: true, requestId: 'ux-test-only' } });
    });
    await page.goto(getRoute(locale, 'service.cctv-emergency'));
    const submit = page.locator('[data-lead-form] button[type="submit"]');
    await submit.click();
    await expect(page.locator('[data-validation-summary]')).toBeFocused();
    await expect(page.locator('#contactName-error')).toHaveText(copy.nameError);
    await page.locator('#contactName').fill('Jan Testowy');
    await page.locator('#contactMethod').fill('abc');
    await page.locator('#message').fill('Awaria');
    await submit.click();
    await expect(page.locator('#contactMethod-error')).toHaveText(copy.contactError);
    await expect(page.locator('#message-error')).toHaveText(copy.messageError);
    expect(requests).toBe(0);
    await page.locator('#contactMethod').fill('test@example.org');
    await page
      .locator('#message')
      .fill('Testowe zgłoszenie firmowej awarii monitoringu.');
    await expect(page.locator('#contactMethod-error')).toBeHidden();
    await expect(page.locator('#message-error')).toBeHidden();
    await submit.click();
    await expect(page.locator('[data-form-status]')).toContainText('ux-test-only');
    expect(requests).toBe(1);
  });

  test(`${locale} revised copy keeps contact and narrow service actions usable at 320px`, async ({
    page,
  }) => {
    const copy = getUi(locale);
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(getRoute(locale, 'contact'));
    await expect(page.locator('h1')).toHaveText(copy.contact.h1);
    await expect(page.getByLabel(copy.form.message, { exact: true })).toBeVisible();

    for (const [key, serviceId] of [
      ['service.cctv-emergency', 'cctv-emergency'],
      ['service.office-it-move', 'office-it-move'],
    ] as const) {
      await page.goto(getRoute(locale, key));
      await expect(page.locator('select[name="serviceId"]')).toHaveValue(serviceId);
      await expect(page.locator('.page-hero a[href="#enquiry"]')).toBeVisible();
      await expect(page.locator('#scope h2').first()).toHaveText(
        copy.service.inScopeTitle,
      );
      await expect(page.getByLabel(copy.form.message, { exact: true })).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBe(0);
    }
  });
}

for (const route of [
  '/narzedzia/pogoda-a-internet-w-firmie/',
  '/ru/instrumenty/pogoda-i-internet-v-kompanii/',
  '/en/tools/weather-and-business-internet/',
  '/uk/instrumenty/pohoda-i-internet-dlya-biznesu/',
]) {
  test(`weather and business network utility stays localized and private: ${route}`, async ({
    page,
  }) => {
    await page.route('**/api/weather', (request) =>
      request.fulfill({
        json: {
          current: {
            temperature: 18,
            feelsLike: 17,
            humidity: 55,
            windSpeed: 2.5,
            pressure: 1015,
            precipitation: 0,
            symbol: 'clearsky_day',
          },
          forecast: [
            {
              time: '2026-09-06T12:00:00Z',
              temperature: 18,
              precipitation: 0,
              windSpeed: 2.5,
              symbol: 'clearsky_day',
            },
          ],
        },
      }),
    );
    await page.route('**/api/network', (request) =>
      request.fulfill({
        json: {
          ip: '198.51.100.10',
          ipVersion: 'IPv4',
          provider: 'Test Business ISP',
          asn: 64500,
          city: 'Warsaw',
          country: 'PL',
          edge: 'WAW',
          tls: 'TLSv1.3',
        },
      }),
    );
    await page.setViewportSize({ width: 390, height: 760 });
    await page.goto(route);
    await expect(page.locator('[data-weather-temperature]')).toHaveText('18');
    await expect(page.locator('[data-network-ip]')).toContainText('198.51.100.10');
    await expect(page.locator('.nw-business-metrics > div')).toHaveCount(4);
    await expect(page.locator('.nw-reading-context [data-weather-feels]')).toHaveText(
      '17 °C',
    );
    await expect(page.locator('.nw-external-tests a[target="_blank"]')).toHaveCount(2);
    await expect(page.locator('.nw-business-cta-actions')).toContainText(
      '+48 573 012 321',
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    expect(
      await page.evaluate(() =>
        ((window as unknown as { dataLayer?: unknown[] }).dataLayer || []).some(
          (item: unknown) => JSON.stringify(item).includes('198.51.100.10'),
        ),
      ),
    ).toBe(false);
  });
}
