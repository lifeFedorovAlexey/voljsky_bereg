import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { GuestReviewDialog } from '@/modules/guest-reviews/GuestReviewDialog'

describe('GuestReviewDialog', () => {
  it('renders an accessible modal trigger and moderated submission form', () => {
    const markup = renderToStaticMarkup(createElement(GuestReviewDialog))

    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup).toContain('<dialog')
    expect(markup).toContain('aria-labelledby="guest-review-dialog-title"')
    expect(markup).toContain('aria-label="Закрыть форму отзыва"')
    expect(markup).toContain('>Закрыть</button>')
    expect(markup).toContain('Оставить отзыв')
    expect(markup).toContain('Имя')
    expect(markup).toContain('Оценка')
    expect(markup).toContain('Текст отзыва')
    expect(markup).toContain('после проверки')
    expect(markup.toLowerCase()).toContain('соглас')
    expect(markup).toContain('type="submit"')
    expect(markup).not.toContain('vb-review-contribution')
    expect(markup).not.toContain('vb-eyebrow')
    expect(markup).not.toContain('×')
  })
})
