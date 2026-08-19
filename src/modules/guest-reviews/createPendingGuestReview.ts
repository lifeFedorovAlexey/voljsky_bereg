import { parseGuestReviewSubmission } from './validation'

type PendingGuestReview = {
  author: string
  rating: number
  status: 'pending'
  text: string
}

type CreatePendingGuestReviewArgs<Result> = {
  create: (data: PendingGuestReview) => Promise<Result>
  input: unknown
}

export async function createPendingGuestReview<Result>({
  create,
  input,
}: CreatePendingGuestReviewArgs<Result>): Promise<Result> {
  const submission = parseGuestReviewSubmission(input)

  return create({
    ...submission,
    status: 'pending',
  })
}
