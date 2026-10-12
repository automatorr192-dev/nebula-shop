import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMainButton } from '../hooks/useMainButton'
import { useHaptic } from '../hooks/useHaptic'

type NavProps = { title: string; large?: boolean; right?: ReactNode; hero?: ReactNode }

export function NavBar({ title, large, right, hero }: NavProps) {
  const sentinel = useRef<HTMLDivElement>(null)
  const tall = large || !!hero
  const [compact, setCompact] = useState(!tall)

  useEffect(() => {
    if (!tall || !sentinel.current) return
    const root = sentinel.current.closest('.screen')
    const top = 48 + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tg-top')) || 0)
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting), { root, threshold: 0, rootMargin: `-${top}px 0px 0px 0px` })
    io.observe(sentinel.current)
    return () => io.disconnect()
  }, [tall])

  return (
    <>
      <header className={`navbar${compact ? ' compact' : ''}`}>
        <span className="small" aria-hidden={tall && !compact}>{title}</span>
        {right && <span className="right">{right}</span>}
      </header>
      {hero ? (
        <>
          {hero}
          <div ref={sentinel} style={{ height: 1 }} />
        </>
      ) : large ? (
        <div className="large inner">
          <h1>{title}</h1>
          <div ref={sentinel} style={{ height: 1 }} />
        </div>
      ) : (
        <div style={{ height: 56 }} />
      )}
    </>
  )
}

export function Chips<T extends string>({ items, value, onChange, label }: { items: { id: T; name: string }[]; value?: T; onChange: (v: T) => void; label: string }) {
  const haptic = useHaptic()
  return (
    <div className="chips" role="group" aria-label={label}>
      {items.map(i => (
        <button
          key={i.id}
          type="button"
          className="chip"
          aria-pressed={value === undefined ? undefined : i.id === value}
          onClick={() => {
            haptic.select()
            onChange(i.id)
          }}
        >
          {i.name}
        </button>
      ))}
    </div>
  )
}

type ActionProps = { text: string; onClick: () => void; active?: boolean; visible: boolean }

export function BottomAction({ text, onClick, active = true, visible }: ActionProps) {
  useMainButton({ text, onClick, active, visible })
  if (!visible) return null
  return (
    <div className="bottom-action">
      <button className="btn" type="button" disabled={!active} onClick={onClick}>
        {text}
      </button>
    </div>
  )
}
