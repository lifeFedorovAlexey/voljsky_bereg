import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Администратор',
    plural: 'Администраторы',
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    group: 'Настройки',
    description: 'Пользователи, которым разрешено редактировать сайт.',
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      label: 'Имя',
      type: 'text',
    },
  ],
  timestamps: true,
  versions: false,
}
