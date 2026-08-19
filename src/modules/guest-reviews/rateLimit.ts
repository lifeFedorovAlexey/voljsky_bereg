type RateLimitResult = {
  allowed: boolean
  retryAfter: number
}

type Options = {
  limit: number
  now?: () => number
  windowMs: number
}

export function createGuestReviewRateLimiter({ limit, now = Date.now, windowMs }: Options) {
  const visitors = new Map<string, { count: number; resetAt: number }>()

  return {
    check(key: string): RateLimitResult {
      const timestamp = now()
      const current = visitors.get(key)

      if (!current || current.resetAt <= timestamp) {
        visitors.set(key, { count: 1, resetAt: timestamp + windowMs })
        return { allowed: true, retryAfter: 0 }
      }

      if (current.count >= limit) {
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((current.resetAt - timestamp) / 1000)),
        }
      }

      current.count += 1
      return { allowed: true, retryAfter: 0 }
    },
  }
}
