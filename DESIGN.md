---
version: alpha
name: Ienevo Bereg
description: "Тёплая редакционная система для отдыха на берегу Волги: природная, спокойная, фотографичная."
colors:
  primary: "#29301C"
  secondary: "#3A788D"
  tertiary: "#E3A33B"
  neutral: "#FFF8E8"
  surface: "#FFFDF7"
  surfaceMuted: "#F2DFC2"
  text: "#2B2415"
  textMuted: "#675F4E"
  accentHover: "#F0BD60"
  accentText: "#9A5316"
  border: "#D9CDB8"
  success: "#69A95A"
  reserved: "#C6884D"
  unavailable: "#6D736D"
  error: "#7D2C2C"
typography:
  display-xl:
    fontFamily: Georgia
    fontSize: 5.5rem
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  display-lg:
    fontFamily: Georgia
    fontSize: 4rem
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.035em"
  heading-md:
    fontFamily: Georgia
    fontSize: 1.5rem
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body-lg:
    fontFamily: Geist Sans
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: Geist Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Geist Sans
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.16em"
  button:
    fontFamily: Geist Sans
    fontSize: 0.9375rem
    fontWeight: 700
    lineHeight: 1
rounded:
  sm: 12px
  md: 18px
  lg: 24px
  xl: 32px
  pill: 999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
  20: 80px
  24: 96px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    height: 48px
    padding: 20px
  button-primary-hover:
    backgroundColor: "{colors.accentHover}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    height: 48px
    padding: 20px
  button-compact:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    height: 44px
    padding: 16px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 24px
  section-muted:
    backgroundColor: "{colors.surfaceMuted}"
    textColor: "{colors.text}"
    padding: 64px
  body-muted:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.textMuted}"
    typography: "{typography.body}"
  price-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accentText}"
    typography: "{typography.label}"
  divider:
    backgroundColor: "{colors.border}"
    textColor: "{colors.text}"
    height: 1px
  status-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 8px
  status-reserved:
    backgroundColor: "{colors.reserved}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 8px
  status-unavailable:
    backgroundColor: "{colors.unavailable}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.pill}"
    padding: 8px
  dark-surface:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
    padding: 24px
  service-notice:
    backgroundColor: "{colors.surfaceMuted}"
    textColor: "{colors.textMuted}"
    typography: "{typography.body-lg}"
    padding: 24px
---

## Overview

«Иенево. Берег» — спокойный фотографичный интерфейс с редакционной типографикой. Реальные фотографии и Волга дают эмоциональность; интерфейсная система не конкурирует с ними. Публичный сайт и Payload Admin используют разные визуальные системы.

## Colors

- `primary` — тёмный оливковый для footer, карты и тёмных секций.
- `neutral`, `surface`, `surfaceMuted` — три уровня тёплого фона; новые кремовые оттенки не добавляются локально.
- `tertiary` — единственный основной CTA-акцент. Он не используется для длинного текста.
- `secondary` — речной focus/link-акцент. Контраст с `neutral` — 4.67:1.
- `text` и `textMuted` — единственные роли основного и вторичного текста на светлом фоне. Контраст — 14.53:1 и 5.97:1.
- Статусы `success`, `reserved`, `unavailable` сохраняют смысл на карте и никогда не заменяются декоративными цветами.

## Typography

Georgia используется только для display, section и card headings. Geist Sans используется для текста, навигации, кнопок и метаданных.

Fluid rules runtime:

- hero: `clamp(2.75rem, 6.2vw, 5.5rem)`;
- длинный hero-заголовок: `clamp(2.4rem, 5.2vw, 4.75rem)`;
- section title: `clamp(2.5rem, 4.6vw, 4rem)`;
- card title: `clamp(1.35rem, 2vw, 1.5rem)`.

Заголовок hero ограничивается 14–16 символами строки. Длинный русский заголовок получает отдельный системный размер, а не локальный page-specific override. Body copy ограничивается примерно 65 символами строки.

## Layout

- Base spacing unit: 4px; основные шаги интерфейса — 8, 12, 16, 24, 32, 48, 64, 80 и 96px.
- Container: максимум 1376px; gutter 16px mobile, 24px tablet, 32px desktop.
- Major section padding: `clamp(4.5rem, 7vw, 7rem)`.
- Compact CTA/promo padding: `clamp(4rem, 6vw, 5rem)`.
- Grid gap: 16px mobile, 24px desktop.
- Text column: 720px; long-form reading column: 65ch.
- Hero: единая высота `clamp(620px, 72svh, 760px)` на всех страницах.

## Elevation & Depth

- Flat: section backgrounds, typography, footer.
- Card: тонкая тёплая граница только там, где она задаёт структуру, и мягкая тень без светлого rim. Фотографии и CTA не получают декоративную белую обводку.
- Featured: карта, крупный media container.
- Hover: только небольшой подъём и усиление существующей тени; новый цвет поверхности не вводится.
- Focus: контрастное кольцо 3px с offset 3–4px.

## Shapes

- 12px — мелкие подсказки и функциональные контейнеры.
- 18px — mobile featured containers.
- 24px — карточки и изображения.
- 32px — крупные media surfaces на desktop.
- Pill применяется только к CTA, фильтрам и статусам, не к обычным карточкам.

## Components

- Все primary CTA: 48px; compact header CTA: 44px; touch target не меньше 44px.
- Media cards: изображение 4:3, единая высота внутри строки, цена прижата к низу.
- Feature grid: компактная editorial-полоса без карточной тени и hover-affordance; три преимущества разделяются линиями и нумеруются `01–03`. На mobile — один столбец. Legacy-иконки не определяют композицию.
- Split content: heading, description, rich text и CTA образуют одну text-column; media занимает соседнюю колонку, а `imagePosition` действительно меняет стороны. На mobile цельная text-column идёт перед media.
- Parallax применяется только как contained media motion: фиксированная рамка split/gallery не двигается, её внутренний media-wrapper смещается не более чем на `±2.5%`. Эффект capability-gated через CSS View Timeline, не требует JavaScript, не применяется к тексту/карточкам/hero и полностью отключается при `prefers-reduced-motion`.
- Географическая карта и генплан — разные сущности. `locationMap` показывает только подтверждённую точку по координатам в OpenStreetMap и оставляет SSR-координаты/внешнюю ссылку; `mapPlan` без проверенной геометрии или разрешённого изображения остаётся fail-closed.
- Отзывы: опубликованные записи остаются полноширинным содержанием секции; создание открывается одной CTA в доступном modal, а не занимает постоянную третью колонку. Modal использует компактный consumer-form pattern: одна нейтральная поверхность, короткий header, видимое действие «Закрыть», без декоративных eyebrow, пиктограмм и hero-композиции. Он ограничен по `svh`, скроллит только тело, закрывается через «Закрыть»/`Escape`/backdrop, возвращает focus и заменяет форму компактным success-state. Страница управляет композицией, а записи и статусы управляются отдельной коллекцией Payload «Отзывы гостей».
- Quote cards: без media hover; автор и рейтинг визуально отделены от цитаты.
- FAQ: весь `summary` — touch target; `+` меняется на `−`; открытое состояние заметно без анимации layout.
- Booking с рабочей ссылкой — компактная CTA-секция с heading/body/button roles.
- Standalone booking без валидной внешней ссылки не рендерится. Статус неподключённой записи показывается только внутри объединённого contact-service, где рядом есть рабочий телефон.
- Соседние `contacts + unavailable booking` объединяются в одну service-surface: контакты и главный телефон слева, статус онлайн-записи справа. Запрещены пустая полноширинная contact-card и отдельная повторяющая полоса бронирования.

- Интерактивная карта допускается только с реальной CMS-геометрией; desktop — canvas + panel, mobile — canvas над panel, статусы различаются цветом и текстом.
- Пользовательский визуальный референс не является production-asset и не загружается в `public/` или Payload без отдельного явного разрешения на публикацию.
- Статический план допустим только как проверенный production/documentary asset с подтверждённым правом публикации; legacy filters, статусы и маркеры поверх изображения не показываются.
- Если нет ни проверенного plan image, ни реальной CMS-геометрии, plan block не рендерит картинку, рамку, подпись или placeholder.
- Если исходное изображение уже содержит подписи или номера, HTML-текст и CMS-маркеры поверх него запрещены: один факт имеет ровно один визуальный источник.

## Do's and Don'ts

- Делать: использовать semantic `--vb-color-*`, `--vb-space-*`, `--vb-text-*`, `--vb-radius-*`, `--vb-shadow-*`.
- Делать: проверять 390, 768, 1024 и 1440px, короткий desktop и reduced motion.
- Делать: сохранять реальные изображения главным источником визуальной выразительности.
- Не делать: вводить page-specific размеры заголовков и отступов.
- Не делать: использовать случайные hex/px внутри компонентов, если роль уже существует.
- Не делать: анимировать layout-свойства или скрывать SSR-контент до JavaScript.
- Не делать: смешивать публичную палитру с Payload Admin.
