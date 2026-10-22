import type { Update } from "@grammyjs/types";
import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { rub } from "../../web/src/lib/format";
import { DEMO_STARS, handle, priced, type Api } from "../src/index";

const POLINA = { id: 42, is_bot: false, first_name: "Полина" };
const CHAT = { id: 42, type: "private" as const, first_name: "Полина" };

function telegram() {
  const calls: { method: string; payload: any }[] = [];
  const api: Api = async (method, payload) => {
    calls.push({ method, payload });
    return true;
  };
  const sent = (chatId: number | string) =>
    calls.filter((c) => c.method === "sendMessage" && String(c.payload.chat_id) === String(chatId));
  return { api, calls, sent, last: (method: string) => calls.filter((c) => c.method === method).at(-1)?.payload };
}

const text = (value: string, from = POLINA) =>
  ({ update_id: 1, message: { message_id: 1, date: 1, chat: CHAT, from, text: value } }) as Update;

const checkout = (payload: string, from = POLINA, total = DEMO_STARS) =>
  ({
    update_id: 2,
    pre_checkout_query: { id: "q", from, currency: "XTR", total_amount: total, invoice_payload: payload },
  }) as Update;

const payment = (payload: string, charge = "charge-1") =>
  ({
    update_id: 3,
    message: {
      message_id: 2,
      date: 1,
      chat: CHAT,
      from: POLINA,
      successful_payment: {
        currency: "XTR",
        total_amount: DEMO_STARS,
        invoice_payload: payload,
        telegram_payment_charge_id: charge,
        provider_payment_charge_id: "",
      },
    },
  }) as Update;

async function invoice(tg: ReturnType<typeof telegram>, link = "buy-gpt-1490") {
  await handle(text(`/start ${link}`), env, tg.api);
  return tg.last("sendInvoice");
}

describe("цена только из каталога", () => {
  it("товар по своей цене и номинал из списка проходят", () => {
    expect(priced("buy-gpt-1490")).toMatchObject({ product: "gpt", title: "ChatGPT Plus", amount: 1490 });
    expect(priced("buy-psn-2500")).toMatchObject({ amount: 2500 });
    expect(priced("buy-steam-700-gaben_1")).toMatchObject({ amount: 700, login: "gaben_1" });
  });

  it("подменённая сумма, чужой номинал и выдуманный товар не проходят", () => {
    expect(priced("buy-gpt-1")).toBeNull();
    expect(priced("buy-psn-3000")).toBeNull();
    expect(priced("buy-steam-50")).toBeNull();
    expect(priced("buy-steam-750")).toBeNull();
    expect(priced("buy-iphone-100")).toBeNull();
    expect(priced("buy-gpt-1490; drop table orders")).toBeNull();
  });
});

describe("покупка", () => {
  it("целиком: счёт в звёздах, проверка, оплата, возврат звезды, уведомление продавцу", async () => {
    const tg = telegram();
    const bill = await invoice(tg);
    expect(bill).toMatchObject({ currency: "XTR", prices: [{ amount: DEMO_STARS }], payload: expect.stringMatching(/^order:\d+$/) });
    expect(bill.description).toContain(rub(1490));

    await handle(checkout(bill.payload), env, tg.api);
    expect(tg.last("answerPreCheckoutQuery")).toMatchObject({ ok: true });

    await handle(payment(bill.payload), env, tg.api);
    expect(tg.last("refundStarPayment")).toEqual({ user_id: 42, telegram_payment_charge_id: "charge-1" });
    expect(tg.sent(42).at(-1)!.payload.text).toContain("оплачен");
    expect(tg.sent(env.ADMIN_CHAT_ID)).toHaveLength(1);

    const order = await env.DB.prepare("select status from orders").first<{ status: string }>();
    expect(order!.status).toBe("refunded");
  });

  it("оплаченный заказ второй раз не оплатить, а повторный платёж возвращается", async () => {
    const tg = telegram();
    const bill = await invoice(tg);
    await handle(checkout(bill.payload), env, tg.api);
    await handle(payment(bill.payload), env, tg.api);

    await handle(checkout(bill.payload), env, tg.api);
    expect(tg.last("answerPreCheckoutQuery")).toMatchObject({ ok: false, error_message: "Этот заказ уже оплачен." });

    await handle(payment(bill.payload, "charge-2"), env, tg.api);
    expect(tg.last("refundStarPayment")).toMatchObject({ telegram_payment_charge_id: "charge-2" });
    expect(tg.sent(42).at(-1)!.payload.text).toContain("повторный платёж вернули");
    expect(tg.sent(env.ADMIN_CHAT_ID)).toHaveLength(1);
  });

  it("чужой заказ и неверная сумма отклоняются до списания", async () => {
    const tg = telegram();
    const bill = await invoice(tg);
    await handle(checkout(bill.payload, { ...POLINA, id: 7 }), env, tg.api);
    expect(tg.last("answerPreCheckoutQuery")).toMatchObject({ ok: false });
    await handle(checkout(bill.payload, POLINA, 500), env, tg.api);
    expect(tg.last("answerPreCheckoutQuery")).toMatchObject({ ok: false, error_message: "Сумма не совпадает с заказом." });
  });

  it("если звезду не вернуть, человек узнаёт об этом, а заказ остаётся оплаченным", async () => {
    const tg = telegram();
    const bill = await invoice(tg);
    const failing: Api = (method, payload) =>
      method === "refundStarPayment" ? Promise.reject(new Error("CHARGE_NOT_FOUND")) : tg.api(method, payload);
    await handle(payment(bill.payload), env, failing);
    expect(tg.sent(42).at(-1)!.payload.text).toContain("вернём вручную");
    const order = await env.DB.prepare("select status from orders").first<{ status: string }>();
    expect(order!.status).toBe("paid");
  });

  it("ссылка на несуществующий товар — понятный ответ без счёта", async () => {
    const tg = telegram();
    await handle(text("/start buy-gpt-1"), env, tg.api);
    expect(tg.last("sendInvoice")).toBeUndefined();
    expect(tg.sent(42).at(-1)!.payload.text).toContain("нет в каталоге");
  });
});

describe("бот", () => {
  it("на старт открывает магазин кнопкой мини-аппа", async () => {
    const tg = telegram();
    await handle(text("/start"), env, tg.api);
    expect(tg.sent(42)[0].payload.reply_markup.inline_keyboard[0][0].web_app.url).toBe(env.WEBAPP_URL);
  });

  it("«Мои заказы» показывают статус каждого заказа", async () => {
    const tg = telegram();
    const bill = await invoice(tg);
    await invoice(tg, "buy-psn-1000");
    await handle(checkout(bill.payload), env, tg.api);
    await handle(payment(bill.payload), env, tg.api);

    await handle(text("/orders"), env, tg.api);
    const list = tg.sent(42).at(-1)!.payload.text;
    expect(list).toContain(`ChatGPT Plus, ${rub(1490)} — оплачен, звезда возвращена`);
    expect(list).toContain("ждёт оплаты");
  });
});
