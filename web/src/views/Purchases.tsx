import { Receipt } from '@phosphor-icons/react'
import { Logo } from '../components/GiftCard'
import { NavBar } from '../components/ui'
import { byId, STEAM } from '../lib/data'
import { rub, when } from '../lib/format'
import type { Purchase } from '../lib/store'

type Props = { purchases: Purchase[]; onShop: () => void }

export function Purchases({ purchases, onShop }: Props) {
  const list = [...purchases].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))

  return (
    <>
      <NavBar title="Покупки" large />
      {list.length ? (
        <ul className="orders inner rise">
          {list.map(o => {
            const steam = o.product === 'steam'
            const p = steam ? null : byId(o.product)
            const colors = steam ? STEAM.colors : p!.colors
            return (
              <li key={o.id} className="order">
                <span className="order-art" style={{ ['--c1' as string]: colors[0], ['--c2' as string]: colors[1] }}>
                  <Logo brand={steam ? STEAM.brand : p!.brand} size={20} />
                </span>
                <span className="order-body">
                  <b>{steam ? `Steam · ${o.login}` : p!.name}</b>
                  <span>{when(o.at)}</span>
                </span>
                <span className="order-side">
                  <b>{rub(o.amount)}</b>
                  <span className="status">{steam ? 'Зачислено' : 'Код отправлен'}</span>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="empty inner rise">
          <span className="empty-icon">
            <Receipt size={30} />
          </span>
          <h2>Пока ничего не купили</h2>
          <p>Здесь появятся подписки, ключи и пополнения после оплаты.</p>
          <button className="btn" type="button" onClick={onShop}>
            В каталог
          </button>
        </div>
      )}
    </>
  )
}
