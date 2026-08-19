type GuestReviewSubmission = {
  author: string
  rating: number
  text: string
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function parseGuestReviewSubmission(input: unknown): GuestReviewSubmission {
  if (!input || typeof input !== 'object') throw new Error('Не удалось отправить отзыв')

  const data = input as Record<string, unknown>
  const author = readString(data.author)
  const text = readString(data.text)
  const rating = Number(data.rating)

  if (readString(data.website)) throw new Error('Не удалось отправить отзыв')
  if (!author) throw new Error('Укажите имя')
  if (author.length > 80) throw new Error('Имя должно быть не длиннее 80 символов')
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Выберите оценку от 1 до 5')
  if (text.length < 20) throw new Error('Текст отзыва должен быть не короче 20 символов')
  if (text.length > 1000) throw new Error('Текст отзыва должен быть не длиннее 1000 символов')
  if (data.consent !== true) throw new Error('Подтвердите согласие на публикацию отзыва')

  return { author, rating, text }
}
