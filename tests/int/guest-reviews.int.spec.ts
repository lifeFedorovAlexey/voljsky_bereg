import { describe, expect, it } from 'vitest'

import {
  guestReviewsCreateAccess,
  guestReviewsReadAccess,
} from '@/modules/guest-reviews/access'
import { createGuestReviewRateLimiter } from '@/modules/guest-reviews/rateLimit'
import { parseGuestReviewSubmission } from '@/modules/guest-reviews/validation'

describe('guest review policy', () => {
  it('keeps the collection write path moderator-only', () => {
    expect(guestReviewsCreateAccess({ req: { user: null } } as never)).toBe(false)
    expect(guestReviewsCreateAccess({ req: { user: { id: 1 } } } as never)).toBe(true)
  })

  it('limits anonymous reads to published reviews', () => {
    expect(guestReviewsReadAccess({ req: { user: null } } as never)).toEqual({
      status: { equals: 'published' },
    })
    expect(guestReviewsReadAccess({ req: { user: { id: 1 } } } as never)).toBe(true)
  })
})

describe('guest review submission validation', () => {
  it('normalizes a valid public submission without accepting moderation fields', () => {
    expect(
      parseGuestReviewSubmission({
        author: '  Анна  ',
        consent: true,
        rating: 5,
        status: 'published',
        text: '  Нам понравились тишина, берег и внимательный сервис.  ',
        website: '',
      }),
    ).toEqual({
      author: 'Анна',
      rating: 5,
      text: 'Нам понравились тишина, берег и внимательный сервис.',
    })
  })

  it.each([
    [{ author: '', consent: true, rating: 5, text: 'Достаточно длинный текст отзыва.', website: '' }, 'Укажите имя'],
    [{ author: 'Анна', consent: true, rating: 0, text: 'Достаточно длинный текст отзыва.', website: '' }, 'Выберите оценку'],
    [{ author: 'Анна', consent: true, rating: 5, text: 'Коротко', website: '' }, 'не короче 20'],
    [{ author: 'Анна', consent: false, rating: 5, text: 'Достаточно длинный текст отзыва.', website: '' }, 'Подтвердите согласие'],
    [{ author: 'Анна', consent: true, rating: 5, text: 'Достаточно длинный текст отзыва.', website: 'spam.example' }, 'Не удалось отправить'],
  ])('rejects an invalid submission %#', (input, message) => {
    expect(() => parseGuestReviewSubmission(input)).toThrow(message)
  })
})

describe('guest review rate limit', () => {
  it('blocks the fourth submission in one hour and reports a retry delay', () => {
    let now = 1_000
    const limiter = createGuestReviewRateLimiter({ limit: 3, now: () => now, windowMs: 3_600_000 })

    expect(limiter.check('visitor-a').allowed).toBe(true)
    expect(limiter.check('visitor-a').allowed).toBe(true)
    expect(limiter.check('visitor-a').allowed).toBe(true)
    expect(limiter.check('visitor-b').allowed).toBe(true)

    const blocked = limiter.check('visitor-a')
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBe(3600)

    now += 3_600_001
    expect(limiter.check('visitor-a').allowed).toBe(true)
  })
})
