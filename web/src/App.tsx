import { CaretLeft, House, Receipt, SquaresFour, User } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useBackButton } from './hooks/useBackButton'
import { useHaptic } from './hooks/useHaptic'
import { byId, type Category } from './lib/data'
import { load, save, type Purchase } from './lib/store'
import { payInBot, TG } from './lib/tg'
import { Catalog } from './views/Catalog'
import { Home } from './views/Home'
import { Product } from './views/Product'
import { Profile } from './views/Profile'
import { Purchases } from './views/Purchases'
import { Steam } from './views/Steam'
import { Success } from './views/Success'

type Tab = 'home' | 'catalog' | 'purchases' | 'profile'
type Route = { name: Tab } | { name: 'product'; id: string } | { name: 'steam' } | { name: 'success'; id: string }
type Entry = Route & { key: number }

const TABS: { id: Tab; name: string; icon: ReactNode }[] = [
  { id: 'home', name: 'Главная', icon: <House size={22} /> },
  { id: 'catalog', name: 'Каталог', icon: <SquaresFour size={22} /> },
  { id: 'purchases', name: 'Покупки', icon: <Receipt size={22} /> },
  { id: 'profile', name: 'Профиль', icon: <User size={22} /> },
]
const ROOTS: string[] = TABS.map(t => t.id)

let seq = 0
const entry = (r: Route): Entry => ({ ...r, key: ++seq })
const PUSH_MS = 500

export default function App() {
  const haptic = useHaptic()
  const [purchases, setPurchases] = useState<Purchase[]>(load)
  const [stack, setStack] = useState<Entry[]>([entry({ name: 'home' })])
  const [entering, setEntering] = useState<number | null>(null)
  const [ghost, setGhost] = useState<Entry | null>(null)
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [focusSearch, setFocusSearch] = useState(false)
  const last = useRef<Purchase[] | null>(null)

  useEffect(() => {
    if (last.current) save(purchases)
    last.current = purchases
  }, [purchases])

  const push = (r: Route) => {
    const e = entry(r)
    setStack(s => [...s, e])
    setEntering(e.key)
    requestAnimationFrame(() => requestAnimationFrame(() => setEntering(null)))
  }

  const pop = () => {
    if (stack.length < 2) return
    const top = stack[stack.length - 1]
    setGhost(top)
    setStack(s => s.slice(0, -1))
    window.setTimeout(() => setGhost(g => (g?.key === top.key ? null : g)), PUSH_MS)
  }

  const reset = (r: Route) => {
    setGhost(null)
    setStack([entry(r)])
  }

  const canBack = stack.length > 1 && stack[stack.length - 1].name !== 'success'
  useBackButton(pop, canBack)

  const buy = (product: string, amount: number, login?: string) => {
    if (TG) return payInBot(product, amount, login)
    const o: Purchase = { id: `o${Date.now()}`, product, amount, at: new Date().toISOString(), login }
    setPurchases(list => [...list, o])
    haptic.success()
    setGhost(null)
    setStack(s => [s[0], entry({ name: 'success', id: o.id })])
  }

  const openCatalog = (c: Category | 'all', search = false) => {
    setCat(c)
    setFocusSearch(search)
    reset({ name: 'catalog' })
  }

  const render = (r: Entry, isTop: boolean) => {
    switch (r.name) {
      case 'home':
        return <Home onProduct={id => push({ name: 'product', id })} onSteam={() => push({ name: 'steam' })} onCatalog={openCatalog} />
      case 'catalog':
        return <Catalog cat={cat} focus={focusSearch} onCat={setCat} onProduct={id => push({ name: 'product', id })} />
      case 'purchases':
        return <Purchases purchases={purchases} onShop={() => openCatalog('all')} />
      case 'profile':
        return <Profile />
      case 'product':
        return <Product product={byId(r.id)} isTop={isTop} onBuy={amount => buy(r.id, amount)} />
      case 'steam':
        return <Steam isTop={isTop} onPay={(amount, login) => buy('steam', amount, login)} />
      case 'success': {
        const o = purchases.find(p => p.id === r.id)
        return o ? <Success purchase={o} onPurchases={() => reset({ name: 'purchases' })} onShop={() => reset({ name: 'home' })} /> : null
      }
    }
  }

  const root = stack[0].name as Tab
  const tabsVisible = stack.length === 1 && !ghost

  return (
    <div className="app">
      {(ghost ? [...stack, ghost] : stack).map((r, i) => {
        const leaving = ghost?.key === r.key
        const isTop = !leaving && i === stack.length - 1
        const cls = leaving ? ' leave' : isTop ? (r.key === entering ? ' enter' : '') : ' under'
        const hidden = !leaving && i < stack.length - 2
        const tabRoot = i === 0 && !leaving && ROOTS.includes(r.name)
        return (
          <main key={r.key} className={`screen${cls}${tabRoot ? '' : ' no-tabs'}`} style={hidden ? { visibility: 'hidden' } : undefined} aria-hidden={!isTop} inert={!isTop}>
            {render(r, isTop)}
          </main>
        )
      })}

      <nav className={`tabbar${tabsVisible ? '' : ' hidden'}`} aria-label="Разделы">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            aria-current={root === t.id ? 'page' : undefined}
            onClick={() => {
              if (root !== t.id) {
                haptic.select()
                if (t.id === 'catalog') setFocusSearch(false)
                reset({ name: t.id })
              }
            }}
          >
            {t.icon}
            {t.name}
          </button>
        ))}
      </nav>

      {!TG && canBack && (
        <button className="web-back" type="button" onClick={pop} aria-label="Назад">
          <CaretLeft size={22} />
          Назад
        </button>
      )}
    </div>
  )
}
