import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import {
  guestReviewsCreateAccess,
  guestReviewsReadAccess,
} from '@/modules/guest-reviews/access'
import {
  revalidateDeletedGuestReview,
  revalidateGuestReviews,
} from './GuestReviews/revalidateGuestReviews'

export const GuestReviews: CollectionConfig = {
  slug: 'guest-reviews',
  labels: {
    singular: 'Отзыв гостя',
    plural: 'Отзывы гостей',
  },
  access: {
    create: guestReviewsCreateAccess,
    delete: authenticated,
    read: guestReviewsReadAccess,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['author', 'rating', 'status', 'createdAt'],
    description: 'Проверяйте новые отзывы и публикуйте только подтверждённые записи.',
    group: 'Обратная связь',
    hideAPIURL: true,
    listSearchableFields: ['author', 'text'],
    useAsTitle: 'author',
  },
  fields: [
    {
      name: 'author',
      label: 'Имя гостя',
      type: 'text',
      maxLength: 80,
      required: true,
    },
    {
      name: 'text',
      label: 'Текст отзыва',
      type: 'textarea',
      maxLength: 1000,
      minLength: 20,
      required: true,
    },
    {
      name: 'rating',
      label: 'Оценка',
      type: 'number',
      max: 5,
      min: 1,
      required: true,
    },
    {
      name: 'status',
      label: 'Статус модерации',
      type: 'select',
      admin: {
        description: 'На сайте показываются только опубликованные отзывы.',
        position: 'sidebar',
      },
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'На проверке', value: 'pending' },
        { label: 'Опубликован', value: 'published' },
        { label: 'Отклонён', value: 'rejected' },
      ],
      required: true,
    },
    {
      name: 'moderationNote',
      label: 'Заметка модератора',
      type: 'textarea',
      admin: {
        description: 'Внутренняя заметка. На сайте не показывается.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateGuestReviews],
    afterDelete: [revalidateDeletedGuestReview],
  },
  timestamps: true,
}
