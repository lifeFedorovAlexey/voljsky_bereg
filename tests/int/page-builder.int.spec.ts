import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { HeaderNav } from '@/Header/Nav'
import { pageBuilderBlocks, pageBuilderBlockSlugs } from '@/modules/page-builder/blocks'
import { blockRenderers } from '@/modules/page-builder/renderers'

const expectedBlocks = [
  'siteHero',
  'splitContent',
  'featureGrid',
  'gallery',
  'stays',
  'mapPlan',
  'locationMap',
  'activities',
  'testimonials',
  'faq',
  'promo',
  'contacts',
  'booking',
]

describe('page builder catalogue', () => {
  it('offers the complete component library in the CMS', () => {
    expect(pageBuilderBlockSlugs).toEqual(expectedBlocks)
    expect(pageBuilderBlocks.map((block) => block.slug)).toEqual(expectedBlocks)
  })

  it('has a public renderer for every CMS block and no hidden renderers', () => {
    expect(Object.keys(blockRenderers)).toEqual(expectedBlocks)
  })

  it('gives every component Russian editor labels', () => {
    for (const block of pageBuilderBlocks) {
      expect(block.labels?.singular).toBeTruthy()
      expect(block.labels?.plural).toBeTruthy()
    }
  })

  it('keeps hero height uniform while retaining the legacy CMS field', () => {
    const heroBlock = pageBuilderBlocks.find((block) => block.slug === 'siteHero')
    const heightField = heroBlock?.fields.find(
      (field) => 'name' in field && field.name === 'height',
    )

    expect(heightField).toMatchObject({
      admin: { hidden: true },
      defaultValue: 'large',
    })

    const markup = renderToStaticMarkup(
      createElement(blockRenderers.siteHero, { height: 'screen', title: 'Проверка' }),
    )
    expect(markup).toContain('vb-hero--large')
    expect(markup).not.toContain('vb-hero--screen')

    const longTitleMarkup = renderToStaticMarkup(
      createElement(blockRenderers.siteHero, {
        title: 'Место с уважением к природе и вашему времени',
      }),
    )
    expect(longTitleMarkup).toContain('vb-hero--long-title')
  })

  it('preserves semantic design roles across public blocks', () => {
    const featureMarkup = renderToStaticMarkup(
      createElement(blockRenderers.featureGrid, {
        blockType: 'featureGrid',
        items: [{ icon: '•', text: 'Описание', title: 'Преимущество' }],
      }),
    )
    const contactsMarkup = renderToStaticMarkup(
      createElement(blockRenderers.contacts, { phone: '+7 000 000-00-00' }),
    )
    const splitMarkup = renderToStaticMarkup(
      createElement(blockRenderers.splitContent, {
        description: 'Связанный текст',
        imagePosition: 'right',
        title: 'Связанный заголовок',
      }),
    )
    const bookingFallbackMarkup = renderToStaticMarkup(
      createElement(blockRenderers.booking, {
        eyebrow: 'Онлайн-запись',
        title: 'Выберите удобное время отдыха',
        yclientsUrl: 'not-a-booking-url',
      }),
    )
    const bookingConfiguredMarkup = renderToStaticMarkup(
      createElement(blockRenderers.booking, {
        buttonLabel: 'Открыть онлайн-запись',
        yclientsUrl: 'https://n2494653.yclients.com',
      }),
    )
    const planWithoutVerifiedDataMarkup = renderToStaticMarkup(
      createElement(blockRenderers.mapPlan, {
        filters: [{ label: 'Старый фильтр' }],
        objects: [{ number: '1', x: 10, y: 10 }],
        planImage: null,
        title: 'План территории',
      }),
    )
    const locationMapMarkup = renderToStaticMarkup(
      createElement(blockRenderers.locationMap, {
        address: 'Иенево, берег Волги',
        latitude: 56.818252,
        longitude: 36.005132,
        title: 'Как нас найти',
      }),
    )
    const invalidLocationMapMarkup = renderToStaticMarkup(
      createElement(blockRenderers.locationMap, {
        latitude: 'not-a-coordinate',
        longitude: 36.005132,
        title: 'Как нас найти',
      }),
    )

    expect(featureMarkup).toContain('vb-section--featureGrid')
    expect(featureMarkup).toContain('vb-feature-strip')
    expect(featureMarkup).toContain('vb-feature-strip__item')
    expect(featureMarkup).toContain('01')
    expect(featureMarkup).not.toContain('vb-card')
    expect(contactsMarkup).toContain('vb-section--contacts')
    expect(splitMarkup).toContain('vb-split--right')
    expect(splitMarkup).toContain('vb-split__content')
    expect(splitMarkup).toContain('Связанный заголовок')
    expect(splitMarkup).toContain('Связанный текст')
    expect(bookingFallbackMarkup).toBe('')
    expect(bookingConfiguredMarkup).toContain('aria-haspopup="dialog"')
    expect(bookingConfiguredMarkup).toContain('class="vb-booking-dialog"')
    expect(bookingConfiguredMarkup).toContain('Закрыть')
    expect(bookingConfiguredMarkup).toContain('Даты и доступность открываются в форме YCLIENTS.')
    expect(bookingConfiguredMarkup).toContain('href="https://n2494653.yclients.com/"')
    expect(bookingConfiguredMarkup).toContain('Открыть онлайн-запись')
    expect(planWithoutVerifiedDataMarkup).toBe('')
    expect(locationMapMarkup).toContain('vb-section--location-map')
    expect(locationMapMarkup).toContain('title="Карта расположения Иенево. Берег"')
    expect(locationMapMarkup).toContain('marker=56.818252%2C36.005132')
    expect(locationMapMarkup).toContain('56.818252, 36.005132')
    expect(locationMapMarkup).toContain('Открыть точку на карте')
    expect(invalidLocationMapMarkup).toBe('')
  })

  it('renders confirmed stay facts instead of leaving the catalogue sparse', () => {
    const markup = renderToStaticMarkup(
      createElement(blockRenderers.stays, {
        blockType: 'stays',
        items: [
          {
            capacity: 6,
            features: [{ text: '2 спальни' }, { text: 'Кухня' }],
            name: 'Дом у воды',
            price: 'от 12 000 ₽ / ночь',
            summary: 'Панорамная гостиная и терраса.',
          },
        ],
        title: 'Варианты размещения',
      }),
    )

    expect(markup).toContain('vb-stays-card')
    expect(markup).toContain('До 6 гостей')
    expect(markup).toContain('2 спальни')
    expect(markup).toContain('Кухня')
    expect(markup).toContain('от 12 000 ₽ / ночь')
  })

  it('renders complete desktop and mobile navigation trees', () => {
    const markup = renderToStaticMarkup(
      createElement(HeaderNav, {
        data: {
          navItems: [
            { link: { label: 'Размещение', type: 'custom', url: '/stays' } },
            { link: { label: 'Контакты', type: 'custom', url: '/contacts' } },
          ],
        } as never,
      }),
    )

    expect(markup).toContain('aria-label="Основная навигация"')
    expect(markup).toContain('aria-label="Мобильная навигация"')
    expect(markup.match(/href="\/stays"/g)).toHaveLength(2)
    expect(markup.match(/href="\/contacts#booking"/g)).toHaveLength(2)
  })
})
