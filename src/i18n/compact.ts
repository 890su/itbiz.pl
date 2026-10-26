import type { Locale } from './config';

interface CompactCopy {
  homeLead: string;
  servicesLead: string;
  solutionsLead: string;
  contactLead: string;
  areaLead: string;
  audience: string;
  terms: string;
  result: string;
  limits: string;
  request: string;
}

const copy = {
  pl: {
    homeLead:
      'LAN, Wi‑Fi, monitoring IP i przeprowadzki IT. Wyłącznie dla firm i organizacji w Warszawie i uzgodnionych okolicach.',
    servicesLead: 'Wybierz zadanie. Zakres, koszt i termin potwierdzamy przed pracą.',
    solutionsLead:
      'Wi‑Fi, sieć stanowisk i dostęp gości w biurze. Opisz lokal i liczbę użytkowników.',
    contactLead:
      'Opisz zadanie i podaj adres firmy. Ustalimy zakres, koszt i możliwy termin.',
    areaLead:
      'Warszawa i uzgodnione okolice. Podaj adres firmy, aby potwierdzić dojazd i termin.',
    audience:
      'Sieci i stanowiska pracy małych firm, biur i organizacji. Bez obsługi prywatnych urządzeń i kont.',
    terms: 'Zakres, koszt, materiały i termin ustalamy przed pracą.',
    result: 'Co otrzymasz',
    limits: 'Warunki i ograniczenia',
    request: 'W zgłoszeniu',
  },
  ru: {
    homeLead:
      'LAN, Wi‑Fi, IP-видеонаблюдение и IT-переезды. Только для компаний и организаций в Варшаве и согласованных окрестностях.',
    servicesLead: 'Выберите задачу. Объём, стоимость и срок согласуем до начала работ.',
    solutionsLead:
      'Wi‑Fi, сеть рабочих мест и гостевой доступ в офисе. Укажите помещение и число пользователей.',
    contactLead:
      'Опишите задачу и укажите адрес компании. Согласуем объём, стоимость и возможное время.',
    areaLead:
      'Варшава и согласованные окрестности. Укажите адрес компании для подтверждения выезда и времени.',
    audience:
      'Сети и рабочие места небольших компаний, офисов и организаций. Без обслуживания личных устройств и аккаунтов.',
    terms: 'Объём, стоимость, материалы и время согласуем до начала работ.',
    result: 'Результат',
    limits: 'Условия и ограничения',
    request: 'В заявке',
  },
  en: {
    homeLead:
      'LAN, Wi‑Fi, IP CCTV and office IT moves. Exclusively for businesses and organisations in Warsaw and agreed nearby areas.',
    servicesLead:
      'Choose a task. Scope, cost and timing are agreed before work starts.',
    solutionsLead:
      'Office Wi‑Fi, workstation networks and guest access. Tell us about the premises and number of users.',
    contactLead:
      'Describe the task and give the business address. We will agree the scope, cost and a possible time.',
    areaLead:
      'Warsaw and agreed nearby areas. Give the business address so we can confirm a visit and timing.',
    audience:
      'Networks and workstations for small businesses, offices and organisations. Personal devices and accounts are outside our scope.',
    terms: 'Scope, cost, materials and timing are agreed before work starts.',
    result: 'What you receive',
    limits: 'Conditions and limits',
    request: 'In your enquiry',
  },
  uk: {
    homeLead:
      'LAN, Wi‑Fi, IP-відеоспостереження та IT-переїзди. Лише для компаній і організацій у Варшаві та погоджених околицях.',
    servicesLead:
      'Виберіть завдання. Обсяг, вартість і строк погодимо до початку робіт.',
    solutionsLead:
      'Wi‑Fi, мережа робочих місць і гостьовий доступ в офісі. Вкажіть приміщення та кількість користувачів.',
    contactLead:
      'Опишіть завдання та вкажіть адресу компанії. Погодимо обсяг, вартість і можливий час.',
    areaLead:
      'Варшава та погоджені околиці. Вкажіть адресу компанії для підтвердження виїзду й часу.',
    audience:
      'Мережі та робочі місця малих компаній, офісів і організацій. Без обслуговування особистих пристроїв і облікових записів.',
    terms: 'Обсяг, вартість, матеріали та час погодимо до початку робіт.',
    result: 'Результат',
    limits: 'Умови та обмеження',
    request: 'У заявці',
  },
} satisfies Record<Locale, CompactCopy>;

export const getCompact = (locale: Locale): CompactCopy => copy[locale];
