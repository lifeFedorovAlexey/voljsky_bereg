import { describe, expect, it } from 'vitest'

import content from '@/seed/content.json'

describe('three-page public content structure', () => {
  it('keeps the main navigation focused on stays, activities, and contacts', () => {
    expect(content.header.navItems.map(({ link }) => link.label)).toEqual([
      'Размещение',
      'Отдых',
      'Контакты',
    ])

    expect(content.footer.navItems.map(({ link }) => link.label)).toEqual([
      'Размещение',
      'Отдых',
      'Контакты',
    ])
  })

  it('places territory and about content on the activities page', () => {
    const activities = content.pages.find((page) => page.slug === 'activities')
    const blockTypes = activities?.layout.map((block) => block.blockType)

    expect(blockTypes).toEqual([
      'siteHero',
      'activities',
      'splitContent',
      'featureGrid',
      'locationMap',
      'promo',
    ])
    expect(activities?.layout).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Главное здесь — ощущение места' }),
        expect.objectContaining({ title: 'Ориентиры на территории' }),
        expect.objectContaining({ title: 'Иенево. Берег на карте' }),
      ]),
    )
  })
})
