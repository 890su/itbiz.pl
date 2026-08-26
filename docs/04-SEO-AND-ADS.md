# SEO и контекстная реклама

## 1. Роль каналов

```text
Google Search → страницы Usługi → квалифицированный B2B-лид
Organic Search → Usługi + Rozwiązania + Realizacje + Instrukcje
Remarketing → возврат посетителей Usługi после consent и накопления аудитории
```

На старте Display, YouTube, Demand Gen и Performance Max не заменяют Search.
Сначала подтверждается конверсия высокоинтентных запросов.

## 2. Семантическая модель

Каждая рекламируемая услуга получает отдельный кластер. Нельзя направлять все
запросы на главную.

| Service ID | Основной PL-интент | Посадочная |
|---|---|---|
| `managed-it` | obsługa IT dla firm Warszawa | `/uslugi/obsluga-it-dla-firm/` |
| `lan-installation` | sieci LAN dla firm Warszawa | `/uslugi/sieci-lan-dla-firm/` |
| `office-wifi` | WiFi dla biura Warszawa | `/uslugi/wifi-dla-biur/` |
| `network-repair` | naprawa sieci firmowej Warszawa | `/uslugi/diagnostyka-i-naprawa-sieci-firmowej/` |
| `ip-monitoring` | monitoring IP dla firm Warszawa | `/uslugi/monitoring-ip-dla-firm/` |
| `workstations` | konfiguracja stanowisk pracy firma | `/uslugi/konfiguracja-stanowisk-pracy/` |
| `it-care` | opieka informatyczna dla firm Warszawa | `/uslugi/opieka-it-w-abonamencie/` |

До публикации проверяются Keyword Planner, фактические Search Terms и реальная
способность выполнять услугу. Страницы не создаются только ради ключевого слова.

## 3. Требования к рекламной посадочной

Above the fold обязан подтверждать четыре вещи без прокрутки:

1. это услуга исключительно для компаний/организаций;
2. какая конкретно работа предлагается;
3. где она оказывается;
4. что произойдёт после CTA.

Message match:

```text
Keyword: WiFi dla biura Warszawa
Ad: Projekt i poprawa Wi‑Fi dla firm
H1: Wi‑Fi dla biur i lokali firmowych w Warszawie
CTA: Poproś o ocenę firmowej sieci Wi‑Fi
Form serviceId: office-wifi
```

Нельзя использовать один общий CTA `Wyślij` без контекста. Предпочтительные CTA:

- `Poproś o wycenę`;
- `Umów rozmowę techniczną`;
- `Opisz sieć firmową`;
- `Zamów ocenę zakresu prac`.

Слово `bezpłatna` применяется только после подтверждения реального бесплатного
этапа и его условий.

## 4. B2B-only policy boundary

- на страницах услуг видимо `Wyłącznie dla firm i organizacji`;
- форма требует название организации и подтверждение обращения от её имени;
- не используются слова/примеры `dom`, `klient prywatny`, личный ноутбук, личный
  роутер, восстановление аккаунта и т.п.;
- нет service-ссылок на consumer сайт;
- владелец, телефон и адрес остаются настоящими и согласованными;
- всем посетителям и crawler показывается одинаковый контент;
- отдельный домен не описывается как отдельная юридическая компания, если её нет.

## 5. Campaign architecture

Отдельная Search campaign для каждого языка:

```text
Search | PL | Warszawa | B2B
Search | RU | Warszawa | B2B
Search | UK | Warszawa | B2B
Search | EN | Warszawa | B2B
```

Внутри — ad groups по услуге, а не один mixed ad group. Бюджеты и статусы языков
независимы. На старте:

- exact и phrase match;
- location option — присутствие в целевой географии, не только интерес к ней;
- Warsaw target + проверенные радиусы/почтовые коды;
- дальние зоны исключаются или получают отдельную кампанию;
- Search Partners и Display expansion отключены до получения данных;
- автоматические URL/тексты включаются только после проверки.

Микрорайоны регулируются campaign/location settings. Нельзя обещать отдельную
ставку для района, которого нет как target entity: тогда применяются радиусы,
postal codes, exclusions или отдельные кампании.

## 6. Negative keywords

Стартовый общий список требует проверки реальными Search Terms:

```text
prywatnie
do domu
domowy
laptop prywatny
naprawa telefonu
serwis telefonu
odzyskiwanie hasła
odzyskiwanie konta
za darmo
praca
oferty pracy
kurs
szkolenie
forum
pdf
jak zrobić samemu
```

Нельзя слепо исключать слова, которые могут иметь B2B-смысл. Решение принимается
на уровне query и услуги.

## 7. Измерение

Primary conversion:

- подтверждённая сервером отправка B2B-формы.

Secondary conversions:

- телефонный клик;
- email-клик;
- длинный квалифицированный звонок при доступности call reporting;
- запрос направления/контакта.

Диагностические события:

```text
service_cta_click
lead_form_start
lead_form_validation_error
b2b_lead_submit
phone_click
email_click
solution_to_service_click
realization_to_service_click
language_switch
privacy_settings_open
```

Событие `b2b_lead_submit` отправляется только после `2xx` success от endpoint.
UTM, `gclid` и landing service сохраняются без добавления лишних персональных
данных.

## 8. SEO on-page

Каждая индексируемая страница имеет:

- уникальные title и meta description;
- один H1;
- интентно согласованные H2;
- self-canonical;
- reciprocal hreflang;
- breadcrumbs;
- релевантные внутренние связи, а не generic «подробнее»;
- дату обновления для решений/инструкций, если она правдива;
- alt text, описывающий полезное содержание схемы/изображения;
- schema, совпадающую с видимым контентом.

Meta keywords не используются. FAQ создаётся для ответа пользователю, а не ради
разметки. Структурированные данные не содержат скрытых отзывов и цен.

## 9. Internal linking

- главная → приоритетные услуги;
- каждая услуга → 2–4 подходящих решения;
- решение → услуги, которыми оно реализуется;
- реализация → использованные услуга и решение;
- инструкция → релевантное решение, затем ненавязчиво услуга;
- sibling services связываются только при реальной последовательности работ.

Anchor должен описывать назначение страницы: `projekt firmowej sieci LAN`, а не
`czytaj więcej`.

## 10. Локальное SEO

- единая корректная NAP-информация;
- `ProfessionalService`/`LocalBusiness` данные без вымышленного офиса;
- service area описывается честно;
- Google Business Profile подключается только если соответствует требованиям;
- районные страницы не клонируются;
- кейсы и локальные факты постепенно усиливают Warsaw page.

## 11. Контентные ограничения

Не публиковать:

- SEO-тексты, повторяющие один абзац с заменой района;
- автоматически переведённые рекламные посадочные без проверки;
- вымышленные отзывы и logos клиентов;
- неподтверждённые `24/7`, `tego samego dnia`, `100%`, `najlepszy`;
- цены, которые нельзя выполнить на описанных условиях;
- AI-generated case studies, выдаваемые за реальные.

## 12. Launch sequence

1. Индексация и Search Console PL.
2. Создание PL Search campaign paused.
3. Проверка destination, phone asset и conversions.
4. Ограниченный PL launch.
5. Search Terms review каждые 1–2 дня на старте.
6. RU/UK/EN запускаются отдельно после готовности соответствующих страниц.
7. Remarketing — только после consent QA и достаточного размера аудитории.
8. Demand Gen/Display — только как отдельный эксперимент, не смешанный с Search.
