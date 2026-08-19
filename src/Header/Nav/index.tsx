'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'


export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <div className="vb-nav-shell">
      <nav aria-label="Основная навигация" className="vb-header-nav">
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} appearance="link" />
        })}
        <Link className="vb-button vb-button--small" href="/contacts#booking">Забронировать</Link>
      </nav>

      <div className="vb-mobile-actions">
        <Link aria-label="Забронировать" className="vb-button vb-button--small" href="/contacts#booking">
          <span className="vb-mobile-booking-label--full">Забронировать</span>
          <span aria-hidden="true" className="vb-mobile-booking-label--short">Бронь</span>
        </Link>
        <details className="vb-mobile-menu">
          <summary aria-label="Открыть меню">
            <span aria-hidden="true" />
          </summary>
          <nav aria-label="Мобильная навигация" className="vb-mobile-menu__panel">
            {navItems.map(({ link }, i) => {
              return <CMSLink key={i} {...link} appearance="link" />
            })}
          </nav>
        </details>
      </div>
    </div>
  )
}
