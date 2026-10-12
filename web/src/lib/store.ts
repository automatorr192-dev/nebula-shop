export type Purchase = {
  id: string
  product: string
  amount: number
  at: string
  login?: string
}

const KEY = 'nebula.purchases.v1'

function seed(): Purchase[] {
  const day = 864e5, now = Date.now()
  return [
    { id: 'demo-1', product: 'gpt', amount: 1490, at: new Date(now - 3 * 36e5).toISOString() },
    { id: 'demo-2', product: 'steam', amount: 1000, at: new Date(now - day - 5 * 36e5).toISOString(), login: 'gaben' },
    { id: 'demo-3', product: 'spotify', amount: 299, at: new Date(now - 9 * day).toISOString() },
  ]
}

export function load(): Purchase[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Purchase[]
  } catch {
    /* приватный режим или битые данные: начинаем с демо */
  }
  return seed()
}

export function save(list: Purchase[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* хранилище недоступно: покупки живут до закрытия аппа */
  }
}
