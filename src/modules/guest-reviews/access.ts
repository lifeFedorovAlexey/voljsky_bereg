import type { Access } from 'payload'

export const guestReviewsCreateAccess: Access = ({ req: { user } }) => Boolean(user)

export const guestReviewsReadAccess: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    status: {
      equals: 'published',
    },
  }
}
