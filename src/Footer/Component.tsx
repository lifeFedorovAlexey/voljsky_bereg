import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'


import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="vb-footer">
      <div className="container vb-footer__inner">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div>
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
          <p className="vb-footer__note">© {new Date().getFullYear()} Волжский берег · Стартовые контакты необходимо подтвердить перед публикацией.</p>
        </div>
      </div>
    </footer>
  )
}
