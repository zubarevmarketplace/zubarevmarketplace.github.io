# IndexNow

## Что нужно подготовить

1. Сгенерируйте ключ IndexNow.
2. Добавьте переменную окружения `INDEXNOW_KEY` со значением этого ключа.
3. Создайте файл `public/<INDEXNOW_KEY>.txt` (например, `public/abc123.txt`) и поместите в него **только** значение ключа.

## Запуск отправки URL

```bash
npm run submit:indexnow
```

Скрипт отправляет в IndexNow обновления для URL:

- `https://zubarevlab.ru/`
- `https://zubarevlab.ru/tools/wb-calculator`

Если `INDEXNOW_KEY` не задан, команда завершится с ошибкой.
