import config from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { GuestReviewDialog } from './GuestReviewDialog'

type LegacyReview = {
  author?: string | null
  id?: string | null
  rating?: number | null
  text?: string | null
}

type TestimonialsBlock = {
  anchor?: string | null
  description?: string | null
  eyebrow?: string | null
  items?: LegacyReview[] | null
  maxItems?: number | string | null
  showForm?: boolean | null
  theme?: string | null
  title?: string | null
}

export async function TestimonialsSection({ block }: { block: TestimonialsBlock }) {
  const limit = [2, 4, 6].includes(Number(block.maxItems)) ? Number(block.maxItems) : 4
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'guest-reviews',
    limit,
    overrideAccess: false,
    pagination: false,
    sort: '-createdAt',
    where: {
      status: {
        equals: 'published',
      },
    },
  })
  const reviews = result.docs.length > 0 ? result.docs : block.items || []
  const showForm = block.showForm !== false

  return (
    <section
      className={`vb-section vb-section--${block.theme || 'light'} vb-section--testimonials`}
      id={block.anchor || undefined}
    >
      <div className="container">
        <div className="vb-testimonials-header">
          <div>
            {block.eyebrow && <p className="vb-eyebrow">{block.eyebrow}</p>}
            {block.title && <h2 className="vb-title">{block.title}</h2>}
            {block.description && <p className="vb-lead">{block.description}</p>}
          </div>
          <div className="vb-testimonials-header__actions">
            <p className="vb-testimonials-header__moderation">Публикуем отзывы после проверки.</p>
            {showForm && <GuestReviewDialog />}
          </div>
        </div>

        <div className="vb-testimonials-list" aria-label="Опубликованные отзывы гостей">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <blockquote className="vb-card vb-card--quote" key={review.id || index}>
                  <div className="vb-review-stars" aria-label={`Оценка ${review.rating || 5} из 5`}>
                    {'★'.repeat(Number(review.rating) || 5)}
                  </div>
                  <p>«{review.text}»</p>
                  <footer>{review.author}</footer>
                </blockquote>
              ))
            ) : (
              <div className="vb-testimonials-empty">
                <h3>Пока нет опубликованных отзывов</h3>
                <p>Поделитесь впечатлением — после проверки оно появится здесь.</p>
              </div>
            )}
        </div>
      </div>
    </section>
  )
}
