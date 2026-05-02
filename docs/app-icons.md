# App icons and social assets checklist

## Важно

До добавления реальных файлов из списка ниже часть ссылок в `index.html` и `manifest.json` будет отдавать `404`.
Эту ветку нельзя деплоить в production, пока все ассеты не загружены в `public/`.

## Обязательные файлы для ручного добавления

- `public/favicon.svg`
- `public/favicon.ico`
- `public/favicon-48x48.png`
- `public/favicon-96x96.png`

- `public/icons/apple-touch-icon.png`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-icon-192.png`
- `public/icons/maskable-icon-512.png`

- `public/icons/mstile-150x150.png`
- `public/safari-pinned-tab.svg`

- `public/og-image.jpg`
- `public/og-wb-calculator.jpg`

## Требования к файлам

- `favicon.svg` — квадратный SVG, без мелкого текста
- `favicon.ico` — multi-size ICO: 16×16, 32×32, 48×48
- `favicon-48x48.png` — 48×48 PNG
- `favicon-96x96.png` — 96×96 PNG

- `apple-touch-icon.png` — 180×180 PNG
- `icon-192.png` — 192×192 PNG
- `icon-512.png` — 512×512 PNG

- `maskable-icon-192.png` — 192×192 PNG с безопасными отступами
- `maskable-icon-512.png` — 512×512 PNG с безопасными отступами

- `mstile-150x150.png` — 150×150 PNG
- `safari-pinned-tab.svg` — монохромный SVG для Safari pinned tab

- `og-image.jpg` — 1200×630
- `og-wb-calculator.jpg` — 1200×630

## SEO/OG ссылки

В проекте используются OG-ссылки:

- `https://zubarevlab.ru/og-image.jpg`
- `https://zubarevlab.ru/og-wb-calculator.jpg`

Оба файла должны существовать в `public/`.
