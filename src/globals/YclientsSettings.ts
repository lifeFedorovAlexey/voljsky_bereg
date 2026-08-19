import type { GlobalConfig } from 'payload'

export const YclientsSettings: GlobalConfig = {
  slug: 'yclientsSettings',
  label: 'YCLIENTS',
  admin: {
    group: 'Интеграции',
    description: 'Настройка реального филиала YCLIENTS и native read-only booking flow.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'enabled',
      label: 'Включить native-интеграцию',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Включайте только после read-only проверки реального company_id и доступов.',
      },
    },
    {
      name: 'accountLabel',
      label: 'Название реального аккаунта',
      type: 'text',
      admin: {
        description: 'Только подпись для админки, например «Иенево. Берег». Не является API-ключом.',
      },
    },
    {
      name: 'companyId',
      label: 'ID филиала YCLIENTS (company_id)',
      type: 'number',
      min: 1,
      admin: {
        description: 'Реальный ID филиала из API. Тестовый company_id сюда не переносить.',
      },
    },
    {
      name: 'mode',
      label: 'Режим формы',
      type: 'select',
      defaultValue: 'native-readonly',
      options: [
        { label: 'Native API (read-only доступность)', value: 'native-readonly' },
        { label: 'Hosted fallback YCLIENTS', value: 'hosted-fallback' },
      ],
      admin: {
        description: 'Создание записи и SMS-подтверждение подключаются отдельным этапом.',
      },
    },
  ],
  versions: false,
}
