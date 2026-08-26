# Зафиксированные архитектурные решения

## ADR-001 — Cloudflare Workers Static Assets

**Статус:** принято, 2026-08-26.

Новый проект разворачивается через Cloudflare Workers Static Assets. Статический
Astro build и endpoint `/api/contact` публикуются одной версией. Это заменяет
первоначально запланированные Cloudflare Pages и Pages Functions.

Причины: рекомендуемый Cloudflare путь для новых проектов, единая конфигурация
bindings, rate limiting и observability, отсутствие миграции после MVP.

## ADR-002 — Astro без обязательного UI-фреймворка

**Статус:** принято.

Основной UI состоит из статических Astro-компонентов. Theme toggle, mobile menu
и форма используют минимальный vanilla JavaScript с progressive enhancement.
Svelte добавляется только при появлении состояния, которое невозможно разумно
обслуживать без island-фреймворка.

## ADR-003 — CSS tokens без Tailwind в foundation

**Статус:** принято.

Дизайн-система реализуется CSS layers и custom properties. Это сохраняет
централизованные токены, уменьшает зависимости и позволяет проверить реальную
повторяемость компонентов до выбора utility framework.

## ADR-004 — Launch scope

**Статус:** принято как техническая граница, коммерческие факты ожидают
подтверждения владельца.

Первый польский MVP готовит четыре P1-услуги: managed IT, LAN, office Wi-Fi и
диагностика корпоративной сети. До заполнения service-definition card страницы
не получают `adEligible: true` и не используются в Google Ads.

## ADR-005 — Публикация knowledge-разделов

**Статус:** принято.

`Realizacje` и `Instrukcje` не показываются в основном меню до появления хотя бы
одного проверенного материала. Коллекции и шаблоны могут существовать заранее.

## ADR-006 — Измерение лидов

**Статус:** принято как модель данных.

`b2b_lead_submit` означает доставленную форму, но не квалифицированный лид.
Бизнес-воронка различает `submitted`, `valid_b2b`, `qualified`, `estimate_sent`
и `converted`. Offline import не включается до определения consent, retention и
закрытого источника lead statuses.
