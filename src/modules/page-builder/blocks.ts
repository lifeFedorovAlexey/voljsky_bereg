import type { Block, Field } from 'payload'

const sectionSettings: Field[] = [
  { name: 'anchor', label: 'Якорь секции', type: 'text' },
  {
    name: 'theme',
    label: 'Оформление',
    type: 'select',
    defaultValue: 'light',
    options: [
      { label: 'Светлое', value: 'light' },
      { label: 'Тёмное', value: 'dark' },
      { label: 'Песочное', value: 'sand' },
    ],
  },
  { name: 'eyebrow', label: 'Надзаголовок', type: 'text' },
  { name: 'title', label: 'Заголовок', type: 'text', required: true },
  { name: 'description', label: 'Описание', type: 'textarea' },
]

const buttonFields: Field[] = [
  { name: 'label', label: 'Текст кнопки', type: 'text', required: true },
  { name: 'url', label: 'Ссылка', type: 'text', required: true },
  { name: 'newTab', label: 'Открывать в новой вкладке', type: 'checkbox' },
]

const buttons: Field = {
  name: 'buttons',
  label: 'Кнопки',
  type: 'array',
  maxRows: 3,
  fields: buttonFields,
}

const image: Field = {
  name: 'image',
  label: 'Изображение',
  type: 'upload',
  relationTo: 'media',
}

function block(slug: string, singular: string, fields: Field[]): Block {
  return {
    slug,
    admin: {
      disableBlockName: true,
    },
    interfaceName: `${slug[0].toUpperCase()}${slug.slice(1)}Block`,
    labels: { singular, plural: singular },
    fields: [...sectionSettings, ...fields],
  }
}

export const SiteHero = block('siteHero', 'Первый экран', [
  image,
  {
    name: 'height',
    label: 'Высота',
    type: 'select',
    defaultValue: 'large',
    options: [
      { label: 'Компактная', value: 'compact' },
      { label: 'Большая', value: 'large' },
      { label: 'На весь экран', value: 'screen' },
    ],
  },
  { name: 'overlay', label: 'Затемнение изображения, %', type: 'number', min: 0, max: 90, defaultValue: 35 },
  buttons,
])

export const SplitContent = block('splitContent', 'Текст и изображение', [
  image,
  {
    name: 'imagePosition',
    label: 'Положение изображения',
    type: 'radio',
    defaultValue: 'right',
    options: [
      { label: 'Слева', value: 'left' },
      { label: 'Справа', value: 'right' },
    ],
  },
  { name: 'body', label: 'Основной текст', type: 'richText' },
  buttons,
])

export const FeatureGrid = block('featureGrid', 'Карточки преимуществ', [
  {
    name: 'items',
    label: 'Карточки',
    type: 'array',
    minRows: 1,
    fields: [
      image,
      { name: 'icon', label: 'Иконка или номер', type: 'text' },
      { name: 'title', label: 'Название', type: 'text', required: true },
      { name: 'text', label: 'Описание', type: 'textarea' },
      { name: 'url', label: 'Ссылка', type: 'text' },
    ],
  },
])

export const Gallery = block('gallery', 'Фотогалерея', [
  {
    name: 'layout',
    label: 'Композиция',
    type: 'select',
    defaultValue: 'mosaic',
    options: [
      { label: 'Мозаика', value: 'mosaic' },
      { label: 'Сетка', value: 'grid' },
      { label: 'Карусель', value: 'carousel' },
    ],
  },
  {
    name: 'images',
    label: 'Фотографии',
    type: 'array',
    minRows: 1,
    fields: [image, { name: 'caption', label: 'Подпись', type: 'text' }],
  },
])

export const Stays = block('stays', 'Варианты размещения', [
  {
    name: 'items',
    label: 'Объекты размещения',
    type: 'array',
    minRows: 1,
    fields: [
      image,
      { name: 'name', label: 'Название', type: 'text', required: true },
      { name: 'summary', label: 'Краткое описание', type: 'textarea' },
      { name: 'price', label: 'Цена / подпись цены', type: 'text' },
      { name: 'capacity', label: 'Количество гостей', type: 'number', min: 1 },
      { name: 'features', label: 'Характеристики', type: 'array', fields: [{ name: 'text', label: 'Характеристика', type: 'text' }] },
      { name: 'bookingUrl', label: 'Ссылка бронирования', type: 'text' },
    ],
  },
])

export const MapPlan = block('mapPlan', 'Интерактивный генплан', [
  { ...image, name: 'planImage', label: 'Изображение генплана' },
  {
    name: 'filters',
    label: 'Фильтры',
    type: 'array',
    fields: [
      { name: 'label', label: 'Название', type: 'text', required: true },
      { name: 'value', label: 'Системное значение', type: 'text', required: true },
    ],
  },
  {
    name: 'objects',
    label: 'Объекты на плане',
    type: 'array',
    fields: [
      { name: 'number', label: 'Номер / название', type: 'text', required: true },
      { name: 'x', label: 'Позиция слева, %', type: 'number', min: 0, max: 100, required: true },
      { name: 'y', label: 'Позиция сверху, %', type: 'number', min: 0, max: 100, required: true },
      {
        name: 'status',
        label: 'Статус',
        type: 'select',
        defaultValue: 'available',
        options: [
          { label: 'Доступен', value: 'available' },
          { label: 'Забронирован', value: 'reserved' },
          { label: 'Недоступен', value: 'unavailable' },
        ],
      },
      { name: 'category', label: 'Категория / фильтр', type: 'text' },
      { name: 'price', label: 'Цена', type: 'text' },
      { name: 'description', label: 'Описание', type: 'textarea' },
      { name: 'url', label: 'Ссылка на объект', type: 'text' },
    ],
  },
])

export const Activities = block('activities', 'Активности и инфраструктура', [
  {
    name: 'items',
    label: 'Активности',
    type: 'array',
    fields: [image, { name: 'title', label: 'Название', type: 'text', required: true }, { name: 'text', label: 'Описание', type: 'textarea' }],
  },
])

export const Testimonials = block('testimonials', 'Отзывы', [
  {
    name: 'items',
    label: 'Отзывы',
    type: 'array',
    fields: [
      { ...image, name: 'avatar', label: 'Фотография автора' },
      { name: 'author', label: 'Имя', type: 'text', required: true },
      { name: 'text', label: 'Текст отзыва', type: 'textarea', required: true },
      { name: 'rating', label: 'Оценка', type: 'number', min: 1, max: 5 },
    ],
  },
])

export const Faq = block('faq', 'Вопросы и ответы', [
  {
    name: 'items',
    label: 'Вопросы',
    type: 'array',
    fields: [
      { name: 'question', label: 'Вопрос', type: 'text', required: true },
      { name: 'answer', label: 'Ответ', type: 'textarea', required: true },
    ],
  },
])

export const Promo = block('promo', 'Промоблок', [image, buttons])

export const Contacts = block('contacts', 'Контакты и карта', [
  { name: 'address', label: 'Адрес', type: 'text' },
  { name: 'phone', label: 'Телефон', type: 'text' },
  { name: 'email', label: 'Электронная почта', type: 'email' },
  { name: 'workingHours', label: 'Режим работы', type: 'text' },
  { name: 'mapEmbedUrl', label: 'Ссылка для встраивания карты', type: 'text' },
  { name: 'messengers', label: 'Мессенджеры', type: 'array', fields: buttonFields },
])

export const Booking = block('booking', 'Бронирование YCLIENTS', [
  {
    name: 'yclientsUrl',
    label: 'HTTPS-ссылка на форму YCLIENTS',
    type: 'text',
    admin: { description: 'Например: https://n123456.yclients.com/' },
  },
  { name: 'buttonLabel', label: 'Текст кнопки', type: 'text', defaultValue: 'Забронировать' },
  { name: 'fallbackText', label: 'Сообщение, если YCLIENTS не настроен', type: 'textarea' },
  image,
])

export const pageBuilderBlocks: Block[] = [
  SiteHero,
  SplitContent,
  FeatureGrid,
  Gallery,
  Stays,
  MapPlan,
  Activities,
  Testimonials,
  Faq,
  Promo,
  Contacts,
  Booking,
]

export const pageBuilderBlockSlugs = pageBuilderBlocks.map((item) => item.slug)
