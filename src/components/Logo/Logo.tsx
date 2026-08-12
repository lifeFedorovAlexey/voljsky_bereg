import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span className={`vb-logo ${className || ''}`}>
      <strong>Волжский берег</strong>
      <small>отдых на Волге</small>
    </span>
  )
}
