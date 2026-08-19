'use client'

import React, { useState } from 'react'

type FormStatus = {
  kind: 'error' | 'success'
  message: string
} | null

export function GuestReviewForm({ onSuccess }: { onSuccess?: (message: string) => void }) {
  const [status, setStatus] = useState<FormStatus>(null)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setStatus(null)
    setSubmitting(true)

    try {
      const response = await fetch('/api/submit-review', {
        body: JSON.stringify({
          author: formData.get('author'),
          consent: formData.get('consent') === 'on',
          rating: Number(formData.get('rating')),
          text: formData.get('text'),
          website: formData.get('website'),
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as { error?: string; message?: string }

      if (!response.ok) throw new Error(result.error || 'Не удалось отправить отзыв')

      const successMessage = result.message || 'Спасибо! Отзыв отправлен на проверку.'
      form.reset()
      setRating(0)
      if (onSuccess) onSuccess(successMessage)
      else setStatus({ kind: 'success', message: successMessage })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Не удалось отправить отзыв',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="vb-review-form" onSubmit={submitReview}>
      <div className="vb-review-form__row">
        <label>
          <span>Имя</span>
          <input autoComplete="name" autoFocus maxLength={80} name="author" required type="text" />
        </label>

        <fieldset>
          <legend>Оценка</legend>
          <div className="vb-review-rating">
            {[1, 2, 3, 4, 5].map((score) => (
              <label className={score <= rating ? 'is-selected' : undefined} key={score}>
                <input
                  checked={rating === score}
                  name="rating"
                  onChange={() => setRating(score)}
                  required
                  type="radio"
                  value={score}
                />
                <span aria-hidden="true">★</span>
                <span className="vb-sr-only">{score} из 5</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <label>
        <span>Текст отзыва</span>
        <textarea maxLength={1000} minLength={20} name="text" required rows={4} />
        <small>От 20 до 1000 знаков.</small>
      </label>

      <label className="vb-review-form__consent">
        <input name="consent" required type="checkbox" />
        <span>Согласен на публикацию имени и текста отзыва после модерации.</span>
      </label>

      <label className="vb-review-form__honeypot" aria-hidden="true">
        Сайт
        <input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </label>

      <div className="vb-review-form__actions">
        <button className="vb-button" disabled={submitting} type="submit">
          {submitting ? 'Отправляем…' : 'Отправить на проверку'}
        </button>

        <p
          className={status ? `vb-review-form__status vb-review-form__status--${status.kind}` : 'vb-review-form__status'}
          role="status"
        >
          {status?.message}
        </p>
      </div>
    </form>
  )
}
