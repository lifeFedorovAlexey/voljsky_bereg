import { describe, expect, it } from 'vitest'

import { shouldRevalidateGuestReviews } from '@/collections/GuestReviews/revalidateGuestReviews'

describe('guest review cache invalidation', () => {
  it('revalidates only when public visibility can change', () => {
    expect(shouldRevalidateGuestReviews({ status: 'pending' }, null)).toBe(false)
    expect(shouldRevalidateGuestReviews({ status: 'published' }, { status: 'pending' })).toBe(true)
    expect(shouldRevalidateGuestReviews({ status: 'rejected' }, { status: 'published' })).toBe(true)
  })
})
