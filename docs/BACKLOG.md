# Очередь задач для Codex

Раннер `scripts/codex/run-queue.ps1` берёт первую задачу со статусом `todo` сверху вниз. Статусы: `todo`, `running`, `done`, `blocked`. Строка задачи меняется только раннером или архитектором. Лог каждой задачи: `docs/runs/<id>.md`.

Источник идей: `docs/research/TOOLS_CATALOG_2026-10-13.md` (единый план) и `docs/research/COMPETITOR_REVIEW_2026-10-01.md`.

## Волна 1

| id | status | title | spec |
| --- | --- | --- | --- |
| 001 | done | Каркас инструментов: реестр, страница /tools, шаблон страницы, sitemap, vitest | docs/tasks/001-tools-foundation.md |
| 002 | done | Единый справочник тарифов с датой актуальности | docs/tasks/002-tariff-registry.md |
| 003 | done | Статический HTML для каждого маршрута (SSG) | docs/tasks/003-static-prerender.md |
| 004 | todo | Инструмент «Цена под маржу» /tools/price-for-margin | docs/tasks/004-price-for-margin.md |
| 005 | todo | Инструмент «Точка безубыточности и цена для акции» /tools/break-even | docs/tasks/005-break-even.md |
| 006 | todo | Инструмент «ДРР и рекламный бюджет» /tools/drr | docs/tasks/006-drr-budget.md |
| 007 | todo | Инструмент «FBO или FBS» /tools/fbo-vs-fbs | docs/tasks/007-fbo-vs-fbs.md |

## Волна 2 (ТЗ будут написаны после приёмки волны 1)

Справочники: комиссии WB по категориям (страница на категорию), склады WB, словарь селлера, лимиты полей карточки. Шаблоны: Excel юнит-экономики, чек-лист запуска. Инструменты: логистика и хранение WB, приёмка, СПП, налоги селлера, литраж упаковки.
