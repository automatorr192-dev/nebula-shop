import { Check } from '@phosphor-icons/react'
import { GiftCard } from '../components/GiftCard'
import { byId, STEAM } from '../lib/data'
import { rub } from '../lib/format'
import type { Purchase } from '../lib/store'

type Props = { purchase: Purchase; onPurchases: () => void; onShop: () => void }

export function Success({ purchase, onPurchases, onShop }: Props) {
  const steam = purchase.product === 'steam'
  const p = steam ? null : byId(purchase.product)
  const name = steam ? 'Пополнение Steam' : p!.name

  return (
    <div className="success inner">
      <div className="success-card">
        <GiftCard
          brand={steam ? STEAM.brand : p!.brand}
          colors={steam ? STEAM.colors : p!.colors}
          title={steam ? purchase.login! : p!.name}
          caption={steam ? 'на баланс' : p!.unit}
          amount={purchase.amount}
          size="hero"
          badge={
            <span className="gift-ok" aria-hidden="true">
              <Check size={22} />
            </span>
          }
        />
      </div>
      <h1>Готово</h1>
      <p className="success-lead">
        {steam ? `Пополнили Steam ${purchase.login} на ${rub(purchase.amount)}` : `Вы купили ${name} за ${rub(purchase.amount)}`}
      </p>
      <p className="fine">В настоящем магазине {steam ? 'деньги пришли бы на баланс' : 'код пришёл бы в чат с ботом'} за минуту. Это демо: деньги не списаны.</p>
      <div className="actions">
        <button className="btn" type="button" onClick={onPurchases}>
          Мои покупки
        </button>
        <button className="btn ghost" type="button" onClick={onShop}>
          В магазин
        </button>
      </div>
    </div>
  )
}
