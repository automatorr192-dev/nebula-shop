import asyncio
import logging
import os
import time

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import (
    BotCommand,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    Message,
    WebAppInfo,
)
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)

BASE_URL = os.environ.get("WEBAPP_URL", "https://automatorr192-dev.github.io/nebula-shop/")
# WebView Telegram кэширует мини-апп намертво, а сбросить этот кэш извне нельзя. Метка
# версии в адресе — единственный рабочий способ показать людям свежую сборку.
VERSION = os.environ.get("WEBAPP_VERSION") or str(int(time.time()))
WEBAPP_URL = f"{BASE_URL}{'&' if '?' in BASE_URL else '?'}v={VERSION}"

dp = Dispatcher()

# Видно в пустом чате ещё до нажатия «Начать» — единственный шанс объяснить, зачем бот.
DESCRIPTION = (
    "Nebula — магазин цифровых товаров прямо в Telegram.\n\n"
    "ИИ-подписки, пополнение Steam, игровые ключи и медиасервисы. Каталог, корзина "
    "и оформление живут внутри приложения — ставить ничего не нужно, из чата не выходишь.\n\n"
    "Нажми «Начать», чтобы открыть магазин."
)
SHORT_DESCRIPTION = (
    "Магазин цифровых товаров в Telegram: ИИ-подписки, Steam, ключи и медиа."
)


def shop_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Открыть магазин", web_app=WebAppInfo(url=WEBAPP_URL))]
        ]
    )


@dp.message(CommandStart())
async def start(message: Message):
    await message.answer(
        "<b>Nebula</b> — магазин цифровых товаров.\n"
        "ИИ-подписки, Steam, ключи и медиа — прямо в Telegram.\n\n"
        "Нажми кнопку ниже, чтобы открыть приложение 👇",
        reply_markup=shop_kb(),
    )


async def main():
    bot = Bot(
        os.environ["BOT_TOKEN"],
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    await bot.set_my_commands([BotCommand(command="start", description="Открыть магазин")])
    await bot.set_my_description(description=DESCRIPTION)
    await bot.set_my_short_description(short_description=SHORT_DESCRIPTION)
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(text="Магазин", web_app=WebAppInfo(url=WEBAPP_URL))
    )
    try:
        await dp.start_polling(bot, drop_pending_updates=True)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
