# 002. Единый справочник тарифов с датой актуальности

## Цель

Все инструменты сайта берут тарифы и константы из одного места и показывают одну и ту же дату актуальности. Сейчас данные разбросаны: `src/app/config/tariffs.ts`, `src/calculator/data/commissionTariffs.json`, `src/calculator/config/warehouseTariffs.ts`, `src/app/config/geoPresets.ts`, и даты актуальности нет нигде.

## Что сделать

1. Создай `src/app/config/tariffRegistry.ts`, который экспортирует единый объект `tariffRegistry` и сохраняет обратную совместимость существующих импортов (старые модули могут реэкспортировать из нового):
   - `meta`: `updatedAt` (ISO-дата, выставь дату последнего коммита, изменявшего `data/raw/*.xlsx`, посмотри `git log`), `source` (короткое описание: «Тарифы WB из личного кабинета, файлы в data/raw»), `nextReviewHint` («проверяйте тарифы в кабинете WB перед поставкой»).
   - `wb.commissions` (из JSON), `wb.warehouses`, `wb.defaults` (из `tariffs.ts`), `wb.pallet`, `wb.geoPresets`.
   - Функции-помощники: `findCommission(tariffId)`, `listCategories()`, `formatTariffDate()` (возвращает «13 октября 2026» по-русски).
2. Компонент `src/app/components/tools/TariffDateNote.tsx`: одна строка «Тарифы актуальны на {дата}. Перед поставкой сверьте с кабинетом WB.» Используй его в `ToolPage` вместо `updatedAt` инструмента и добавь на страницу `WbCalculatorPage` рядом с результатом (минимальная правка, без переписывания страницы).
3. Скрипт `scripts/generate-wb-tariffs.ts` при генерации обновляет `updatedAt` в `src/calculator/data/tariffMeta.json` (новый файл), а реестр читает дату оттуда. Так дата меняется автоматически при перегенерации тарифов.
4. Тесты: `findCommission` возвращает запись по id и `undefined` для неизвестного; `formatTariffDate` форматирует `2026-10-13` как «13 октября 2026»; в реестре нет категорий с комиссией вне диапазона 0–100.

## Критерии готовности

- `npm run check` проходит.
- На `/calculator` и на любой странице `ToolPage` видна одна и та же дата актуальности.
- `npm run generate:wb-tariffs` отрабатывает без ошибок и обновляет `tariffMeta.json` (запусти и убедись; если xlsx не читается, опиши в отчёте и не ломай существующий результат).
- Ни один существующий импорт не сломан.

## Не делать

- Не менять сами значения тарифов.
- Не трогать формулы в `calculateUnitEconomics.ts`.
