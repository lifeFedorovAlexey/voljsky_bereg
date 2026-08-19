import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

import { createPendingGuestReview } from '@/modules/guest-reviews/createPendingGuestReview'
import { createGuestReviewRateLimiter } from '@/modules/guest-reviews/rateLimit'

const limiter = createGuestReviewRateLimiter({
  limit: 3,
  windowMs: 60 * 60 * 1000,
})

function visitorKey(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 16_384) {
    return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 })
  }

  const rateLimit = limiter.check(visitorKey(request))
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Слишком много попыток. Попробуйте позже.' },
      {
        headers: { 'Retry-After': String(rateLimit.retryAfter) },
        status: 429,
      },
    )
  }

  try {
    const input = (await request.json()) as unknown
    const payload = await getPayload({ config })

    await createPendingGuestReview({
      create: (data) =>
        payload.create({
          collection: 'guest-reviews',
          data,
          overrideAccess: true,
        }),
      input,
    })

    return NextResponse.json(
      { message: 'Спасибо! Отзыв отправлен на проверку.' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Не удалось отправить отзыв',
      },
      { status: 400 },
    )
  }
}
