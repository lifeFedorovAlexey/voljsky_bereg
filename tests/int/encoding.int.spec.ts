import { describe, expect, it } from 'vitest'

import seedContent from '@/seed/content.json'
import { hasBrokenEncoding } from '@/utilities/hasBrokenEncoding'

describe('UTF-8 content integrity', () => {
  it('detects Unicode replacement characters and common UTF-8 mojibake', () => {
    expect(hasBrokenEncoding('Нормальный русский текст')).toBe(false)
    expect(hasBrokenEncoding('Повреждено: ����')).toBe(true)
    expect(hasBrokenEncoding('ÐÑÐ¸Ð²ÐµÑ')).toBe(true)
  })

  it('keeps all committed seed content free from encoding corruption', () => {
    expect(hasBrokenEncoding(JSON.stringify(seedContent))).toBe(false)
  })
})
