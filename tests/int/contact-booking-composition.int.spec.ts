import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContactBookingRenderer } from '@/modules/page-builder/renderers'

describe('contact + unavailable booking composition', () => {
  it('renders one compact service surface for the shared phone action', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ContactBookingRenderer, {
        booking: {
          blockType: 'booking',
          fallbackText: 'Онлайн-запись подключается. Позвоните нам — поможем подобрать даты.',
          yclientsUrl: '',
        },
        contact: {
          address: 'Иенево, берег Волги',
          blockType: 'contacts',
          description: 'Позвоните — ответим на вопросы о территории и поможем спланировать поездку.',
          phone: '+7 (930) 165-13-29',
          title: 'Связаться с нами',
        },
      }),
    )

    expect(markup.match(/<section/g)).toHaveLength(1)
    expect(markup).toContain('vb-contact-service')
    expect(markup).toContain('tel:+7 (930) 165-13-29')
    expect(markup).toContain('Онлайн-запись подключается')
  })
})
