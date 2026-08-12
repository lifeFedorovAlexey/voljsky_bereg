import config from '@payload-config'
import {
  getFileByPath,
  getPayload,
  type DataFromGlobalSlug,
  type RequiredDataFromCollectionSlug,
} from 'payload'
import { headers } from 'next/headers'
import path from 'node:path'

import content from '@/seed/content.json'
import { hasBrokenEncoding } from '@/utilities/hasBrokenEncoding'

type SeedValue = unknown

const mediaSources = {
  heroVolga: { alt: 'Рассвет над широкой рекой', filename: 'hero-volga.svg' },
  stayHouse: { alt: 'Деревянный дом для отдыха', filename: 'stay-house.jpg' },
  eveningFire: { alt: 'Вечерний отдых у огня', filename: 'evening-fire.jpg' },
  sitePlan: { alt: 'Схема территории Волжского берега', filename: 'voljsky-plan.svg' },
} as const

function resolveMedia(value: SeedValue, media: Record<string, number>): SeedValue {
  if (typeof value === 'string' && value.startsWith('@media:')) {
    return media[value.slice('@media:'.length)]
  }

  if (Array.isArray(value)) return value.map((item) => resolveMedia(item, media))

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveMedia(item, media)]),
    )
  }

  return value
}

export async function POST(): Promise<Response> {
  if (hasBrokenEncoding(JSON.stringify(content))) {
    return Response.json({ error: 'Стартовый контент повреждён: обнаружена неверная кодировка.' }, { status: 500 })
  }

  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return Response.json({ error: 'Требуется вход в админку' }, { status: 401 })

  const media: Record<string, number> = {}

  for (const [key, source] of Object.entries(mediaSources)) {
    const existing = await payload.find({
      collection: 'media',
      limit: 1,
      where: { filename: { equals: source.filename } },
    })

    const doc = existing.docs[0] || await payload.create({
      collection: 'media',
      data: { alt: source.alt },
      file: await getFileByPath(path.join(process.cwd(), 'public', source.filename)),
    })

    media[key] = Number(doc.id)
  }

  for (const page of content.pages) {
    const existing = await payload.find({
      collection: 'pages',
      limit: 1,
      where: { slug: { equals: page.slug } },
    })

    if (!existing.docs.length) {
      const pageData = resolveMedia(page, media) as RequiredDataFromCollectionSlug<'pages'>

      await payload.create({
        collection: 'pages',
        data: {
          ...pageData,
          _status: 'published',
        },
      })
    }
  }

  await payload.updateGlobal({
    slug: 'header',
    data: content.header as DataFromGlobalSlug<'header'>,
  })
  await payload.updateGlobal({
    slug: 'footer',
    data: content.footer as DataFromGlobalSlug<'footer'>,
  })

  return Response.json({ success: true, pages: content.pages.length, media: Object.keys(media).length })
}
