import { describe, expect, it } from 'vitest'

import seedContent from '@/seed/content.json'
import { hasBrokenEncoding } from '@/utilities/hasBrokenEncoding'

describe('UTF-8 content integrity', () => {
  it('detects Unicode replacement characters and common UTF-8 mojibake', () => {
    expect(hasBrokenEncoding('Нормальный русский текст')).toBe(false)
    expect(hasBrokenEncoding('Повреждено: ����')).toBe(true)
    expect(hasBrokenEncoding('ÐÑÐ¸Ð²ÐµÑ')).toBe(true)
  })

  it('keeps all committed seed content free from encoding corruption', () => {
    expect(hasBrokenEncoding(JSON.stringify(seedContent))).toBe(false)
  })

  it('keeps confirmed public branding and contact data in the seed', () => {
    const serialized = JSON.stringify(seedContent)

    expect(serialized).toContain('Иенево. Берег')
    expect(serialized).toContain('+7 (930) 165-13-29')
    expect(serialized).not.toContain('Волжский берег')
    expect(serialized).not.toContain('+7 (900) 000-00-00')
  })
})
