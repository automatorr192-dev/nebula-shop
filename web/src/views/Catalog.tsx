import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { GiftCard } from '../components/GiftCard'
import { Chips, NavBar } from '../components/ui'
import { CATEGORIES, PRODUCTS, type Category } from '../lib/data'
import { useHaptic } from '../hooks/useHaptic'

type Props = {
  cat: Category | 'all'
  focus: boolean
  onCat: (cat: Category | 'all') => void
  onProduct: (id: string) => void
}

export function Catalog({ cat, focus, onCat, onProduct }: Props) {
  const haptic = useHaptic()
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focus) input.current?.focus()
  }, [focus])

  const q = query.trim().toLowerCase()
  const list = PRODUCTS.filter(p => (cat === 'all' || p.cat === cat) && (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)))

  return (
    <>
      <NavBar title="Каталог" large />

      <div className="inner rise">
        <label className="search">
          <MagnifyingGlass size={20} aria-hidden="true" />
          <input ref={input} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти подписку или ключ" aria-label="Поиск по каталогу" enterKeyHint="search" />
          {query && (
            <button type="button" className="search-clear" aria-label="Очистить поиск" onClick={() => setQuery('')}>
              <X size={18} />
            </button>
          )}
        </label>
        <Chips label="Категория" items={CATEGORIES} value={cat} onChange={onCat} />
      </div>

      {list.length ? (
        <div className="grid inner rise" style={{ ['--i' as string]: 1 }}>
          {list.map(p => (
            <button
              key={p.id}
              type="button"
              className="grid-item"
              onClick={() => {
                haptic.tap()
                onProduct(p.id)
              }}
            >
              <GiftCard brand={p.brand} colors={p.colors} title={p.name} amount={p.price} from={!!p.variants} />
              <span className="gi-name">{p.name}</span>
              <span className="gi-unit">{p.unit}</span>
              {p.tag && <span className="tag">{p.tag}</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="empty inner rise">
          <h2>Ничего не нашли</h2>
          <p>По запросу «{query}» в этой категории пусто. Попробуйте другое название или все категории.</p>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              setQuery('')
              onCat('all')
            }}
          >
            Сбросить поиск
          </button>
        </div>
      )}
    </>
  )
}
