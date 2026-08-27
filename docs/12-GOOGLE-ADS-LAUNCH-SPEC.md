# Рабочая спецификация запуска Google Ads

Дата подготовки: 2026-08-26
Статус: `PAUSED — до прохождения production-gates`
Объём: только ITBIZ.PL, B2B, Варшава и заранее согласованные ближайшие зоны.
Междоменная каннибализация в эту спецификацию не входит.

## 1. Коммерческий приоритет

Цель первого запуска — не максимальный трафик, а быстрые квалифицированные заявки
на конкретную работу, которую легко распознать и маршрутизировать.

| Очередь | Услуга                                                                 | Почему сейчас                                                              | Посадочная PL                           | Статус                                         |
| ------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------- |
| A1      | Авария сети компании                                                   | Явная срочная потребность и конкретный симптом                             | `/uslugi/awaria-sieci-w-firmie/`        | Первый запуск после настройки приёма заявок    |
| A2      | Авария IP-видеонаблюдения                                              | Срочный B2B-интент: нет изображения/записи, тревога регистратора или PoE   | `/uslugi/awaria-monitoringu-w-firmie/`  | Первый запуск после настройки приёма заявок    |
| A3      | IT-переезд офиса                                                       | Конкретный бриф и потенциально высокая ценность проекта                    | `/uslugi/przeprowadzka-it-biura/`       | Первый запуск                                  |
| A4      | Неисправная розетка/линия LAN                                          | Узкая задача с понятным объёмом и коротким циклом решения                  | `/uslugi/naprawa-gniazda-lan-w-biurze/` | Первый запуск                                  |
| A5      | Аудит Wi‑Fi малого офиса                                               | Измеримая проблема и понятный результат — отчёт и план изменений           | `/uslugi/audyt-wifi-malego-biura/`      | Первый запуск                                  |
| B1      | Новая/расширяемая LAN                                                  | Выше потенциальный чек, но длиннее оценка и больше ценовая конкуренция     | `/uslugi/sieci-lan-dla-firm/`           | Малый отдельный тест                           |
| B2      | Порядок в rack                                                         | Хорошая узкая посадочная, но спрос нужно подтвердить Keyword Planner       | `/uslugi/porzadkowanie-szafy-rack/`     | После первых Search Terms                      |
| C       | Плановая диагностика, внедрение Wi‑Fi, кабели CCTV, экран переговорной | Полезные услуги, но их интенты легче смешиваются со смежными предложениями | Соответствующая страница услуги         | После проверки A/B                             |
| D       | Постоянная IT-поддержка                                                | Конкурентный широкий интент и длиннее цикл продажи                         | `/uslugi/obsluga-it-dla-firm/`          | Отдельная кампания после подтверждения условий |

По текущей выдаче узкий Wi‑Fi-аудит уже продаётся как самостоятельная услуга с
измерениями и отчётом, а структурированное каблирование — как отдельный проект с
обмером, материалами и приёмкой. Поэтому эти намерения нельзя объединять ни в
одной группе, ни на одной посадочной.

## 2. Границы интентов и SEO/Ads-маршрутизация

| Пользовательская задача                | Единственная целевая страница | Не вести на             | Межгрупповые минус-слова                                |
| -------------------------------------- | ----------------------------- | ----------------------- | ------------------------------------------------------- |
| Сеть сейчас не работает                | Авария сети                   | Плановая диагностика    | `okresowo`, `audyt`, `projekt`, `wdrożenie`             |
| Сеть работает нестабильно периодически | Плановая диагностика          | Авария сети             | `awaria`, `pilnie`, `nie działa`, `brak internetu`      |
| Пропало изображение/запись CCTV        | Авария мониторинга IP         | Кабели под мониторинг   | `montaż`, `nowa instalacja`, `trasy kablowe`            |
| Нужны новые кабели к камерам           | Кабели под мониторинг         | Авария мониторинга IP   | `awaria`, `brak obrazu`, `nie nagrywa`, `piszczy`       |
| Не работает один LAN-пункт             | Ремонт LAN-розетки            | Новая LAN               | `projekt`, `nowa sieć`, `okablowanie biura`             |
| Нужна новая сеть или новые точки       | LAN для фирм                  | Ремонт LAN-розетки      | `naprawa`, `uszkodzone`, `nie działa`, `luźne gniazdo`  |
| Нужно измерить существующий Wi‑Fi      | Аудит Wi‑Fi                   | Внедрение Wi‑Fi         | `montaż`, `instalacja`, `nowa sieć`, `wdrożenie`        |
| Нужен проект и монтаж новой Wi‑Fi-сети | Wi‑Fi для офисов              | Аудит Wi‑Fi             | `audyt`, `pomiar`, `raport`, `troubleshooting`          |
| Нужно переставить и описать патч-корды | Порядок в rack                | Постоянная IT-поддержка | `abonament`, `outsourcing`, `helpdesk`, `stała obsługa` |
| Нужна регулярная поддержка             | Постоянная IT-поддержка       | Разовая авария/rack     | `jednorazowo`, `awaria`, `gniazdo`, `porządkowanie`     |

Close variants Google могут пересекать смысл phrase/exact-ключей. Поэтому
маршрутизация контролируется не только типом соответствия, но и общими плюс
межгрупповыми минус-словами, а также ежедневным просмотром Search Terms.

## 3. Production-gates до включения бюджета

На момент подготовки в проекте нет подтверждённого публичного телефона и email,
нет production webhook для немедленного уведомления, нет Google tag/Google Ads
conversion tag. Все услуги намеренно имеют `adEligible: false`.

Кампании остаются на паузе, пока не выполнены все пункты:

1. подтверждён реальный публичный телефон либо принято решение принимать только
   формы;
2. подтверждены реальные часы и скорость обработки — без вымышленного `24/7`,
   `tego samego dnia` и гарантии срока;
3. заявка после успешного API-ответа немедленно попадает ответственному лицу, а
   не только сохраняется в D1;
4. сохранены `serviceId`, `locale`, landing URL, UTM и `gclid`;
5. событие `b2b_lead_submit` срабатывает только после серверного `2xx`;
6. форма проверена в production для каждой рекламируемой страницы;
7. consent по умолчанию остаётся denied до выбора пользователя;
8. рекламные объявления и посадочные проверены как исключительно B2B;
9. только после этого нужным страницам выдаётся отдельный рекламный допуск;
10. кампании создаются или импортируются в состоянии paused и включаются после
    финальной проверки URL, географии, конверсий и оплаты.

## 4. Архитектура первого запуска

### Кампании

| Кампания                          | Группа                  | Доля тестового бюджета | Сеть               |
| --------------------------------- | ----------------------- | ---------------------: | ------------------ |
| `Search-PL-WAW-Network-Emergency` | `Awaria sieci`          |                    25% | Google Search only |
| `Search-PL-WAW-CCTV-Emergency`    | `Awaria monitoringu IP` |                    20% | Google Search only |
| `Search-PL-WAW-Office-IT-Move`    | `Przeprowadzka IT`      |                    20% | Google Search only |
| `Search-PL-WAW-LAN-Outlet`        | `Gniazdo LAN`           |                    15% | Google Search only |
| `Search-PL-WAW-WiFi-Audit`        | `Audyt Wi-Fi`           |                    15% | Google Search only |
| `Search-PL-WAW-LAN-Project-Test`  | `Okablowanie LAN`       |                     5% | Google Search only |

Доли — стартовая гипотеза, не фиксированный медиабюджет. Абсолютный дневной
бюджет утверждается после ввода допустимой стоимости квалифицированной заявки и
маржи по каждой услуге. Срочные аварии, событийный IT-переезд и кабельный проект
не делят общий бюджет, поэтому масштабируются или приостанавливаются независимо.

### Настройки

- цель: Leads;
- только Search; Display expansion, Search Partners, Demand Gen и Performance
  Max выключены на первом этапе;
- география: Варшава плюс только подтверждённые зоны обслуживания;
- location option: `Presence — people in or regularly in targeted locations`;
- язык первой волны: Polish;
- расписание: только те часы, когда реально можно обработать заявку; аварийная
  кампания не работает без оперативного канала уведомления;
- устройства: без стартовых корректировок, решения принимаются по качеству
  заявок;
- демография: без априорных исключений;
- аудитории: только `Observation`, не `Targeting`;
- ключи: exact и phrase на старте; broad — только отдельным поздним
  экспериментом при чистых конверсиях;
- Dynamic Search Ads и автоматически созданные URL не используются в первой
  волне;
- одна RSA на группу при запуске, затем тест второй смысловой версии без
  смешивания интентов;
- заголовки не закреплять без юридической или критически важной причины.

### Аудитории в режиме Observation

Добавить доступные в аккаунте сегменты, не ограничивая ими показ:

- посетители страниц услуг ITBIZ.PL;
- посетители конкретной рекламной услуги;
- business professionals / владельцы и сотрудники малого бизнеса;
- business technology / network and enterprise technology;
- пользователи, начавшие форму, но не отправившие её;
- квалифицированные лиды — после появления согласованной first-party аудитории.

Возраст, пол и предполагаемый доход не являются надёжным признаком B2B-заказчика
для этих услуг, поэтому на старте не исключаются.

## 5. Ключевые слова PL

Синтаксис ниже пригоден как стартовый список: квадратные скобки — exact,
кавычки — phrase.

### `Awaria sieci`

```text
[awaria sieci w firmie]
"awaria sieci w firmie"
[awaria sieci warszawa]
"naprawa sieci w firmie"
"nie działa sieć w biurze"
"brak internetu w firmie"
"diagnostyka awarii sieci"
"awaria routera w firmie"
"awaria switcha w firmie"
"awaria wifi w biurze"
```

### `Gniazdo LAN`

```text
[naprawa gniazda lan]
"naprawa gniazda lan warszawa"
"gniazdo lan nie działa"
"naprawa portu lan w biurze"
"test gniazda lan"
"test kabla sieciowego w biurze"
"uszkodzone gniazdo rj45"
"naprawa kabla lan warszawa"
```

### `Audyt Wi-Fi`

```text
[audyt wifi biura]
"audyt wifi warszawa"
"audyt wi-fi dla firm"
"pomiar wifi w biurze"
"pomiar zasięgu wifi biuro"
"diagnostyka wifi w biurze"
"zrywa wifi w biurze"
"słaby zasięg wifi w biurze"
"analiza sieci wifi firma"
```

### `Okablowanie LAN`

```text
[okablowanie strukturalne warszawa]
"okablowanie strukturalne biura"
"wykonanie sieci lan w biurze"
"instalacja sieci lan firma"
"punkty lan w biurze"
"rozbudowa sieci lan w biurze"
"okablowanie komputerowe biura"
```

### `Awaria monitoringu IP`

```text
[awaria monitoringu w firmie]
"awaria monitoringu warszawa"
"awaria kamer ip"
"brak obrazu z kamer"
"monitoring nie nagrywa"
"rejestrator nie nagrywa"
"rejestrator piszczy"
"rejestrator hałasuje"
"kamery ip offline"
"diagnostyka poe kamer"
"serwis monitoringu dla firm"
"diagnostyka monitoringu ip"
```

### `Przeprowadzka IT`

```text
[przeprowadzka it biura]
"przeprowadzka it warszawa"
"przeniesienie sprzętu it biuro"
"przeniesienie sieci biurowej"
"podłączenie stanowisk po przeprowadzce"
"obsługa it przeprowadzki biura"
```

## 6. Минус-слова

### Общий B2B/quality list

Применить как account/campaign list после проверки, что слово не отсекает
реальный B2B-сценарий:

```text
do domu
domowy
mieszkanie
prywatnie
klient indywidualny
laptop
telefon
smartfon
tablet
konsola
telewizor
serwis komputerowy
naprawa komputera
naprawa laptopa
odzyskiwanie danych
odzyskiwanie hasła
odzyskiwanie konta
wirus
antywirus
sterowniki
praca
oferty pracy
zarobki
kurs
szkolenie
studia
forum
pdf
wiki
youtube
jak zrobić
samodzielnie
schemat za darmo
darmowy
używany
allegro
olx
```

Слова `router`, `switch`, `internet`, `Wi‑Fi`, `kamera`, `ekran` глобально не
исключаются: они имеют прямой B2B-смысл и маршрутизируются на уровне групп.

### Межгрупповые списки

**Авария сети:**

```text
audyt
projekt
projektowanie
wdrożenie
instalacja nowej sieci
okablowanie całego biura
abonament
outsourcing
```

**Плановая диагностика:**

```text
awaria
pilnie
natychmiast
nie działa internet
brak internetu
pogotowie
```

**LAN-розетка:**

```text
projekt
nowa sieć
okablowanie strukturalne
okablowanie całego biura
certyfikacja całej sieci
```

**Новая LAN:**

```text
naprawa
nie działa
uszkodzone
luźne gniazdo
jedno gniazdo
```

**Wi‑Fi-аудит:**

```text
montaż
instalacja
nowa sieć
wdrożenie
hasło
hotspot publiczny
wzmacniacz do domu
repeater do domu
```

**IT-переезд:**

```text
przeprowadzka mieszkania
meble
kartony
transport mebli
firma przeprowadzkowa
magazynowanie
```

**Авария мониторинга IP:**

```text
montaż nowych kamer
instalacja monitoringu
projekt monitoringu
zakup kamer
zestaw monitoringu
kamera do domu
monitoring domu
podgląd w telefonie
hasło do kamery
odzyskiwanie nagrań
odzyskiwanie danych z dysku
instrukcja rejestratora
```

**Новые кабели под мониторинг:**

```text
awaria
brak obrazu
nie nagrywa
piszczy
hałasuje
offline
serwis rejestratora
```

## 7. RSA: готовые тексты PL

Все заголовки укладываются в 30 символов, описания — в 90. В объявлениях нет
неподтверждённых цен, сроков, круглосуточности или гарантии результата.

### Авария сети компании

Final URL: `/uslugi/awaria-sieci-w-firmie/`
Path: `awaria` / `sieci-firmy`

**Headlines**

1. Awaria sieci w firmie
2. Sieć nie działa w biurze
3. Diagnostyka sieci Warszawa
4. Pomoc przy awarii sieci
5. Sprawdzenie LAN i Wi‑Fi
6. Router lub switch nie działa
7. Brak internetu w firmie
8. Diagnoza na miejscu
9. Usługa wyłącznie dla firm
10. Warszawa i okolice
11. Zgłoś problem z siecią
12. Test sieci firmowej
13. Ustal przyczynę awarii
14. Naprawa po uzgodnieniu
15. ITBIZ.PL — sieci dla firm

**Descriptions**

1. Brak internetu, LAN lub Wi‑Fi w biurze? Opisz objawy i poproś o termin diagnozy.
2. Sprawdzamy kabel, gniazdo, router, switch i Wi‑Fi. Wyłącznie dla firm w Warszawie.
3. Termin dojazdu i zakres pierwszej diagnozy potwierdzamy przed przyjęciem zgłoszenia.
4. Po diagnozie przedstawiamy wynik i uzgadniamy koszt dalszych prac przed ich startem.

### Ремонт LAN-розетки

Final URL: `/uslugi/naprawa-gniazda-lan-w-biurze/`
Path: `naprawa` / `gniazda-lan`

**Headlines**

1. Naprawa gniazda LAN
2. Gniazdo LAN nie działa
3. Test linii LAN w biurze
4. Sprawdzenie portu i kabla
5. Naprawa kabla sieciowego
6. Luźne gniazdo w biurze
7. Jedno stanowisko bez LAN
8. Diagnostyka punktu LAN
9. Wymiana modułu RJ45
10. Test przed i po naprawie
11. Usługa dla biur Warszawa
12. Zgłoś niedziałający port
13. Sprawdź tor do szafy rack
14. Naprawa LAN po wycenie
15. ITBIZ.PL — sieci dla firm

**Descriptions**

1. Jedno gniazdo LAN nie działa? Sprawdzimy linię, port, moduł i patch panel w biurze.
2. Testujemy połączenie przed pracą i po niej. Materiały oraz zakres uzgadniamy wcześniej.
3. Usługa dla firm w Warszawie. Opisz objaw i dostęp do szafy rack.
4. Jeśli przyczyną jest zakończenie przewodu, naprawimy je w uzgodnionym zakresie.

### Аудит Wi‑Fi малого офиса

Final URL: `/uslugi/audyt-wifi-malego-biura/`
Path: `audyt-wifi` / `male-biuro`

**Headlines**

1. Audyt Wi‑Fi małego biura
2. Pomiar Wi‑Fi w biurze
3. Słabe Wi‑Fi w firmie?
4. Zrywa Wi‑Fi w biurze?
5. Analiza zasięgu Wi‑Fi
6. Sprawdzenie zakłóceń Wi‑Fi
7. Wi‑Fi dla 5–30 stanowisk
8. Raport i plan zmian Wi‑Fi
9. Audyt Wi‑Fi Warszawa
10. Diagnoza firmowego Wi‑Fi
11. Problem z zasięgiem w biurze
12. Pomiar na miejscu w Warszawie
13. Oddziel Wi‑Fi od łącza
14. Usługa wyłącznie dla firm
15. Zamów ocenę firmowego Wi‑Fi

**Descriptions**

1. Mierzymy zasięg, zakłócenia i obciążenie Wi‑Fi w biurach z 5–30 stanowiskami.
2. Raport rozdziela problemy sieci radiowej od ograniczeń łącza i urządzeń.
3. Najpierw pomiar i konfiguracja, potem plan zmian. Bez obietnic przed audytem.
4. Dla firm w Warszawie. Podaj metraż, liczbę użytkowników i miejsca z problemem.

### Новая или расширяемая LAN

Final URL: `/uslugi/sieci-lan-dla-firm/`
Path: `sieci-lan` / `dla-firm`

**Headlines**

1. Okablowanie biura Warszawa
2. Sieć LAN dla firmy
3. Nowa sieć LAN w biurze
4. Projekt okablowania LAN
5. Punkty LAN dla stanowisk
6. Rozbudowa sieci biurowej
7. Trasy kablowe w biurze
8. Test i opis punktów LAN
9. Sieć firmowa od projektu
10. Okablowanie strukturalne
11. Wycena po ustaleniu zakresu
12. Instalacja LAN dla firm
13. Warszawa — sieci dla biur
14. Zaplanuj sieć w biurze
15. ITBIZ.PL — infrastruktura IT

**Descriptions**

1. Projektujemy nowe punkty i trasy LAN dla biur. Zakres potwierdzamy po oględzinach.
2. Okablowanie, zakończenie, opis i test punktów objętych uzgodnionym projektem.
3. Dla firm w Warszawie. Prześlij plan lokalu, liczbę stanowisk i wymagane punkty.
4. Naprawę jednego gniazda obsługuje osobna usługa. Tutaj planujemy nową lub większą sieć.

### IT-переезд офиса

Final URL: `/uslugi/przeprowadzka-it-biura/`
Path: `przeprowadzka` / `it-biura`

**Headlines**

1. Przeprowadzka IT biura
2. Przeniesienie stanowisk IT
3. Przeprowadzka biura Warszawa
4. Oznaczenie sprzętu i kabli
5. Uruchomienie IT w nowym biurze
6. Plan przeprowadzki IT
7. Biuro gotowe do pracy
8. Test stanowisk po podłączeniu
9. Zmiana lokalizacji firmy
10. IT dla małych biur Warszawa
11. Odłączenie i podłączenie IT
12. Przeprowadzka sieci biurowej
13. Zaplanuj start nowego biura
14. Usługa wyłącznie dla firm
15. ITBIZ.PL — przeprowadzka IT

**Descriptions**

1. Oznaczamy, odłączamy i podłączamy uzgodnione stanowiska oraz sieć małego biura.
2. Najpierw lista sprzętu i zależności, potem plan uruchomienia w nowej lokalizacji.
3. Podaj oba adresy, termin i liczbę stanowisk. Zakres transportu ustalamy osobno.
4. Po podłączeniu testujemy uzgodnione stanowiska i zapisujemy wykryte braki.

### Авария IP-видеонаблюдения

Final URL: `/uslugi/awaria-monitoringu-w-firmie/`
Path: `awaria-cctv` / `dla-firm`

**Headlines**

1. Awaria monitoringu w firmie
2. Kamery nie pokazują obrazu
3. Monitoring nie nagrywa
4. Rejestrator piszczy?
5. Rejestrator hałasuje?
6. Diagnostyka CCTV Warszawa
7. Diagnostyka PoE kamer
8. Kamery IP są offline?
9. Sprawdzenie kamer i PoE
10. Brak obrazu z kamer?
11. Brak zapisu z monitoringu
12. Test sieci monitoringu
13. Awaria CCTV dla firm
14. Warszawa — monitoring firmowy
15. Zgłoś awarię kamer firmowych

**Descriptions**

1. Zniknął obraz, zapis lub kamery są offline? Sprawdzamy sieć, PoE i rejestrator.
2. Rejestrator piszczy albo hałasuje? Odczytujemy statusy i zawężamy przyczynę.
3. Diagnostyka istniejącego monitoringu IP wyłącznie dla firm w Warszawie.
4. Najpierw diagnoza. Wymianę sprzętu i dalsze prace uzgadniamy po wskazaniu usterki.

## 8. Assets

### Sitelinks

Использовать только ссылки того же языка. Для аварийной кампании не подменять
основную услугу широким каталогом.

| Текст               | URL                                     | Описание 1                  | Описание 2                   |
| ------------------- | --------------------------------------- | --------------------------- | ---------------------------- |
| Naprawa gniazda LAN | `/uslugi/naprawa-gniazda-lan-w-biurze/` | Test jednego punktu LAN     | Naprawa po sprawdzeniu linii |
| Audyt Wi‑Fi biura   | `/uslugi/audyt-wifi-malego-biura/`      | Pomiar zasięgu i zakłóceń   | Raport oraz plan zmian       |
| Awaria monitoringu  | `/uslugi/awaria-monitoringu-w-firmie/`  | Obraz, zapis, PoE i sieć    | Diagnostyka dla firm         |
| Sieci LAN dla firm  | `/uslugi/sieci-lan-dla-firm/`           | Nowe punkty i trasy LAN     | Projekt, opis i test         |
| Przeprowadzka IT    | `/uslugi/przeprowadzka-it-biura/`       | Oznaczenie i podłączenie    | Test stanowisk po starcie    |
| Obszar działania    | `/obszar-dzialania/warszawa/`           | Warszawa i ustalone okolice | Warunki dojazdu potwierdzamy |
| O ITBIZ.PL          | `/o-nas/`                               | Usługi IT tylko dla firm    | Jawne dane operatora         |

### Callouts

```text
Wyłącznie dla firm
Warszawa i okolice
Zakres przed rozpoczęciem
Cena przed pracą dodatkową
Dokumentacja wykonanych prac
Formularz dopasowany do usługi
```

### Structured snippets

Header `Service catalog` / польski odpowiedник dostępny w koncie:

```text
Awaria sieci
Awaria monitoringu
Gniazda LAN
Audyt Wi‑Fi
Sieci LAN
Szafy rack
Przeprowadzki IT
```

Call asset добавляется только после подтверждения публичного номера и часов.
Price, promotion и location assets не добавляются без подтверждённых данных.

## 9. Другие языки

RU, EN и UK запускаются отдельными кампаниями с отдельными объявлениями и
посадочными. Google может показывать рекламу многоязычным пользователям по языку,
который они понимают, поэтому смешанная кампания не даёт надёжного контроля
message match.

### Стартовые seed-кластеры

| Услуга      | RU                                                                                                                    | EN                                                                                                 | UK                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Авария сети | `авария сети в офисе варшава`, `не работает интернет в компании`, `диагностика сети офиса`                            | `business network emergency Warsaw`, `office network down Warsaw`, `business internet outage help` | `аварія мережі в офісі варшава`, `не працює інтернет у компанії`, `діагностика мережі офісу`                       |
| Авария CCTV | `авария видеонаблюдения варшава`, `пропало изображение с камер`, `регистратор не записывает`, `диагностика poe камер` | `business CCTV outage Warsaw`, `CCTV recorder not recording`, `IP camera PoE diagnostics`          | `аварія відеоспостереження варшава`, `зникло зображення з камер`, `реєстратор не записує`, `діагностика poe камер` |
| IT-переезд  | `it переезд офиса варшава`, `перенос рабочих мест офиса`, `переезд компьютерной сети`                                 | `office IT move Warsaw`, `workstation relocation Warsaw`, `office network relocation`              | `it переїзд офісу варшава`, `перенесення робочих місць офісу`, `переїзд офісної мережі`                            |
| LAN-розетка | `ремонт lan розетки варшава`, `не работает сетевой порт в офисе`, `проверка кабеля lan`                               | `office LAN outlet repair Warsaw`, `network socket not working`, `business ethernet cable test`    | `ремонт lan розетки варшава`, `не працює мережевий порт в офісі`, `перевірка кабелю lan`                           |
| Wi‑Fi-аудит | `аудит wifi офиса варшава`, `измерение wifi в офисе`, `плохой wifi в компании`                                        | `small office WiFi audit Warsaw`, `office WiFi survey`, `business WiFi coverage test`              | `аудит wifi офісу варшава`, `вимірювання wifi в офісі`, `поганий wifi у компанії`                                  |

### Локализованные общие минус-слова

| RU                                                                                                                                  | EN                                                                                                                    | UK                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `для дома`, `квартира`, `частный`, `ремонт ноутбука`, `ремонт телефона`, `вакансии`, `работа`, `курс`, `бесплатно`, `своими руками` | `home`, `residential`, `private customer`, `laptop repair`, `phone repair`, `jobs`, `salary`, `course`, `free`, `DIY` | `для дому`, `квартира`, `приватний`, `ремонт ноутбука`, `ремонт телефону`, `вакансії`, `робота`, `курс`, `безкоштовно`, `своїми руками` |

Для каждого языка сохраняется прямое соответствие:

```text
keyword language = ad language = landing language = form language
```

Переводы уже имеют собственные URL, canonical и reciprocal hreflang. Рекламный
запуск перевода разрешается только после ручной языковой проверки объявления и
страницы.

## 10. Измерение и качество денег

### События

Primary:

```text
b2b_lead_submit
```

Secondary/diagnostic:

```text
service_cta_click
lead_form_start
lead_form_validation_error
phone_click
email_click
language_switch
```

### Этапы лида

1. `submitted` — форма принята сервером;
2. `contacted` — с организацией состоялся контакт;
3. `qualified` — подтверждены B2B, география, инфраструктура и реальная задача;
4. `quoted` — отправлено предложение или согласована стоимость;
5. `won` — работа оплачена;
6. `lost` — причина потери выбрана из фиксированного списка.

Оптимизировать бюджет нужно по `qualified` и `won`, а не по CTR и количеству
непроверенных форм. Для дальнейшего импорта лидов сохраняются click ID и
минимально необходимые first-party данные. Enhanced conversions for leads
настраиваются только после проверки consent и правил обработки данных.

## 11. Ритм оптимизации

### До старта

- проверить каждую final URL на production;
- сделать тестовую B2B-заявку с каждой посадочной;
- проверить consent, событие success, UTM и click ID;
- проверить рекламный кабинет на consumer technical support policy;
- оставить все кампании paused до финального чек-листа.

### Первые 7 дней

- Search Terms и географию смотреть ежедневно;
- нерелевантные consumer/education/job-запросы добавлять в общий список;
- пересекающиеся запросы переносить в правильную группу через negative routing;
- не принимать решение по объявлению на единичных кликах;
- фиксировать причину каждого некачественного лида.

### Далее

- еженедельно сравнивать расходы, `qualified`, `quoted`, `won` по услугам;
- бюджет переносить в услугу с лучшей стоимостью квалифицированного лида и
  реальной доступностью исполнителя;
- broad match, Search Partners и новые языки тестировать по одному изменению;
- если запрос нельзя однозначно сопоставить одной услуге, сначала уточнить
  посадочную/семантику, а не расширять охват;
- широкую постоянную IT-поддержку запускать отдельно от разовых работ.

## 12. Основания и актуальные ограничения Google

- Google запрещает рекламу сторонней технической поддержки для consumer
  technology, но прямо допускает услуги, предоставляемые исключительно бизнесу:
  [Third-party consumer technical support](https://support.google.com/adspolicy/answer/13527027?hl=en).
- Exact, phrase и broad охватывают смысл и close variants, поэтому одного
  синтаксиса ключей недостаточно:
  [Google Ads keyword matching](https://support.google.com/google-ads/answer/14996023?hl=en).
- Для локальной выездной услуги нужен режим присутствия, иначе настройка по
  умолчанию может включать пользователей, лишь проявивших интерес к Варшаве:
  [Advanced location options](https://support.google.com/google-ads/answer/1722038?hl=en).
- `Observation` даёт отчётность по аудиториям, не сужая поисковый охват:
  [Audience targeting and observation](https://support.google.com/google-ads/answer/7068417?hl=en).
- RSA поддерживает до 15 заголовков по 30 символов и до 4 описаний по 90:
  [Responsive search ads](https://support.google.com/google-ads/answer/7684791?hl=en-0).
- Для пользователей EEA consent должен отдельно управлять advertising storage,
  user data и personalization:
  [Consent mode reference](https://support.google.com/google-ads/answer/13802165).
- Для квалифицированных/оплаченных лидов Google рекомендует enhanced conversions
  for leads и Data Manager:
  [Enhanced conversions for leads](https://support.google.com/google-ads/answer/15713840?hl=en).

## 13. Решение о запуске

Технически и контентно страницы подготовлены, но рекламный бюджет пока не
включается. Следующая реализация — production-уведомление, подтверждённый канал
контакта и конверсионная аналитика. После этих трёх пунктов включаются отдельные
PL Search-кампании A1–A5. Кабельный проект B1 и остальные языки добавляются по
данным о квалифицированных заявках.
