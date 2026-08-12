const YCLIENTS_HOST_PATTERN = /(^|\.)yclients\.(com|ru)$/i

export function getBookingHref(value?: string | null): string {
  if (!value) return '/contacts#booking-setup'

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !YCLIENTS_HOST_PATTERN.test(url.hostname)) {
      return '/contacts#booking-setup'
    }
    return url.toString()
  } catch {
    return '/contacts#booking-setup'
  }
}
