import type { Locale } from './config';

const homeTopics = [
  'network-emergency',
  'cctv-emergency',
  'office-wifi',
  'lan-outlet-repair',
  'lan-installation',
  'office-it-move',
  'rack-cabinet-cleanup',
  'managed-it',
] as const;

const copy = {
  pl: {
    heading: 'Co trzeba naprawić lub przygotować?',
    placeholder: 'Opisz zadanie lub wybierz podobną sytuację poniżej…',
    examples: 'Wybierz podobną sytuację',
    all: 'Wszystkie przykłady',
    less: 'Zwiń listę',
    next: 'Podaj kontakt. Zakres i możliwy termin ustalimy po zapoznaniu się z opisem.',
    type: 'Czego dotyczy zadanie?',
    broken: 'Działało i przestało',
    setup: 'Montaż lub konfiguracja',
    urgency: 'Jak pilna jest sprawa?',
    urgent: 'Pilne',
    soon: 'W najbliższym czasie',
    flexible: 'Termin elastyczny',
    address: 'Adres biura / miejscowość (opcjonalnie)',
    home: [
      'W biurze przestał działać internet',
      'Kamery nie pokazują obrazu lub nie nagrywają',
      'Firmowe Wi-Fi rozłącza urządzenia',
      'Gniazdo LAN przy stanowisku nie działa',
      'Potrzebne są nowe punkty sieciowe w biurze',
      'Przenosimy biuro i trzeba podłączyć sieć',
      'Trzeba uporządkować przewody w szafie rack',
      'Szukamy stałej obsługi IT dla firmy',
    ],
  },
  ru: {
    heading: 'Что нужно исправить или настроить?',
    placeholder: 'Опишите задачу или выберите похожую ситуацию ниже…',
    examples: 'Выберите похожую ситуацию',
    all: 'Все примеры',
    less: 'Свернуть список',
    next: 'Оставьте контакт. После описания согласуем объём работ и возможное время.',
    type: 'Что нужно сделать?',
    broken: 'Работало и перестало',
    setup: 'Монтаж или настройка',
    urgency: 'Насколько срочно?',
    urgent: 'Срочно',
    soon: 'В ближайшее время',
    flexible: 'Сроки не горящие',
    address: 'Адрес офиса / населённый пункт (необязательно)',
    home: [
      'В офисе перестал работать интернет',
      'Камеры не показывают изображение или не записывают',
      'Корпоративный Wi-Fi отключает устройства',
      'Не работает LAN-розетка на рабочем месте',
      'Нужны новые сетевые точки в офисе',
      'Переезжаем в другой офис, нужно подключить сеть',
      'Нужно привести в порядок кабели в шкафу rack',
      'Ищем постоянное IT-обслуживание для компании',
    ],
  },
  en: {
    heading: 'What needs fixing or setting up?',
    placeholder: 'Describe the task or choose a similar situation below…',
    examples: 'Choose a similar situation',
    all: 'All examples',
    less: 'Collapse the list',
    next: 'Leave a contact. We will agree the scope and a possible time after reading your description.',
    type: 'What do you need?',
    broken: 'It worked, then stopped',
    setup: 'Installation or setup',
    urgency: 'How urgent is it?',
    urgent: 'Urgent',
    soon: 'In the near future',
    flexible: 'No rush',
    address: 'Office address / town (optional)',
    home: [
      'The internet has stopped working in our office',
      'Our cameras have no picture or are not recording',
      'Office Wi-Fi keeps disconnecting devices',
      'An Ethernet socket at a workstation is not working',
      'We need more network points in the office',
      'We are moving offices and need the network connected',
      'The cables in our rack cabinet need organising',
      'We need ongoing IT support for our company',
    ],
  },
  uk: {
    heading: 'Що потрібно виправити або налаштувати?',
    placeholder: 'Опишіть завдання або виберіть схожу ситуацію нижче…',
    examples: 'Виберіть схожу ситуацію',
    all: 'Усі приклади',
    less: 'Згорнути список',
    next: 'Залиште контакт. Після опису узгодимо обсяг робіт і можливий час.',
    type: 'Що потрібно зробити?',
    broken: 'Працювало й перестало',
    setup: 'Монтаж або налаштування',
    urgency: 'Наскільки терміново?',
    urgent: 'Терміново',
    soon: 'Найближчим часом',
    flexible: 'Терміни не горять',
    address: 'Адреса офісу / населений пункт (необов’язково)',
    home: [
      'В офісі перестав працювати інтернет',
      'Камери не показують зображення або не записують',
      'Корпоративний Wi-Fi відключає пристрої',
      'Не працює LAN-розетка на робочому місці',
      'Потрібні нові мережеві точки в офісі',
      'Переїжджаємо до іншого офісу, потрібно підключити мережу',
      'Потрібно впорядкувати кабелі в шафі rack',
      'Шукаємо постійне IT-обслуговування для компанії',
    ],
  },
} satisfies Record<Locale, object>;

export const getEnquiry = (locale: Locale) => copy[locale];
export const getHomeExamples = (locale: Locale) =>
  copy[locale].home.map((text, index) => ({ text, serviceId: homeTopics[index]! }));

// Keep optional context in the stored message, so no D1 migration is needed.
export function enquiryContext(
  locale: Locale,
  values: { requestType: string; urgency: string; address: string },
): string {
  const t = copy[locale];
  const types: Record<string, string> = { broken: t.broken, setup: t.setup };
  const urgencies: Record<string, string> = {
    urgent: t.urgent,
    soon: t.soon,
    flexible: t.flexible,
  };
  const type = Object.hasOwn(types, values.requestType)
    ? types[values.requestType]
    : '';
  const urgency = Object.hasOwn(urgencies, values.urgency)
    ? urgencies[values.urgency]
    : '';
  return [
    type && `${t.type} ${type}`,
    urgency && `${t.urgency} ${urgency}`,
    values.address && `${t.address}: ${values.address}`,
  ]
    .filter(Boolean)
    .join('\n');
}
