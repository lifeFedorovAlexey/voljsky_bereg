import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Верхнее меню',
  admin: {
    group: 'Меню сайта',
    description: 'Ссылки в верхней части каждой страницы сайта.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      label: 'Пункты меню',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
  versions: false,
}
