import { ArrowRight, MagnifyingGlass } from '@phosphor-icons/react'
import { GiftCard, Logo } from '../components/GiftCard'
import { Chips, NavBar } from '../components/ui'
import { byId, CATEGORIES, FAN, POPULAR, STEAM, type Category } from '../lib/data'
import { rub } from '../lib/format'
import { userName } from '../lib/tg'
import { useHaptic } from '../hooks/useHaptic'

type Props = {
  onProduct: (id: string) => void
  onSteam: () => void
  onCatalog: (cat: Category | 'all', search?: boolean) => void
}

export function Home({ onProduct, onSteam, onCatalog }: Props) {
  const haptic = useHaptic()
  const name = userName()
  const open = (id: string) => {
    haptic.tap()
    onProduct(id)
  }

  const hero = (
    <section className="hero inner">
      <p className="demo-pill">Демо: деньги не списываются</p>
      <h1 className="hero-title">{name === 'Гость' ? 'Подписки и ключи в одном чате' : `${name}, подписки и ключи в одном чате`}</h1>
      <div className="fan">
        {[...FAN].reverse().map((id, i) => {
          const p = byId(id)
          return (
            <button key={id} type="button" className={`fan-card fan-${i}`} onClick={() => open(id)} aria-label={`${p.name}, ${p.variants ? 'от ' : ''}${rub(p.price)}`}>
              <GiftCard brand={p.brand} colors={p.colors} title={p.name} amount={p.price} from={!!p.variants} caption={p.unit} />
            </button>
          )
        })}
      </div>
    </section>
  )

  return (
    <>
      <NavBar title="Nebula" hero={hero} right={<span className="avatar" aria-label={name}>{name[0]}</span>} />

      <div className="inner rise" style={{ ['--i' as string]: 1 }}>
        <button type="button" className="search-pill" onClick={() => onCatalog('all', true)}>
          <MagnifyingGlass size={20} />
          ChatGPT, Steam, Spotify
        </button>
        <Chips label="Категории" items={CATEGORIES.filter(c => c.id !== 'all')} onChange={c => onCatalog(c)} />
      </div>

      <section className="rise" style={{ ['--i' as string]: 2 }}>
        <h2 className="sec-head inner">Популярное</h2>
        <div className="rail">
          {POPULAR.map(id => {
            const p = byId(id)
            return (
              <button key={id} type="button" className="rail-item" onClick={() => open(id)}>
                <GiftCard brand={p.brand} colors={p.colors} title={p.name} amount={p.price} from={!!p.variants} />
                <span className="gi-name">{p.name}</span>
                {p.tag && <span className="tag">{p.tag}</span>}
              </button>
            )
          })}
        </div>
      </section>

      <button type="button" className="steam-banner rise" style={{ ['--i' as string]: 3, ['--c1' as string]: STEAM.colors[0], ['--c2' as string]: STEAM.colors[1] }} onClick={onSteam}>
        <span className="sb-logo">
          <Logo brand="steam" size={26} />
        </span>
        <span className="sb-text">
          <b>Пополнить Steam</b>
          <span>По логину, от {rub(STEAM.min)}, без комиссии</span>
        </span>
        <ArrowRight size={22} />
      </button>
    </>
  )
}
