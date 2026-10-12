import type { Brand } from './logos'

export type Category = 'ai' | 'media' | 'keys' | 'steam'

export type Product = {
  id: string
  brand: Brand
  cat: Category
  name: string
  unit: string
  price: number
  desc: string
  checks: string[]
  colors: [string, string]
  tag?: string
  variants?: number[]
}

export const CATEGORIES: { id: Category | 'all'; name: string }[] = [
  { id: 'all', name: 'Все' },
  { id: 'ai', name: 'ИИ' },
  { id: 'media', name: 'Медиа' },
  { id: 'keys', name: 'Ключи' },
  { id: 'steam', name: 'Steam' },
]

export const PRODUCTS: Product[] = [
  {
    id: 'gpt',
    brand: 'openai',
    cat: 'ai',
    name: 'ChatGPT Plus',
    unit: 'подписка на месяц',
    price: 1490,
    tag: 'Хит',
    colors: ['#10a37f', '#0b4d3c'],
    desc: 'Полный доступ к GPT-5, продвинутому голосу и генерации изображений. Активируем на ваш аккаунт.',
    checks: ['GPT-5 и o-модели', 'Приоритет в часы пик', 'Генерация картинок'],
  },
  {
    id: 'claude',
    brand: 'claude',
    cat: 'ai',
    name: 'Claude Pro',
    unit: 'подписка на месяц',
    price: 1590,
    colors: ['#d97757', '#6e3220'],
    desc: 'Claude Pro от Anthropic: увеличенные лимиты, приоритетный доступ и работа с большими документами.',
    checks: ['В 5 раз больше сообщений', 'Модель Opus', 'Projects и артефакты'],
  },
  {
    id: 'gemini',
    brand: 'gemini',
    cat: 'ai',
    name: 'Gemini Advanced',
    unit: 'подписка на месяц',
    price: 1690,
    colors: ['#4f8bff', '#5b2fc9'],
    desc: 'Gemini Advanced с самой мощной моделью Google и 2 ТБ в Google One.',
    checks: ['Топ-модель Google', '2 ТБ хранилища', 'Интеграция с Docs'],
  },
  {
    id: 'mj',
    brand: 'midjourney',
    cat: 'ai',
    name: 'Midjourney',
    unit: 'подписка на месяц',
    price: 2290,
    tag: 'Арт',
    colors: ['#a8adb8', '#2c3038'],
    desc: 'Генерация изображений уровня студии. Оформим Standard-план с быстрыми часами.',
    checks: ['15 ч Fast GPU', 'Коммерческая лицензия', 'Скрытый режим'],
  },
  {
    id: 'spotify',
    brand: 'spotify',
    cat: 'media',
    name: 'Spotify Premium',
    unit: 'подписка на месяц',
    price: 299,
    tag: '−40%',
    colors: ['#1ed760', '#0a5a2b'],
    desc: 'Музыка без рекламы, офлайн и в высоком качестве. Активация на ваш аккаунт.',
    checks: ['Без рекламы', 'Офлайн-режим', 'Звук 320 kbps'],
  },
  {
    id: 'yt',
    brand: 'youtube',
    cat: 'media',
    name: 'YouTube Premium',
    unit: 'подписка на месяц',
    price: 399,
    colors: ['#ff4d4d', '#6b1010'],
    desc: 'YouTube и Music без рекламы, фоновое воспроизведение и загрузки.',
    checks: ['Без рекламы', 'Фоном и офлайн', 'YouTube Music'],
  },
  {
    id: 'netflix',
    brand: 'netflix',
    cat: 'media',
    name: 'Netflix 4K',
    unit: 'подписка на месяц',
    price: 899,
    colors: ['#e50914', '#4a070b'],
    desc: 'Тариф Premium: 4K HDR, 4 экрана одновременно.',
    checks: ['4K UHD и HDR', '4 экрана', 'Без рекламы'],
  },
  {
    id: 'tgp',
    brand: 'telegram',
    cat: 'media',
    name: 'Telegram Premium',
    unit: 'подписка на месяц',
    price: 349,
    tag: 'Хит',
    colors: ['#2aabee', '#6a3df0'],
    desc: 'Все премиум-возможности Telegram: лимиты ×2, стикеры, скорость загрузки, эксклюзивы.',
    checks: ['Лимиты ×2', 'Премиум-стикеры', 'Без рекламы'],
  },
  {
    id: 'steamgift',
    brand: 'steam',
    cat: 'steam',
    name: 'Steam Gift Card',
    unit: 'номинал на выбор',
    price: 500,
    colors: ['#66c0f4', '#1b2838'],
    desc: 'Пополните любой аккаунт Steam подарочной картой. Приходит кодом сразу после оплаты.',
    checks: ['Код сразу', 'Любой регион', 'Не сгорает'],
    variants: [500, 1000, 2000, 5000],
  },
  {
    id: 'psn',
    brand: 'playstation',
    cat: 'keys',
    name: 'PlayStation Store',
    unit: 'гифт-карта',
    price: 1000,
    colors: ['#2f7de1', '#0a2160'],
    desc: 'Пополнение кошелька PS Store кодом. Регион RU, TR или UA на выбор.',
    checks: ['Код сразу', 'RU, TR, UA', 'Игры и подписки'],
    variants: [1000, 2500, 5000],
  },
  {
    id: 'xbox',
    brand: 'xbox',
    cat: 'keys',
    name: 'Xbox Game Pass',
    unit: 'подписка на месяц',
    price: 599,
    tag: 'Топ',
    colors: ['#4bb34b', '#0e3a10'],
    desc: 'Game Pass Ultimate: сотни игр, EA Play и облачный гейминг.',
    checks: ['300+ игр', 'Облачный гейминг', 'EA Play в комплекте'],
  },
]

export const byId = (id: string) => PRODUCTS.find(p => p.id === id)!

export const FAN = ['gpt', 'tgp', 'steamgift']
export const POPULAR = ['gpt', 'claude', 'tgp', 'spotify', 'xbox', 'yt']

export const STEAM = { brand: 'steam' as Brand, colors: ['#66c0f4', '#1b2838'] as [string, string], presets: [300, 500, 1000, 2000, 5000], min: 100, step: 100 }
