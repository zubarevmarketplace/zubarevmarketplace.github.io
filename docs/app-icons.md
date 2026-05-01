# App icons для добавления сайта на экран телефона

В проекте отсутствуют PNG-иконки для установки сайта на главный экран iOS/Android.

Нужно добавить вручную следующие файлы:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/apple-touch-icon.png`

Требования:

- `icon-192.png` — 192×192 PNG
- `icon-512.png` — 512×512 PNG
- `apple-touch-icon.png` — 180×180 PNG
- желательно непрозрачный фон
- логотип должен быть хорошо виден на тёмном фоне

После добавления файлов можно прописать ссылки в `public/manifest.json` и `index.html`.
