// Бот Nebula: открывает мини-апп и принимает оплату в Telegram Stars.
//
// Мини-апп живёт на GitHub Pages, а Cloudflare из РФ не открывается — поэтому мини-апп
// не зовёт этот Worker напрямую. Кнопка «Купить» открывает чат бота ссылкой
// t.me/бот?start=buy-<товар>-<сумма>, а счёт выставляет бот: цену берёт из каталога,
// с телефона приходят только id товара и номинал.

import type { Message, PreCheckoutQuery, Update } from "@grammyjs/types";
import { PRODUCTS, STEAM } from "../../web/src/lib/data";
import { rub } from "../../web/src/lib/format";

export interface Env {
  DB: D1Database;
  BOT_TOKEN: string;
  WEBHOOK_SECRET: string;
  WEBAPP_URL: string;
  ADMIN_CHAT_ID: string;
}

export type Api = (method: string, payload: Record<string, unknown>) => Promise<any>;

// Магазин демонстрационный, а звёзды настоящие: счёт на одну звезду, и она сразу
// возвращается. Брать деньги за ключи, которые не придут, нельзя.
export const DEMO_STARS = 1;

const WELCOME =
  "<b>Nebula</b> — магазин цифровых товаров.\nИИ-подписки, Steam, ключи и медиа — прямо в Telegram.\n\nНажми кнопку ниже, чтобы открыть приложение 👇";

export interface Order {
  id: number;
  user_id: number;
  product: string;
  title: string;
  amount: number;
  status: "new" | "paid" | "refunded";
}

/** Товар и номинал из ссылки. Цена — только из каталога; чужой номинал не пройдёт. */
export function priced(start: string): { product: string; title: string; amount: number; login?: string } | null {
  const match = /^buy-([a-z0-9]+)-(\d{1,6})(?:-([A-Za-z0-9_]{1,32}))?$/.exec(start);
  if (!match) return null;
  const [, id, raw, login] = match;
  const amount = Number(raw);
  if (id === "steam") {
    const fits = amount >= STEAM.min && amount <= 100_000 && amount % STEAM.step === 0;
    return fits ? { product: id, title: "Пополнение Steam", amount, login } : null;
  }
  const product = PRODUCTS.find((item) => item.id === id);
  if (!product) return null;
  const allowed = product.variants ?? [product.price];
  return allowed.includes(amount) ? { product: id, title: product.name, amount } : null;
}

const say = (api: Api, chatId: number | string, text: string, extra: Record<string, unknown> = {}) =>
  api("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...extra });

async function start(api: Api, env: Env, message: Message, payload: string) {
  const chatId = message.chat.id;
  if (!payload.startsWith("buy-")) {
    await say(api, chatId, WELCOME, {
      reply_markup: { inline_keyboard: [[{ text: "🚀 Открыть магазин", web_app: { url: env.WEBAPP_URL } }]] },
    });
    return;
  }
  const item = priced(payload);
  if (!item) {
    await say(api, chatId, "Такого товара или номинала нет в каталоге. Выберите заново в магазине.");
    return;
  }
  const order = await env.DB.prepare(
    "insert into orders (user_id, product, title, amount, status, created_at) values (?, ?, ?, ?, 'new', ?) returning id",
  )
    .bind(message.from!.id, item.product, item.title, item.amount, Date.now() / 1000)
    .first<{ id: number }>();
  await api("sendInvoice", {
    chat_id: chatId,
    title: item.title,
    description:
      `${item.title}${item.login ? ` для ${item.login}` : ""} на ${rub(item.amount)}. ` +
      "Демо: спишется 1 ⭐ и сразу вернётся, код не придёт.",
    payload: `order:${order!.id}`,
    currency: "XTR",
    prices: [{ label: item.title, amount: DEMO_STARS }],
  });
}

const orderId = (payload: string) => Number(/^order:(\d+)$/.exec(payload)?.[1] ?? 0);

/** Последняя проверка перед списанием: Telegram ждёт ответа 10 секунд. */
async function preCheckout(api: Api, env: Env, query: PreCheckoutQuery) {
  const order = await env.DB.prepare("select * from orders where id = ?")
    .bind(orderId(query.invoice_payload))
    .first<Order>();
  const error = !order || order.user_id !== query.from.id
    ? "Заказ не найден. Оформите покупку заново в магазине."
    : order.status !== "new"
      ? "Этот заказ уже оплачен."
      : query.total_amount !== DEMO_STARS || query.currency !== "XTR"
        ? "Сумма не совпадает с заказом."
        : null;
  await api("answerPreCheckoutQuery", {
    pre_checkout_query_id: query.id,
    ok: error === null,
    ...(error ? { error_message: error } : {}),
  });
}

async function paid(api: Api, env: Env, message: Message) {
  const payment = message.successful_payment!;
  const id = orderId(payment.invoice_payload);
  // Оплаченным заказ становится один раз: второй платёж за него — дубль, и его возвращаем.
  const order = await env.DB.prepare(
    "update orders set status = 'paid', charge_id = ?, paid_at = ? where id = ? and status = 'new' returning *",
  )
    .bind(payment.telegram_payment_charge_id, Date.now() / 1000, id)
    .first<Order>();
  const refunded = await api("refundStarPayment", {
    user_id: message.from!.id,
    telegram_payment_charge_id: payment.telegram_payment_charge_id,
  }).then(
    () => true,
    (error) => (console.error(`звезда не вернулась: ${error}`), false),
  );
  if (!order) {
    await say(api, message.chat.id, "Этот заказ уже был оплачен — повторный платёж вернули.");
    return;
  }
  if (refunded) await env.DB.prepare("update orders set status = 'refunded' where id = ?").bind(id).run();
  await say(
    api,
    message.chat.id,
    `✅ Заказ №${order.id} оплачен: ${order.title}, ${rub(order.amount)}.

` +
      (refunded ? "Это демо: звезда уже вернулась на ваш баланс." : "Это демо: звезду вернём вручную в течение дня.") +
      " В рабочей версии здесь пришёл бы код или ссылка активации.",
  );
  await say(api, env.ADMIN_CHAT_ID, `🛒 Заказ №${order.id}: ${order.title}, ${rub(order.amount)} — оплачен`).catch(() => {});
}

const STATUS: Record<Order["status"], string> = { new: "ждёт оплаты", paid: "оплачен", refunded: "оплачен, звезда возвращена" };

async function orders(api: Api, env: Env, message: Message) {
  const { results } = await env.DB.prepare("select * from orders where user_id = ? order by id desc limit 10")
    .bind(message.from!.id)
    .all<Order>();
  const lines = results.map((order) => `№${order.id} · ${order.title}, ${rub(order.amount)} — ${STATUS[order.status]}`);
  await say(api, message.chat.id, lines.length ? `<b>Мои заказы</b>\n${lines.join("\n")}` : "Заказов пока нет.");
}

export async function handle(update: Update, env: Env, api: Api): Promise<void> {
  if (update.pre_checkout_query) return preCheckout(api, env, update.pre_checkout_query);
  const message = update.message;
  if (!message?.from) return;
  if (message.successful_payment) return paid(api, env, message);
  const [command = "", ...rest] = (message.text ?? "").split(" ");
  if (command === "/orders") return orders(api, env, message);
  await start(api, env, message, command === "/start" ? rest.join(" ").trim() : "");
}

function telegram(token: string): Api {
  return async (method, payload) => {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json<{ ok: boolean; result: unknown; description?: string }>();
    if (!data.ok) throw new Error(`${method}: ${data.description}`);
    return data.result;
  };
}

export default {
  async fetch(request: Request, env: Env) {
    if (
      request.method !== "POST" ||
      request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET
    ) {
      return new Response("Not found", { status: 404 });
    }
    try {
      await handle(await request.json<Update>(), env, telegram(env.BOT_TOKEN));
    } catch (error) {
      console.error(`ошибка в обработчике: ${error}`);
    }
    return new Response("ok");
  },
};
