import { describe, expect, it, vi } from 'vitest'

import { createPendingGuestReview } from '@/modules/guest-reviews/createPendingGuestReview'

describe('createPendingGuestReview', () => {
  it('whitelists public fields and always creates a pending review', async () => {
    const create = vi.fn(async () => ({ id: 'review-1' }))

    const result = await createPendingGuestReview({
      create,
      input: {
        author: 'Анна',
        consent: true,
        moderationNote: 'publish me',
        rating: 5,
        status: 'published',
        text: 'Нам понравились тишина, берег и внимательный сервис.',
        website: '',
      },
    })

    expect(create).toHaveBeenCalledWith({
      author: 'Анна',
      rating: 5,
      status: 'pending',
      text: 'Нам понравились тишина, берег и внимательный сервис.',
    })
    expect(result).toEqual({ id: 'review-1' })
  })
})
