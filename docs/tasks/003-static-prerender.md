# 003. Статический HTML для каждого маршрута (SSG)

## Цель

Сайт размещён на GitHub Pages как SPA: для всех адресов отдаётся один `index.html`, а содержимое появляется только после выполнения JavaScript. Яндекс и Google индексируют такие страницы хуже, а Open Graph-превью не видят заголовков. Нужно, чтобы для каждого маршрута из реестра на этапе сборки создавался полноценный HTML с готовой разметкой, своими мета-тегами и H1, а в браузере React гидрировал эту разметку.

## Что сделать

1. Реализуй статическую генерацию на основе Vite SSR build:
   - Добавь серверную точку входа `src/entry-server.tsx` с функцией `render(url): Promise<{ html: string; head: string }>`, которая рендерит нужную страницу через `renderToString` и возвращает HTML тела и строку с тегами `<head>` для этого маршрута (title, description, canonical, og:*, twitter:*, JSON-LD FAQ/ItemList, если есть).
   - Клиентская точка входа `src/entry-client.tsx` делает `hydrateRoot` в `#root`. `src/main.tsx` можно переименовать или оставить как обёртку, но обработка `webview-safe` должна сохраниться.
   - Скрипт `scripts/prerender.ts`: собирает клиент (`vite build`), собирает SSR-бандл (`vite build --ssr src/entry-server.tsx --outDir dist-ssr`), затем для каждого маршрута (`/`, `/calculator`, `/tools`, `/tools/<slug>`, плюс `/tools/wb-calculator` как алиас) записывает `dist/<route>/index.html`, подставляя в шаблон `dist/index.html` отрендеренный HTML и теги головы. Для `/` перезаписывает `dist/index.html`. `dist/404.html` остаётся копией корневого `index.html` для SPA-фолбэка неизвестных путей (workflow уже делает это).
   - Удали `scripts/generate-static-route-meta.ts` и его вызов, новый скрипт его заменяет. `npm run build` = сборка + prerender + sitemap.
2. Сделай компоненты пригодными для рендера на сервере: обращения к `window`, `document`, `navigator`, `localStorage`, `matchMedia` только внутри `useEffect` или под проверкой `typeof window !== 'undefined'`. Компонент `Seo` в серверном рендере не работает (он пишет в `document.head` в эффекте), поэтому источником мета-тегов для `head` сделай данные из реестра и явные описания для `/`, `/calculator`, `/tools`. На клиенте `Seo` можно оставить для согласованности при навигации.
3. Ленивая загрузка страниц через `React.lazy` в SSR не работает напрямую. Для prerender используй прямой импорт страниц в `entry-server.tsx` (или `await load()` до рендера), на клиенте сохрани разделение бандла.
4. Проверь гидратацию: при открытии `/calculator` в браузере не должно быть ошибок гидратации в консоли (`Hydration failed`, `Text content does not match`). Если какой-то блок зависит от браузера (например, определение мобильного режима), рендерь его одинаково на сервере и при первом рендере клиента, а переключай в `useEffect`.
5. Тесты: тест, который вызывает `render('/tools')` и проверяет, что в HTML есть H1 индексной страницы и `<title>`; тест для `render('/calculator')` проверяет H1 калькулятора. Если `renderToString` страницы калькулятора в тестовой среде требует DOM, используй `environment: 'node'` для этих тестов и убедись, что страницы его не требуют.

## Критерии готовности

- `npm run check` проходит.
- В `dist/calculator/index.html`, `dist/tools/index.html`, `dist/tools/wb-calculator/index.html` есть свой `<title>`, своя `meta description`, свой `canonical` и текст H1 в теле страницы, а не пустой `<div id="root"></div>`.
- `dist/index.html` содержит разметку главной страницы (текст из hero-блока присутствует в HTML).
- В dev-режиме (`npm run dev`) сайт работает как раньше.
- Сборка проходит на Node 18 (так в workflow) и на Node 24 локально. Если Node 18 не позволяет что-то, подними версию в `.github/workflows/deploy.yml` до 20 и укажи это в отчёте.

## Не делать

- Не переходить на другой фреймворк (Next, Astro, Remix). Задача решается средствами Vite SSR build.
- Не менять внешний вид страниц.
