import { describe, expect, it } from 'vitest'

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
})
