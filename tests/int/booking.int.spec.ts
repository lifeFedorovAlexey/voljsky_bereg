import { describe, expect, it } from 'vitest'

import { getBookingHref } from '@/modules/booking/getBookingHref'

describe('getBookingHref', () => {
  it('returns the configured YCLIENTS booking URL', () => {
    expect(getBookingHref('https://n123456.yclients.com/')).toBe('https://n123456.yclients.com/')
  })

  it('fails closed when YCLIENTS is not configured', () => {
    expect(getBookingHref(null)).toBe('/contacts#booking-setup')
  })

  it('rejects non-YCLIENTS hosts', () => {
    expect(getBookingHref('https://example.com/book')).toBe('/contacts#booking-setup')
  })
})
