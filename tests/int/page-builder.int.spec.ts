import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { pageBuilderBlocks, pageBuilderBlockSlugs } from '@/modules/page-builder/blocks'
import { blockRenderers } from '@/modules/page-builder/renderers'

const expectedBlocks = [
  'siteHero',
  'splitContent',
  'featureGrid',
  'gallery',
  'stays',
  'mapPlan',
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
  })
})
