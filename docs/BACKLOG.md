# Очередь задач для Codex

Раннер `scripts/codex/run-queue.ps1` берёт первую задачу со статусом `todo` сверху вниз. Статусы: `todo`, `running`, `done`, `blocked`. Строка задачи меняется только раннером или архитектором. Лог каждой задачи: `docs/runs/<id>.md`.

Источник идей: `docs/research/TOOLS_CATALOG_2026-10-13.md` (единый план) и `docs/research/COMPETITOR_REVIEW_2026-10-01.md`.

## Волна 1

| id | status | title | spec |
| --- | --- | --- | --- |
| 001 | done | Каркас инструментов: реестр, страница /tools, шаблон страницы, sitemap, vitest | docs/tasks/001-tools-foundation.md |
| 002 | done | Единый справочник тарифов с датой актуальности | docs/tasks/002-tariff-registry.md |
| 003 | done | Статический HTML для каждого маршрута (SSG) | docs/tasks/003-static-prerender.md |
| 004 | done | Инструмент «Цена под маржу» /tools/price-for-margin | docs/tasks/004-price-for-margin.md |
| 005 | done | Инструмент «Точка безубыточности и цена для акции» /tools/break-even | docs/tasks/005-break-even.md |
| 006 | done | Инструмент «ДРР и рекламный бюджет» /tools/drr | docs/tasks/006-drr-budget.md |
| 007 | done | Инструмент «FBO или FBS» /tools/fbo-vs-fbs | docs/tasks/007-fbo-vs-fbs.md |
| 008 | todo | Не грузить справочник тарифов на страницах без расчётов (чанк 1,6 МБ) | docs/tasks/008-split-tariff-chunk.md |

## Волна 2

| id | status | title | spec |
| --- | --- | --- | --- |
| 009 | todo | Реестр контентных страниц, раздел /reference, шаблон страницы справочника | docs/tasks/009-content-pages.md |
| 010 | todo | Справочник комиссий WB по категориям | docs/tasks/010-wb-commissions-reference.md |
| 011 | todo | Справочник складов WB | docs/tasks/011-wb-warehouses-reference.md |
| 012 | todo | Словарь селлера | docs/tasks/012-glossary.md |
| 013 | todo | Лимиты полей карточки и счётчик символов /tools/char-counter | docs/tasks/013-card-limits-and-char-counter.md |
| 014 | todo | Калькулятор логистики и хранения WB /tools/wb-logistics | docs/tasks/014-wb-logistics.md |
| 015 | todo | Литраж, паллеты и приёмка WB /tools/wb-volume | docs/tasks/015-wb-acceptance-volume.md |
| 016 | todo | Калькулятор СПП /tools/spp | docs/tasks/016-spp.md |
| 017 | todo | Калькулятор налогов селлера /tools/seller-tax | docs/tasks/017-seller-tax.md |
| 018 | todo | Шаблоны Excel /templates | docs/tasks/018-excel-templates.md |
| 019 | todo | Интерактивные чек-листы /reference/checklists | docs/tasks/019-checklists.md |
| 020 | todo | Блок инструментов и справочников на главной, перелинковка | docs/tasks/020-homepage-links.md |

## Волна 3 (после приёмки волны 2)

Инструменты: ABC-анализ по CSV, экспресс-диагностика SKU, стоимость возвратов, оборачиваемость и точка заказа, калькулятор поставки, проверка EAN-13 и генератор штрихкодов, этикетки WB/Ozon, стоп-слова, UTM. Статьи в связке с инструментами. Калькулятор Ozon после сбора тарифов.
