import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

let payload: Payload

describe('CMS content persistence', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('persists edited page names and image metadata through the CMS API', async () => {
    const [pages, media] = await Promise.all([
      payload.find({ collection: 'pages', limit: 1 }),
      payload.find({ collection: 'media', limit: 1 }),
    ])
    const page = pages.docs[0]
    const image = media.docs[0]

    if (!page || !image) {
      return
    }

    const originalTitle = page.title
    const originalAlt = image.alt
    const suffix = Date.now().toString(36)

    try {
      await payload.update({
        collection: 'media',
        id: image.id,
        data: { alt: `${originalAlt || 'Изображение'} — проверка ${suffix}` },
        context: { disableRevalidate: true },
      })
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: `${originalTitle} — проверка ${suffix}` },
        context: { disableRevalidate: true },
      })

      const [rereadImage, rereadPage] = await Promise.all([
        payload.findByID({ collection: 'media', id: image.id }),
        payload.findByID({ collection: 'pages', id: page.id }),
      ])

      expect(rereadImage.alt).toContain(suffix)
      expect(rereadPage.title).toContain(suffix)
    } finally {
      await payload.update({
        collection: 'media',
        id: image.id,
        data: { alt: originalAlt },
        context: { disableRevalidate: true },
      })
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { title: originalTitle },
        context: { disableRevalidate: true },
      })
    }
  })
})
