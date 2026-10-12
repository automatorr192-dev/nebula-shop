const nf = new Intl.NumberFormat('ru-RU')

export const rub = (n: number) => `${nf.format(n)} ₽`

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

const hm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export function when(iso: string, now = new Date()) {
  const d = new Date(iso)
  const t = new Date(now)
  if (d.toDateString() === t.toDateString()) return `Сегодня, ${hm(d)}`
  t.setDate(t.getDate() - 1)
  if (d.toDateString() === t.toDateString()) return `Вчера, ${hm(d)}`
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}
