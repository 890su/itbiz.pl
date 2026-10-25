import type { Locale, TranslationKey } from './config';

export type ServiceKey = Extract<TranslationKey, `service.${string}`>;

export const serviceJourneys: readonly (readonly ServiceKey[])[] = [
  ['service.network-emergency', 'service.cctv-emergency', 'service.lan-outlet-repair'],
  ['service.office-it-move', 'service.lan-installation'],
  ['service.small-office-wifi-audit', 'service.managed-it'],
];

interface ExperienceCopy {
  homeLead: string;
  call: string;
  chooseTitle: string;
  chooseLead: string;
  groups: { title: string; description: string }[];
  allServices: string;
  serviceNames: Record<ServiceKey, string>;
  handoverTitle: string;
  handoverLead: string;
  sampleLabel: string;
  sampleTitle: string;
  sampleRows: [string, string][];
  toolTitle: string;
  toolLead: string;
  cctv: {
    intro: string;
    diagramTitle: string;
    diagramNote: string;
    nodes: [string, string][];
    scopeTitle: string;
    symptomsTitle: string;
    formLead: string;
    messageHelp: string;
    photoHelp: string;
    resultTitle: string;
  };
  form: {
    errorsTitle: string;
    contactError: string;
    minimum: string;
  };
}

const experience = {
  pl: {
    homeLead:
      'Sieci LAN, Wi‑Fi i infrastruktura małych biur. Naprawiamy usterki, przygotowujemy instalacje i pomagamy przy przeprowadzkach IT. Wyłącznie dla firm i organizacji.',
    call: 'Zadzwoń',
    chooseTitle: 'Z czym potrzebuje pomocy Twoja firma?',
    chooseLead:
      'Wybierz sytuację. Na stronie usługi znajdziesz zakres prac i formularz z wybranym tematem.',
    groups: [
      {
        title: 'Coś przestało działać',
        description: 'Brak internetu, obrazu z kamer lub zapisu.',
      },
      {
        title: 'Biuro się zmienia',
        description: 'Przeprowadzka, nowe stanowiska i okablowanie.',
      },
      {
        title: 'Potrzebna jest kontrola lub opieka',
        description: 'Pomiary Wi‑Fi i stała obsługa infrastruktury.',
      },
    ],
    allServices: 'Zobacz wszystkie usługi',
    serviceNames: {
      'service.network-emergency': 'Awaria sieci i internetu',
      'service.cctv-emergency': 'Awaria monitoringu IP',
      'service.lan-outlet-repair': 'Naprawa gniazda LAN',
      'service.office-it-move': 'Przeprowadzka IT biura',
      'service.small-office-wifi-audit': 'Audyt Wi‑Fi małego biura',
      'service.rack-cabinet-cleanup': 'Porządkowanie szafy rack',
      'service.lan-installation': 'Okablowanie LAN',
      'service.office-wifi': 'Projekt i konfiguracja Wi‑Fi',
      'service.managed-it': 'Stała obsługa IT',
      'service.network-repair': 'Planowa diagnostyka sieci',
      'service.cctv-cabling': 'Okablowanie kamer IP',
      'service.meeting-room-display': 'Montaż ekranu w biurze',
    },
    handoverTitle: 'Wynik pracy, do którego można wrócić',
    handoverLead:
      'Zapisujemy sprawdzone elementy, wykonane zmiany i zalecenia. Zakres dokumentacji zależy od uzgodnionej usługi.',
    sampleLabel: 'Przykładowa struktura dokumentacji, nie opis realizacji.',
    sampleTitle: 'Zakres / testy / dalsze kroki',
    sampleRows: [
      ['Elementy', 'Urządzenia, porty lub linie objęte pracą'],
      ['Wynik', 'Co sprawdzono i jakie zmiany wykonano'],
      ['Dalsze kroki', 'Zalecenia i prace wymagające osobnej decyzji'],
    ],
    toolTitle: 'Chcesz sprawdzić połączenie na tym urządzeniu?',
    toolLead:
      'Pomocniczy test internetu i prognoza dla Warszawy. Nie zastępuje diagnostyki sieci firmy.',
    cctv: {
      intro:
        'Nie ma obrazu, zapisu albo rejestrator piszczy? Sprawdzamy kamery IP, sieć, zasilanie PoE i rejestrator. Możliwość i termin wizyty potwierdzamy przed rozpoczęciem prac.',
      diagramTitle: 'Gdzie szukamy przyczyny',
      diagramNote: 'Zakres diagnostyki, nie podgląd stanu Twojego systemu.',
      nodes: [
        ['Zasilanie', 'PoE, port i zasilacz'],
        ['Połączenie', 'Przewód, switch i adresacja'],
        ['Kamera', 'Dostępność i obraz'],
        ['Zapis', 'Rejestrator i nośnik'],
      ],
      scopeTitle: 'Co sprawdzamy',
      symptomsTitle: 'Czy to podobny problem?',
      formLead:
        'Na początek wystarczy krótki opis problemu i adres firmy. Termin oraz zakres diagnostyki potwierdzimy po zapoznaniu się ze zgłoszeniem.',
      messageHelp:
        'Napisz, co nie działa i ilu kamer dotyczy problem. Model rejestratora, komunikaty i dostęp administracyjny podaj, jeśli je znasz. Nie wysyłaj haseł.',
      photoHelp:
        'Zdjęcia ekranu lub szafy można przesłać e-mailem. Do pierwszego zgłoszenia wystarczy opis.',
      resultTitle: 'Co otrzymasz po diagnostyce',
    },
    form: {
      errorsTitle: 'Sprawdź zaznaczone pola.',
      contactError:
        'Podaj poprawny e-mail albo telefon zawierający co najmniej 7 cyfr.',
      minimum: 'Min. 20 znaków, bez haseł.',
    },
  },
  ru: {
    homeLead:
      'Сети LAN, Wi‑Fi и инфраструктура небольших офисов. Устраняем неисправности, прокладываем кабели и помогаем с IT-переездом. Только для компаний и организаций.',
    call: 'Позвонить',
    chooseTitle: 'Какая помощь нужна вашей компании?',
    chooseLead:
      'Выберите ситуацию. На странице услуги есть состав работ и форма с уже выбранной темой.',
    groups: [
      {
        title: 'Что-то перестало работать',
        description: 'Нет интернета, изображения с камер или записи.',
      },
      { title: 'Офис меняется', description: 'Переезд, новые рабочие места и кабели.' },
      {
        title: 'Нужна проверка или обслуживание',
        description: 'Измерения Wi‑Fi и постоянная поддержка инфраструктуры.',
      },
    ],
    allServices: 'Посмотреть все услуги',
    serviceNames: {
      'service.network-emergency': 'Авария сети и интернета',
      'service.cctv-emergency': 'Авария IP-видеонаблюдения',
      'service.lan-outlet-repair': 'Ремонт розетки LAN',
      'service.office-it-move': 'IT-переезд офиса',
      'service.small-office-wifi-audit': 'Аудит Wi‑Fi небольшого офиса',
      'service.rack-cabinet-cleanup': 'Порядок в шкафу rack',
      'service.lan-installation': 'Прокладка сети LAN',
      'service.office-wifi': 'Проектирование и настройка Wi‑Fi',
      'service.managed-it': 'Постоянное IT-обслуживание',
      'service.network-repair': 'Плановая диагностика сети',
      'service.cctv-cabling': 'Кабели для IP-камер',
      'service.meeting-room-display': 'Монтаж экрана в офисе',
    },
    handoverTitle: 'Результат работы, к которому можно вернуться',
    handoverLead:
      'Записываем проверенные элементы, выполненные изменения и рекомендации. Состав документации зависит от согласованной услуги.',
    sampleLabel: 'Пример структуры документации, не описание выполненного проекта.',
    sampleTitle: 'Объём / проверки / дальнейшие шаги',
    sampleRows: [
      ['Элементы', 'Устройства, порты или линии в составе работ'],
      ['Результат', 'Что проверили и какие изменения выполнили'],
      ['Дальнейшие шаги', 'Рекомендации и работы для отдельного согласования'],
    ],
    toolTitle: 'Хотите проверить соединение на этом устройстве?',
    toolLead:
      'Вспомогательный тест интернета и прогноз для Варшавы. Не заменяет диагностику сети компании.',
    cctv: {
      intro:
        'Нет изображения, записи или регистратор пищит? Проверяем IP-камеры, сеть, питание PoE и регистратор. Возможность и время визита подтверждаем до начала работ.',
      diagramTitle: 'Где ищем причину',
      diagramNote: 'Состав диагностики, не показ состояния вашей системы.',
      nodes: [
        ['Питание', 'PoE, порт и блок питания'],
        ['Соединение', 'Кабель, коммутатор и адресация'],
        ['Камера', 'Доступность и изображение'],
        ['Запись', 'Регистратор и накопитель'],
      ],
      scopeTitle: 'Что проверяем',
      symptomsTitle: 'Похоже на вашу проблему?',
      formLead:
        'Для первого обращения достаточно кратко описать проблему и указать адрес компании. Изучим заявку и подтвердим сроки и объём диагностики.',
      messageHelp:
        'Напишите, что не работает и сколько камер затронуто. Модель регистратора, сообщения и наличие административного доступа укажите, если знаете. Не отправляйте пароли.',
      photoHelp:
        'Фото экрана или шкафа можно отправить по e-mail. Для первой заявки достаточно описания.',
      resultTitle: 'Что вы получите после диагностики',
    },
    form: {
      errorsTitle: 'Проверьте отмеченные поля.',
      contactError: 'Укажите корректный e-mail или телефон минимум из 7 цифр.',
      minimum: 'От 20 символов, без паролей.',
    },
  },
  en: {
    homeLead:
      'LAN, Wi‑Fi and small office infrastructure. We repair faults, install cabling and help with office IT moves. For businesses and organisations only.',
    call: 'Call',
    chooseTitle: 'What does your business need help with?',
    chooseLead:
      'Choose your situation. Each service page explains the work and has an enquiry form with the topic already selected.',
    groups: [
      {
        title: 'Something has stopped working',
        description: 'No internet, camera image or recording.',
      },
      {
        title: 'The office is changing',
        description: 'A move, new workstations or cabling.',
      },
      {
        title: 'You need a check or ongoing support',
        description: 'Wi‑Fi measurements and recurring infrastructure support.',
      },
    ],
    allServices: 'View all services',
    serviceNames: {
      'service.network-emergency': 'Network and internet outage',
      'service.cctv-emergency': 'IP CCTV outage',
      'service.lan-outlet-repair': 'LAN outlet repair',
      'service.office-it-move': 'Office IT move',
      'service.small-office-wifi-audit': 'Small office Wi‑Fi audit',
      'service.rack-cabinet-cleanup': 'Rack cabinet cleanup',
      'service.lan-installation': 'LAN cabling',
      'service.office-wifi': 'Wi‑Fi design and setup',
      'service.managed-it': 'Ongoing IT support',
      'service.network-repair': 'Planned network diagnostics',
      'service.cctv-cabling': 'IP camera cabling',
      'service.meeting-room-display': 'Office display installation',
    },
    handoverTitle: 'A record you can refer to after the work',
    handoverLead:
      'We record checked components, changes and recommendations. The documentation depends on the agreed service.',
    sampleLabel: 'Example documentation structure, not a completed client project.',
    sampleTitle: 'Scope / checks / next steps',
    sampleRows: [
      ['Components', 'Devices, ports or lines included in the work'],
      ['Findings', 'What was checked and what was changed'],
      ['Next steps', 'Recommendations and work requiring separate agreement'],
    ],
    toolTitle: 'Want to check the connection on this device?',
    toolLead:
      'A basic internet test and Warsaw weather forecast. It does not replace diagnostics of your business network.',
    cctv: {
      intro:
        'No image or recording, or a beeping recorder? We check IP cameras, the network, PoE power and the recorder. We confirm whether and when we can visit before work begins.',
      diagramTitle: 'Where we look for the cause',
      diagramNote: 'Diagnostic scope, not a live view of your system.',
      nodes: [
        ['Power', 'PoE, port and power supply'],
        ['Connection', 'Cable, switch and addressing'],
        ['Camera', 'Availability and image'],
        ['Recording', 'Recorder and storage'],
      ],
      scopeTitle: 'What we check',
      symptomsTitle: 'Does this sound familiar?',
      formLead:
        'Start with a short description of the problem and your business address. We will review the enquiry and confirm timing and diagnostic scope.',
      messageHelp:
        'Tell us what is not working and how many cameras are affected. Include the recorder model, alerts and whether you have admin access, if known. Do not send passwords.',
      photoHelp:
        'Screen or cabinet photos can be sent by email. A description is enough for the first enquiry.',
      resultTitle: 'What you receive after diagnostics',
    },
    form: {
      errorsTitle: 'Check the marked fields.',
      contactError: 'Enter a valid email or a phone number with at least 7 digits.',
      minimum: 'At least 20 characters, no passwords.',
    },
  },
  uk: {
    homeLead:
      'Мережі LAN, Wi‑Fi та інфраструктура невеликих офісів. Усуваємо несправності, прокладаємо кабелі й допомагаємо з IT-переїздом. Лише для компаній та організацій.',
    call: 'Зателефонувати',
    chooseTitle: 'Яка допомога потрібна вашій компанії?',
    chooseLead:
      'Оберіть ситуацію. На сторінці послуги є перелік робіт і форма з уже вибраною темою.',
    groups: [
      {
        title: 'Щось перестало працювати',
        description: 'Немає інтернету, зображення з камер або запису.',
      },
      {
        title: 'Офіс змінюється',
        description: 'Переїзд, нові робочі місця та кабелі.',
      },
      {
        title: 'Потрібна перевірка чи обслуговування',
        description: 'Вимірювання Wi‑Fi та постійна підтримка інфраструктури.',
      },
    ],
    allServices: 'Переглянути всі послуги',
    serviceNames: {
      'service.network-emergency': 'Аварія мережі та інтернету',
      'service.cctv-emergency': 'Аварія IP-відеоспостереження',
      'service.lan-outlet-repair': 'Ремонт розетки LAN',
      'service.office-it-move': 'IT-переїзд офісу',
      'service.small-office-wifi-audit': 'Аудит Wi‑Fi невеликого офісу',
      'service.rack-cabinet-cleanup': 'Порядок у шафі rack',
      'service.lan-installation': 'Прокладання мережі LAN',
      'service.office-wifi': 'Проєктування й налаштування Wi‑Fi',
      'service.managed-it': 'Постійне IT-обслуговування',
      'service.network-repair': 'Планова діагностика мережі',
      'service.cctv-cabling': 'Кабелі для IP-камер',
      'service.meeting-room-display': 'Монтаж екрана в офісі',
    },
    handoverTitle: 'Результат роботи, до якого можна повернутися',
    handoverLead:
      'Записуємо перевірені елементи, виконані зміни й рекомендації. Склад документації залежить від погодженої послуги.',
    sampleLabel: 'Приклад структури документації, не опис виконаного проєкту.',
    sampleTitle: 'Обсяг / перевірки / подальші кроки',
    sampleRows: [
      ['Елементи', 'Пристрої, порти або лінії в складі робіт'],
      ['Результат', 'Що перевірили та які зміни виконали'],
      ['Подальші кроки', 'Рекомендації та роботи для окремого погодження'],
    ],
    toolTitle: 'Хочете перевірити з’єднання на цьому пристрої?',
    toolLead:
      'Допоміжний тест інтернету та прогноз для Варшави. Не замінює діагностику мережі компанії.',
    cctv: {
      intro:
        'Немає зображення, запису чи реєстратор пищить? Перевіряємо IP-камери, мережу, живлення PoE та реєстратор. Можливість і час візиту підтверджуємо до початку робіт.',
      diagramTitle: 'Де шукаємо причину',
      diagramNote: 'Склад діагностики, не показ стану вашої системи.',
      nodes: [
        ['Живлення', 'PoE, порт і блок живлення'],
        ['З’єднання', 'Кабель, комутатор та адресація'],
        ['Камера', 'Доступність і зображення'],
        ['Запис', 'Реєстратор і накопичувач'],
      ],
      scopeTitle: 'Що перевіряємо',
      symptomsTitle: 'Схоже на вашу проблему?',
      formLead:
        'Для першого звернення достатньо коротко описати проблему та вказати адресу компанії. Розглянемо заявку й підтвердимо строки та обсяг діагностики.',
      messageHelp:
        'Напишіть, що не працює і скільки камер охоплює проблема. Модель реєстратора, повідомлення та наявність адміністративного доступу вкажіть, якщо знаєте. Не надсилайте паролів.',
      photoHelp:
        'Фото екрана або шафи можна надіслати електронною поштою. Для першої заявки достатньо опису.',
      resultTitle: 'Що ви отримаєте після діагностики',
    },
    form: {
      errorsTitle: 'Перевірте позначені поля.',
      contactError: 'Вкажіть коректний e-mail або телефон щонайменше із 7 цифр.',
      minimum: 'Від 20 символів, без паролів.',
    },
  },
} satisfies Record<Locale, ExperienceCopy>;

export function getExperience(locale: Locale): ExperienceCopy {
  return experience[locale];
}
