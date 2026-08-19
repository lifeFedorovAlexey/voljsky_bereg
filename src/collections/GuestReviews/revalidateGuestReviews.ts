import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

type ReviewVisibility = {
  status?: string | null
}

export function shouldRevalidateGuestReviews(
  doc: ReviewVisibility,
  previousDoc: ReviewVisibility | null | undefined,
): boolean {
  return doc.status === 'published' || previousDoc?.status === 'published'
}

export const revalidateGuestReviews: CollectionAfterChangeHook = ({
  context,
  doc,
  previousDoc,
}) => {
  if (!context.disableRevalidate && shouldRevalidateGuestReviews(doc, previousDoc)) {
    revalidatePath('/', 'layout')
  }

  return doc
}

export const revalidateDeletedGuestReview: CollectionAfterDeleteHook = ({ context, doc }) => {
  if (!context.disableRevalidate && doc.status === 'published') {
    revalidatePath('/', 'layout')
  }

  return doc
}
