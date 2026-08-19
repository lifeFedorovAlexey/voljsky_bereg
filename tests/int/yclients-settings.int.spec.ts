import { describe, expect, it } from 'vitest'

import { YclientsSettings } from '@/globals/YclientsSettings'
import { Stays } from '@/modules/page-builder/blocks'

describe('YCLIENTS admin configuration', () => {
  it('exposes real-account settings without storing credentials in Payload', () => {
    expect(YclientsSettings.slug).toBe('yclientsSettings')
    expect(YclientsSettings.fields.map((field) => 'name' in field && field.name)).toEqual([
      'enabled',
      'accountLabel',
      'companyId',
      'mode',
    ])
    expect(YclientsSettings.fields.some((field) => 'name' in field && field.name === 'partnerToken')).toBe(false)
    expect(YclientsSettings.fields.some((field) => 'name' in field && field.name === 'userToken')).toBe(false)
  })

  it('exposes explicit stay-to-YCLIENTS mapping fields', () => {
    const staysItems = Stays.fields.find((field) => 'name' in field && field.name === 'items')
    if (!staysItems || !('fields' in staysItems)) throw new Error('Stays mapping fields are missing')

    expect(staysItems.fields.map((field) => 'name' in field && field.name)).toContain('yclientsServiceId')
    expect(staysItems.fields.map((field) => 'name' in field && field.name)).toContain('yclientsStaffId')
  })
})
