# UI/UX и дизайн-концепция

## 1. Направление

Предмет: инженерная IT-инфраструктура малого бизнеса в Варшаве.

Задача интерфейса: за 10–20 секунд помочь представителю компании понять, что
подрядчик работает с B2B, умеет решить его конкретную задачу и предлагает
понятный следующий шаг.

Дизайн наследует принципы 890.by, но не копирует его страницу:

- правая фиксированная навигация desktop;
- тёмная тема как характерная основная подача и полноценная светлая тема;
- спокойные синие акценты;
- компактные технические карточки;
- минимум декоративного шума;
- быстрые статические страницы.

Для ITBIZ главная становится коммерческой B2B-страницей, а не формой «Что
случилось?». Sidebar получает CTA, language switcher и контакт.

## 2. Design tokens

Основная палитра:

| Token      |       Hex | Назначение                         |
| ---------- | --------: | ---------------------------------- |
| `night`    | `#020617` | основной dark canvas               |
| `panel`    | `#0F172A` | sidebar и карточки dark            |
| `line`     | `#1E293B` | границы и техническая сетка        |
| `signal`   | `#3B82F6` | primary CTA и активная навигация   |
| `network`  | `#38BDF8` | схемы, ссылки, secondary accent    |
| `verified` | `#14B8A6` | success и подтверждённые состояния |

Светлая тема использует `#F8FAFC`, белые панели и те же semantic accents. Цвет
не является единственным способом сообщить состояние.

Типографика:

- Manrope — заголовки и крупное позиционирование;
- Inter — интерфейс, формы и основной текст;
- IBM Plex Mono — network labels, технические параметры и схемы.

Шрифты self-hosted, с ограниченным числом начертаний. Если итоговый visual QA
покажет расхождение с характером 890.by, Inter остаётся fallback и baseline.

## 3. Layout

Desktop:

```text
┌──────────────────────────────────────────────────┬─────────────────────┐
│ main content max 1120 px                         │ ITBIZ.PL             │
│                                                  │ Start               │
│ [service eligibility — only on ad landings]      │ Usługi              │
│ H1 + value proposition      [service blueprint]  │ Rozwiązania         │
│ CTA / phone                                      │ Realizacje          │
│                                                  │ Instrukcje          │
│ outcomes → scope → process → evidence → form     │ Kontakt             │
│                                                  │                     │
│                                                  │ [Poproś o wycenę]   │
│                                                  │ PL RU EN UA / theme │
└──────────────────────────────────────────────────┴─────────────────────┘
```

Sidebar шириной около 272–288 px фиксирован справа. Основная колонка не должна
становиться узкой: на больших экранах используется до 1120 px, статья/текст —
680–760 px.

Смысловые секции чередуют два близких тона: в light theme — белый/холодный
серо-голубой, в dark theme — базовый тёмный/приглушённый более светлый слой.
Карточки сохраняют собственную поверхность, чтобы иерархия читалась без
дополнительных декоративных маркеров.

Mobile:

```text
┌──────────────────────────────┐
│ ITBIZ.PL          PL     ☰   │
├──────────────────────────────┤
│ service eligibility         │
│ H1                           │
│ value                        │
│ [Poproś o wycenę]            │
│ [Zadzwoń]                    │
│ compact blueprint            │
│ content sections             │
│ sticky CTA after intent      │
└──────────────────────────────┘
```

Mobile sticky CTA появляется после выхода hero из viewport и не перекрывает CMP,
клавиатуру или footer.

## 4. Signature element

Запоминающийся элемент ITBIZ — `service blueprint`: компактная техническая схема
сети/рабочего процесса, относящаяся к конкретной услуге.

Пример для Wi‑Fi:

```text
Internet ─ Firewall ─ Managed switch ─ AP biuro
                         ├──────────── AP sala
                         └─ VLAN goście
```

Это не декоративный fake dashboard. Узлы схемы соответствуют содержанию страницы,
имеют текстовое описание и помогают объяснить результат. На hover/focus можно
показать краткую роль узла; без JavaScript схема остаётся понятной.

Связь `Usługa → Rozwiązanie → Realizacja` визуально поддерживается тонкой
network-line, но только там, где она объясняет реальную связь.

## 5. Главная

Hero:

- eyebrow `IT dla biznesu · Warszawa`;
- H1 `Obsługa IT dla firm, która porządkuje sieć i pracę biura`;
- короткое объяснение реальных категорий;
- primary CTA `Poproś o wycenę`;
- secondary contact `Zadzwoń`;
- blueprint вместо stock-фотографии людей у ноутбука.

Следующие секции:

1. `W czym pomagamy` — приоритетные услуги.
2. `Dla jakich firm` — eligibility и профили организаций.
3. `Jak pracujemy` — фактический процесс.
4. `Rozwiązania` — архитектурные сценарии.
5. `Realizacje` — только после появления реальных доказательств.
6. `Obszar działania`.
7. Финальная квалифицирующая форма.

## 6. Service landing UX

- никаких generic carousel;
- primary CTA повторяется после ключевых decision sections;
- форма не открывается в неожиданном pop-up на desktop;
- service selection предзаполнен;
- progress bar не используется для короткой формы;
- не более одного необязательного раскрывающего блока before fold;
- scope и exclusions оформлены симметрично, чтобы снижать нецелевые лиды;
- карточки не имеют hover-only информации;
- цена/оценка находится до FAQ и final CTA.

## 7. Components

Обязательные reusable components:

- `SidebarNav` / `MobileNav`;
- `LanguageSwitcher`;
- `ThemeToggle`;
- компактная `ServiceEligibilityLine` только на рекламных страницах услуг;
- `ServiceHero`;
- `ServiceBlueprint`;
- `OutcomeList`;
- `ScopeMatrix`;
- `ProcessSteps` только для реальной последовательности;
- `RelatedSolutions`;
- `RealizationProof`;
- `LeadForm`;
- `ConsentDialog`;
- `Breadcrumbs`;
- `LegalFooter`;
- content cards и filters для knowledge-разделов.

## 8. Motion

Одна orchestrated-анимация допустима в blueprint: последовательное появление
активного пути сети при первом viewport entry. Длительность короткая, один раз,
отключается при reduced motion.

Не использовать:

- постоянные glowing blobs;
- parallax;
- анимированный background без смысла;
- прыгающие CTA;
- массовый fade-in каждой карточки;
- тяжёлое видео в hero.

## 9. Формы

- label всегда остаётся видимым;
- примеры находятся в helper text, не только placeholder;
- ошибка выводится рядом с полем и в summary;
- введённые данные сохраняются при server error;
- success сообщает, что запрос получен и какой следующий шаг реален;
- название компании обязательно; отдельная B2B-галочка не используется;
- privacy notice компактный, не скрытый, со ссылкой;
- CTA формулируется под страницу услуги.

## 10. Дизайн-антипаттерны

- не копировать контент, ticker вопросов и экранную композицию главной 890.by;
- не делать generic SaaS с градиентным шаром и фальшивой панелью аналитики;
- не использовать фотографии handshake/call-center/server room без доказательств;
- не превращать sidebar в перегруженное mega-menu;
- не делать отдельную визуальную систему для privacy/cookies;
- не скрывать важный scope в accordion;
- не использовать мелкий светло-серый текст ради «технологичности».

## 11. Visual QA

Проверяем минимум:

- 360×800, 390×844, 768×1024, 1440×900, 1920×1080;
- dark/light;
- PL/RU/EN/UK с длинными строками;
- 200% zoom;
- клавиатура и screen-reader landmarks;
- форма во всех состояниях;
- CMP поверх mobile sticky CTA;
- длинные H1 и отсутствие horizontal overflow;
- blueprint без цвета и при reduced motion.
