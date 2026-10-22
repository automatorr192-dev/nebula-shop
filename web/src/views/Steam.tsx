import { Minus, Plus } from '@phosphor-icons/react'
import { useState } from 'react'
import { GiftCard } from '../components/GiftCard'
import { BottomAction, NavBar } from '../components/ui'
import { STEAM } from '../lib/data'
import { rub } from '../lib/format'
import { useHaptic } from '../hooks/useHaptic'

const MAX = 50000

type Props = { isTop: boolean; onPay: (amount: number, login: string) => void }

export function Steam({ isTop, onPay }: Props) {
  const haptic = useHaptic()
  const [login, setLogin] = useState('')
  const [amount, setAmount] = useState(1000)
  const valid = login.trim().length > 1 && amount >= STEAM.min
  const step = (d: number) => {
    haptic.select()
    setAmount(a => Math.min(MAX, Math.max(STEAM.min, a + d)))
  }

  return (
    <>
      <NavBar title="Пополнить Steam" />

      <div className="product-hero inner rise">
        <GiftCard brand={STEAM.brand} colors={STEAM.colors} title={login.trim() || 'Ваш аккаунт Steam'} caption="на баланс" amount={amount} size="hero" />
      </div>

      <section className="inner rise" style={{ ['--i' as string]: 1 }}>
        <div className="field">
          <label htmlFor="login">Логин Steam</label>
          <input id="login" value={login} onChange={e => setLogin(e.target.value)} placeholder="Например, gaben" autoComplete="off" autoCapitalize="off" spellCheck={false} />
          <small>Не путайте с ником в профиле: логин вы вводите при входе в Steam.</small>
        </div>
      </section>

      <section className="inner rise" style={{ ['--i' as string]: 2 }}>
        <h2 className="sec-head">Сумма</h2>
        <div className="stepper">
          <button type="button" aria-label={`Меньше на ${STEAM.step} ₽`} disabled={amount <= STEAM.min} onClick={() => step(-STEAM.step)}>
            <Minus size={22} />
          </button>
          <output aria-live="polite">{rub(amount)}</output>
          <button type="button" aria-label={`Больше на ${STEAM.step} ₽`} disabled={amount >= MAX} onClick={() => step(STEAM.step)}>
            <Plus size={22} />
          </button>
        </div>
        <div className="chips wrap" role="group" aria-label="Быстрая сумма">
          {STEAM.presets.map(v => (
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

      <section className="inner rise" style={{ ['--i' as string]: 3 }}>
        <div className="summary">
          <div>
            <span>Придёт на баланс</span>
            <b>{rub(amount)}</b>
          </div>
          <div>
            <span>Комиссия</span>
            <b>0 ₽</b>
          </div>
        </div>
        <p className="fine">{valid ? 'Демо: в Telegram оплата идёт звёздами в чате с ботом — списывается 1 ⭐ и сразу возвращается.' : 'Чтобы пополнить, укажите логин Steam.'}</p>
      </section>

      <BottomAction visible={isTop} active={valid} text={`Пополнить · ${rub(amount)}`} onClick={() => onPay(amount, login.trim())} />
    </>
  )
}
