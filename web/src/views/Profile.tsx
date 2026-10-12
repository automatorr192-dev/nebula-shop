import { Bell, FileText, Headset, ShieldCheck } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { NavBar } from '../components/ui'
import { TG, userName } from '../lib/tg'

const ROWS: { icon: ReactNode; title: string; sub: string }[] = [
  { icon: <Bell size={20} />, title: 'Уведомления', sub: 'Коды и статусы заказов в чате с ботом' },
  { icon: <Headset size={20} />, title: 'Поддержка', sub: 'Отвечаем в Telegram круглосуточно' },
  { icon: <ShieldCheck size={20} />, title: 'Гарантия и возврат', sub: 'Не активировалось: вернём деньги' },
  { icon: <FileText size={20} />, title: 'Условия', sub: 'Оферта и обработка данных' },
]

export function Profile() {
  const name = userName()
  const username = TG?.initDataUnsafe.user?.username

  return (
    <>
      <NavBar title="Профиль" large />
      <div className="profile inner rise">
        <span className="avatar big" aria-hidden="true">
          {name[0]}
        </span>
        <div>
          <b>{name}</b>
          <span>{username ? `@${username}` : 'Telegram Mini App'}</span>
        </div>
      </div>
      <ul className="menu inner rise" style={{ ['--i' as string]: 1 }}>
        {ROWS.map(r => (
          <li key={r.title}>
            <span className="menu-icon">{r.icon}</span>
            <span className="menu-body">
              <b>{r.title}</b>
              <span>{r.sub}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="fineprint inner">
        Демо-проект для портфолио: цены и покупки вымышлены, деньги не списываются, данные хранятся только на этом устройстве.
        <br />
        Дизайн и разработка: @automatorrr
      </p>
    </>
  )
}
