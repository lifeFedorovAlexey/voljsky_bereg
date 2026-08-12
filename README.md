# Волжский берег

SSR-сайт-визитка места отдыха на Волге с визуальным конструктором страниц и админкой Payload CMS.

## Локальная разработка

Требования: Node.js 20+, npm, Docker Desktop.

```bash
cp .env.example .env
docker compose up -d db
npm ci
npm run dev
```

- сайт: http://localhost:3000
- админка: http://localhost:3000/admin

### Первый вход

При первом запуске откройте `/admin` и создайте первого администратора через форму Payload. Если пользователь уже существует, войдите с выданными владельцем проекта данными. Пароли не хранятся в Git и не публикуются в документации.

Перед production-развёртыванием задайте новый `PAYLOAD_SECRET` и используйте отдельную учётную запись с уникальным паролем.

После входа стартовый seed можно запустить из панели управления. Он создаёт шесть страниц и четыре медиафайла идемпотентно.

## Редактирование

В коллекции **Страницы** поле **Конструктор страницы** позволяет добавлять, переставлять, дублировать и удалять самостоятельные блоки:

1. первый экран;
2. текст и изображение;
3. преимущества;
4. фотогалерея;
5. варианты размещения;
6. интерактивный генплан;
7. активности;
8. отзывы;
9. FAQ;
10. промоблок;
11. контакты и карта;
12. бронирование YCLIENTS.

Для генплана редактируются изображение, фильтры, координаты маркеров в процентах, статус, категория, подпись и цена. Ссылка бронирования принимает только HTTPS-домены YCLIENTS; при отсутствии корректной ссылки блок закрывается безопасным текстом.

> Стартовые адрес, телефон, цены и описания демонстрационные. Подтвердите фактические данные перед публикацией.

## Проверки

```bash
npm run generate:types
npm run test:int
npx tsc --noEmit
npm run build
```

Integration-тест каталога проверяет замыкание Payload blocks и публичных React renderers: в админке не может появиться блок без frontend-отображения.

## Docker

Полный production-подобный запуск:

```bash
docker compose up --build
```

Приложение собирается как Next.js standalone. PostgreSQL хранит данные в volume `postgres_data`, загруженные медиа — в `media_data`.

## Переменные окружения

Скопируйте `.env.example` и обязательно замените production-секреты:

- `DATABASE_URL` — PostgreSQL connection string;
- `PAYLOAD_SECRET` — случайная строка не короче 32 символов;
- `NEXT_PUBLIC_SERVER_URL` — публичный HTTPS URL;
- `NEXT_PUBLIC_YCLIENTS_URL` — официальная HTTPS-ссылка YCLIENTS;
- `CRON_SECRET`, `PREVIEW_SECRET` — отдельные случайные секреты.

## CI/CD

- `.github/workflows/ci.yml` — установка, типы, integration-тесты и production build для push/PR.
- `.github/workflows/container.yml` — публикация Docker image в GHCR после push в `main` и по version tags.

Дальнейший rollout на VPS/Coolify может использовать образ `ghcr.io/lifefedorovalexey/voljsky_bereg:main`, PostgreSQL и постоянный volume `/app/public/media`. Миграции Payload должны выполняться перед запуском production-релиза после фиксации первой production-схемы.
