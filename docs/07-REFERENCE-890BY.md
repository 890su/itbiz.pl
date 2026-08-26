# Дизайн-референс 890.by

Источник для изучения:

```text
D:\aibrain\04_projects\support_890\890-by\890-by_site\app-opus
```

## Что подтверждено в референсе

- Astro static site;
- Svelte islands для интерактивных компонентов;
- Tailwind и CSS variables;
- правая фиксированная sidebar на desktop;
- drawer на mobile;
- dark/light mode;
- сине-графитовая палитра;
- компактная максимальная ширина текста;
- cards/pills/filterable content lists;
- content collections для news, knowledge base и tools;
- SEOHead, schema, sitemap, canonical, OG;
- Cloudflare-compatible `_headers`.

## Что переносим как принцип

- ощущение инженерного интерфейса, а не рекламного шаблона;
- стабильную правую навигацию;
- спокойную тёмную основу;
- чёткие состояния active/hover/focus;
- минимальное количество client-side JS;
- единый layout для коммерческих и knowledge-разделов;
- карточки и теги как навигацию по знаниям;
- доступную тему и responsive drawer.

## Что не переносим

- название, логотип и контакты 890.by;
- тексты, вопросы, инструкции, tools и news;
- главную форму `Что случилось?`;
- белорусские порталы, ЭЦП и локальную тематику;
- pricing и коммерческие формулировки;
- Telegram-ссылку и существующий backend;
- готовые SVG/OG assets без отдельного решения;
- русскую locale как default.

## Что меняется для ITBIZ

| 890.by | ITBIZ.PL |
|---|---|
| Главная — problem input | Главная — B2B value proposition и service routing |
| Новости | Реализации |
| Инструменты | Решения |
| Услуги/цены одной страницей | Отдельные конверсионные service landings |
| Русский default | Польский default + RU/EN/UK |
| Remote-support context | Варшавская B2B-инфраструктура, on-site/mixed |
| Sidebar contact | Sidebar CTA + phone + language + theme |
| Generic technical cards | Service blueprint и граф связей контента |

## Дизайн-критика референса, учтённая в новом проекте

890.by намеренно компактный и хорошо подходит для поддержки, но его main column
слишком узкая для длинной B2B-посадочной, а hero не объясняет коммерческий scope.
ITBIZ сохраняет навигационный характер, но:

- расширяет рабочую область;
- показывает B2B eligibility above the fold;
- вводит доказуемые deliverables и exclusions;
- усиливает CTA без визуального давления;
- использует service blueprint как предметный визуальный элемент;
- связывает коммерческий и экспертный контент.

Таким образом результат должен быть узнаваемо из той же дизайнерской семьи, но
не выглядеть клоном 890.by и не использовать его содержимое.
