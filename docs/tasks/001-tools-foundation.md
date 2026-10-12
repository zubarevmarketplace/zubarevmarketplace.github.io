# 001. Каркас инструментов: реестр, страница /tools, шаблон страницы, sitemap, vitest

## Цель

Подготовить фундамент, на котором дальше будут добавляться десятки страниц-инструментов без правки маршрутизации вручную: единый реестр инструментов, общий шаблон страницы, индексная страница `/tools`, генерация `sitemap.xml` из реестра и тестовый контур.

## Что сделать

1. **Реестр инструментов** `src/app/tools/registry.ts`. Экспортирует массив `tools: ToolDefinition[]`. Тип:
   - `slug` (адрес `/tools/<slug>`), `title` (для `<title>`, до 70 символов), `h1`, `description` (meta description, до 160 символов), `shortDescription` (для карточки в списке), `keywords?: string[]`, `related: string[]` (slug смежных), `ogImage?`, `updatedAt` (дата последней ревизии инструмента, ISO), `load: () => Promise<{ default: ComponentType }>` (ленивая загрузка страницы), `faq: { question: string; answer: string }[]`.
   - Первой записью добавь существующий калькулятор WB с `slug: 'wb-calculator'` и без переписывания его логики. Адрес `/calculator` остаётся рабочим как основной, `/tools/wb-calculator` остаётся алиасом (так сейчас в `src/main.tsx`).
2. **Маршрутизация** в `src/main.tsx`: вместо ручного набора путей определять страницу по реестру. Пути `/`, `/calculator`, `/tools`, `/tools/<slug>`. Неизвестный путь показывает простую страницу «Страница не найдена» со ссылками на главную и `/tools`. Сохрани существующую логику `webview-safe`.
3. **Шаблон страницы инструмента** `src/app/components/tools/ToolPage.tsx`: принимает `ToolDefinition` и `children` (сам инструмент) и рендерит блоки по стандарту из AGENTS.md: H1, вводный текст, инструмент, «Как считается» (через проп `howItWorks: ReactNode`), FAQ с JSON-LD `FAQPage`, дата актуальности тарифов (пока возьми `updatedAt` инструмента, задача 002 заменит на общий справочник), смежные инструменты из `related`, блок с предложением разбора. Использует `Layout` и `Seo`. Добавь в `Header` ссылку «Инструменты» на `/tools` и поддержку `currentPage: 'tools'`.
4. **Индексная страница** `/tools` (`src/app/pages/ToolsIndexPage.tsx`): H1 «Бесплатные инструменты для продавцов Wildberries и Ozon», карточки из реестра с `shortDescription`, SEO-мета, JSON-LD `ItemList`.
5. **Sitemap**: скрипт `scripts/generate-sitemap.ts`, который на этапе сборки создаёт `dist/sitemap.xml` из реестра: `/`, `/calculator`, `/tools`, все `/tools/<slug>` с `lastmod` из `updatedAt`. Удали статический `public/sitemap.xml` или сделай так, чтобы сгенерированный его перекрывал. Подключи в `npm run build` после сборки Vite. Скрипт `scripts/generate-static-route-meta.ts` пока не трогай, его заменит задача 003.
6. **Тесты**: установи `vitest` как dev-зависимость, добавь `npm test` (`vitest run`) и `npm run check` (`npm run build && npm test`). Напиши тесты: реестр не содержит дублей slug, у каждой записи заполнены `title`, `h1`, `description` в пределах длины, `related` ссылаются на существующие slug; генератор sitemap выдаёт все адреса (вынеси формирование XML в чистую функцию и протестируй её).

## Критерии готовности

- `npm run check` проходит.
- В `dist/` есть `sitemap.xml` с адресами `https://zubarevlab.ru/`, `https://zubarevlab.ru/calculator`, `https://zubarevlab.ru/tools`, `https://zubarevlab.ru/tools/wb-calculator`.
- `/calculator` работает как раньше, `/tools` показывает карточку калькулятора WB, ссылка «Инструменты» есть в шапке на десктопе и в мобильном меню.
- Главная страница `/` не изменилась визуально.
- Добавление нового инструмента требует только новой записи в реестре и файла страницы.

## Не делать

- Не переписывать `WbCalculatorPage.tsx` и расчётную логику.
- Не переходить на `react-router` в этой задаче: ручной резолвинг по реестру достаточен и проще для статического рендера в задаче 003.
