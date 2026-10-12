import { Check } from '@phosphor-icons/react'
import { useState } from 'react'
import { GiftCard } from '../components/GiftCard'
import { BottomAction, NavBar } from '../components/ui'
import type { Product as P } from '../lib/data'
import { rub } from '../lib/format'
import { useHaptic } from '../hooks/useHaptic'

type Props = { product: P; isTop: boolean; onBuy: (amount: number) => void }

export function Product({ product: p, isTop, onBuy }: Props) {
  const haptic = useHaptic()
  const [amount, setAmount] = useState(p.variants?.[0] ?? p.price)

  return (
    <>
      <NavBar title={p.name} />

      <div className="product-hero inner rise">
        <GiftCard brand={p.brand} colors={p.colors} title={p.name} amount={amount} caption={p.unit} size="hero" />
      </div>

      <section className="inner rise" style={{ ['--i' as string]: 1 }}>
        <h1 className="product-name">{p.name}</h1>
        <p className="product-desc">{p.desc}</p>
      </section>

      {p.variants && (
        <section className="inner rise" style={{ ['--i' as string]: 2 }}>
          <h2 className="sec-head">Номинал</h2>
          <div className="chips wrap" role="group" aria-label="Номинал">
            {p.variants.map(v => (
              <button
                key={v}
                type="button"
                className="chip"
                aria-pressed={v === amount}
                onClick={() => {
                  haptic.select()
                  setAmount(v)
                }}
              >
                {rub(v)}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="inner rise" style={{ ['--i' as string]: 3 }}>
        <h2 className="sec-head">Что входит</h2>
        <ul className="checks">
          {p.checks.map(c => (
            <li key={c}>
              <Check size={18} aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
        <p className="fine">Демо: покупка оформляется, но деньги не списываются и код не приходит.</p>
      </section>

      <BottomAction visible={isTop} text={`Купить · ${rub(amount)}`} onClick={() => onBuy(amount)} />
    </>
  )
}
