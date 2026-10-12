import type { CSSProperties, ReactNode } from 'react'
import { LOGO, type Brand } from '../lib/logos'
import { rub } from '../lib/format'

export function Logo({ brand, size = 18 }: { brand: Brand; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={LOGO[brand]} />
    </svg>
  )
}

type Props = {
  brand: Brand
  colors: [string, string]
  title: string
  amount?: number
  from?: boolean
  caption?: string
  size?: 'hero' | 'tile'
  badge?: ReactNode
  className?: string
  style?: CSSProperties
}

export function GiftCard({ brand, colors, title, amount, from, caption, size = 'tile', badge, className = '', style }: Props) {
  return (
    <div className={`gift ${size} ${className}`} style={{ ['--c1' as string]: colors[0], ['--c2' as string]: colors[1], ...style }}>
      <span className="gift-logo">
        <Logo brand={brand} size={size === 'hero' ? 24 : 16} />
      </span>
      {badge}
      <span className="gift-foot">
        <span className="gift-title">
          {caption && <small>{caption}</small>}
          {title}
        </span>
        {amount !== undefined && (
          <span className="gift-amount">
            {from && <small>от</small>}
            {rub(amount)}
          </span>
        )}
      </span>
    </div>
  )
}
