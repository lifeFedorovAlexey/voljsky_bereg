import { describe, expect, it } from 'vitest'

import { GuestReviews } from '@/collections/GuestReviews'

describe('GuestReviews collection', () => {
  it('exposes a dedicated moderation queue in Payload Admin', () => {
    expect(GuestReviews.slug).toBe('guest-reviews')
    expect(GuestReviews.labels).toEqual({ singular: 'Отзыв гостя', plural: 'Отзывы гостей' })
    expect(GuestReviews.admin?.group).toBe('Обратная связь')
    expect(GuestReviews.admin?.defaultColumns).toEqual(['author', 'rating', 'status', 'createdAt'])
  })

  it('defines explicit pending, published and rejected moderation states', () => {
    const status = GuestReviews.fields.find((field) => 'name' in field && field.name === 'status')

    expect(status).toMatchObject({ defaultValue: 'pending', required: true, type: 'select' })
    expect(status && 'options' in status ? status.options : []).toEqual([
      { label: 'На проверке', value: 'pending' },
      { label: 'Опубликован', value: 'published' },
      { label: 'Отклонён', value: 'rejected' },
    ])
  })
})
