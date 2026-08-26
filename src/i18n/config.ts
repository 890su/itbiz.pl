export const locales = ['pl', 'ru', 'en', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  pl: 'PL',
  ru: 'RU',
  en: 'EN',
  uk: 'UA',
};

export const sourceLocale: Locale = 'pl';
