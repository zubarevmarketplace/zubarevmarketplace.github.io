# App icons and social assets checklist

## Ожидаемые пути иконок в приложении

`index.html` и `public/manifest.json` должны ссылаться на эти URL:

- `/icons/apple-touch-icon.png`
- `/icons/icon-192.png`
- `/icons/icon-512.png`
- `/icons/maskable-icon-192.png`
- `/icons/maskable-icon-512.png`
- `/icons/mstile-150x150.png`

## Где должны лежать исходники в репозитории

Добавьте файлы вручную в `public/icons/`:

- `public/icons/apple-touch-icon.png`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-icon-192.png`
- `public/icons/maskable-icon-512.png`
- `public/icons/mstile-150x150.png`

## Ожидаемый результат после `npm run build`

После сборки файлы должны быть доступны по путям:

- `dist/icons/apple-touch-icon.png`
- `dist/icons/icon-192.png`
- `dist/icons/icon-512.png`
- `dist/icons/maskable-icon-192.png`
- `dist/icons/maskable-icon-512.png`
- `dist/icons/mstile-150x150.png`

Если каких-то файлов нет в `public/icons/`, Vite не сможет положить их в `dist/icons/`, а сервер с SPA-fallback будет отдавать `index.html` вместо изображения.
