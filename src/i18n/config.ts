export const locales = ['pl', 'ru', 'en', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const localizedLocales = ['ru', 'en', 'uk'] as const;

export const localeLabels: Record<Locale, string> = {
  pl: 'PL',
  ru: 'RU',
  en: 'EN',
  uk: 'UA',
};

export const languageTags: Record<Locale, string> = {
  pl: 'pl-PL',
  ru: 'ru-RU',
  en: 'en-GB',
  uk: 'uk-UA',
};

export const languageNames: Record<Locale, string> = {
  pl: 'Polski',
  ru: 'Русский',
  en: 'English',
  uk: 'Українська',
};

export const sourceLocale: Locale = 'pl';

export const routeTranslations = {
  home: {
    pl: '/',
    ru: '/ru/',
    en: '/en/',
    uk: '/uk/',
  },
  services: {
    pl: '/uslugi/',
    ru: '/ru/uslugi/',
    en: '/en/services/',
    uk: '/uk/poslugy/',
  },
  solutions: {
    pl: '/rozwiazania/',
    ru: '/ru/resheniya/',
    en: '/en/solutions/',
    uk: '/uk/rishennya/',
  },
  about: {
    pl: '/o-nas/',
    ru: '/ru/o-proekte/',
    en: '/en/about/',
    uk: '/uk/pro-proekt/',
  },
  contact: {
    pl: '/kontakt/',
    ru: '/ru/kontakt/',
    en: '/en/contact/',
    uk: '/uk/kontakt/',
  },
  'area.warsaw': {
    pl: '/obszar-dzialania/warszawa/',
    ru: '/ru/zona-raboty/varshava/',
    en: '/en/service-area/warsaw/',
    uk: '/uk/zona-obslugovuvannya/varshava/',
  },
  privacy: {
    pl: '/privacy/',
    ru: '/ru/privacy/',
    en: '/en/privacy/',
    uk: '/uk/privacy/',
  },
  cookies: {
    pl: '/cookies/',
    ru: '/ru/cookies/',
    en: '/en/cookies/',
    uk: '/uk/cookies/',
  },
  'service.managed-it': {
    pl: '/uslugi/obsluga-it-dla-firm/',
    ru: '/ru/uslugi/it-obsluzhivanie-dlya-kompaniy/',
    en: '/en/services/managed-it-for-business/',
    uk: '/uk/poslugy/it-obslugovuvannya-dlya-biznesu/',
  },
  'service.lan-installation': {
    pl: '/uslugi/sieci-lan-dla-firm/',
    ru: '/ru/uslugi/lan-seti-dlya-kompaniy/',
    en: '/en/services/business-lan-networks/',
    uk: '/uk/poslugy/lan-merezhi-dlya-biznesu/',
  },
  'service.office-wifi': {
    pl: '/uslugi/wifi-dla-biur/',
    ru: '/ru/uslugi/wifi-dlya-ofisov/',
    en: '/en/services/office-wifi/',
    uk: '/uk/poslugy/wifi-dlya-ofisiv/',
  },
  'service.network-repair': {
    pl: '/uslugi/diagnostyka-i-naprawa-sieci-firmowej/',
    ru: '/ru/uslugi/diagnostika-korporativnoy-seti/',
    en: '/en/services/business-network-diagnostics/',
    uk: '/uk/poslugy/diagnostyka-korporatyvnoyi-merezhi/',
  },
  'service.network-emergency': {
    pl: '/uslugi/awaria-sieci-w-firmie/',
    ru: '/ru/uslugi/avariya-seti-v-kompanii/',
    en: '/en/services/business-network-emergency/',
    uk: '/uk/poslugy/avariya-merezhi-v-kompaniyi/',
  },
  'service.lan-outlet-repair': {
    pl: '/uslugi/naprawa-gniazda-lan-w-biurze/',
    ru: '/ru/uslugi/remont-lan-rozetki-v-ofise/',
    en: '/en/services/office-lan-outlet-repair/',
    uk: '/uk/poslugy/remont-lan-rozetky-v-ofisi/',
  },
  'service.small-office-wifi-audit': {
    pl: '/uslugi/audyt-wifi-malego-biura/',
    ru: '/ru/uslugi/audit-wifi-nebolshogo-ofisa/',
    en: '/en/services/small-office-wifi-audit/',
    uk: '/uk/poslugy/audyt-wifi-maloho-ofisu/',
  },
  'service.rack-cabinet-cleanup': {
    pl: '/uslugi/porzadkowanie-szafy-rack/',
    ru: '/ru/uslugi/poryadok-v-shkafu-rack/',
    en: '/en/services/rack-cabinet-cleanup/',
    uk: '/uk/poslugy/vporyadkuvannya-shafy-rack/',
  },
  'service.office-it-move': {
    pl: '/uslugi/przeprowadzka-it-biura/',
    ru: '/ru/uslugi/it-pereezd-ofisa/',
    en: '/en/services/office-it-move/',
    uk: '/uk/poslugy/it-pereyizd-ofisu/',
  },
  'service.cctv-cabling': {
    pl: '/uslugi/okablowanie-pod-monitoring/',
    ru: '/ru/uslugi/kabeli-dlya-videonablyudeniya/',
    en: '/en/services/cctv-cabling/',
    uk: '/uk/poslugy/kabeli-dlya-videosposterezhennya/',
  },
  'service.cctv-emergency': {
    pl: '/uslugi/awaria-monitoringu-w-firmie/',
    ru: '/ru/uslugi/avariya-videonablyudeniya-v-kompanii/',
    en: '/en/services/business-cctv-emergency/',
    uk: '/uk/poslugy/avariya-videosposterezhennya-v-kompaniyi/',
  },
  'service.meeting-room-display': {
    pl: '/uslugi/montaz-ekranu-w-biurze/',
    ru: '/ru/uslugi/montazh-ekrana-v-ofise/',
    en: '/en/services/meeting-room-display-installation/',
    uk: '/uk/poslugy/montazh-ekrana-v-ofisi/',
  },
} as const;

export type TranslationKey = keyof typeof routeTranslations;
export type PageTranslationKey = Exclude<TranslationKey, `service.${string}`>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getRoute(locale: Locale, key: TranslationKey): string {
  const path = (routeTranslations[key] as Partial<Record<Locale, string>>)[locale];
  if (!path) throw new Error(`Missing ${locale} route for ${key}`);
  return path;
}

export function getRouteOrFallback(locale: Locale, key: TranslationKey): string {
  return (
    (routeTranslations[key] as Partial<Record<Locale, string>>)[locale] ??
    getRoute(locale, key.startsWith('service.') ? 'services' : 'home')
  );
}

export function getAvailableRoutes(key: TranslationKey) {
  return Object.entries(routeTranslations[key]) as [Locale, string][];
}

export function getLocalizedStaticPaths() {
  return localizedLocales.flatMap((locale) =>
    (
      Object.entries(routeTranslations) as [
        TranslationKey,
        Partial<Record<Locale, string>>,
      ][]
    ).flatMap(([translationKey, paths]) => {
      const prefix = `/${locale}/`;
      const path = paths[locale];
      if (!path) return [];
      const remainder = path === prefix ? undefined : path.slice(prefix.length, -1);
      return [
        {
          params: { lang: locale, path: remainder },
          props: { locale, translationKey },
        },
      ];
    }),
  );
}
