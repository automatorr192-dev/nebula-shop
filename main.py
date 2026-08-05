"""Один контейнер: отдаёт мини-апп и держит бота-лаунчер.

На Amvera тарифицируется каждое приложение, поэтому статика и бот делят процесс —
как в Рентгене. Заодно мини-апп получает https-домен и заголовки кэша, которых нет,
когда статику раздаёт чужой хостинг.
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

import bot as tg

logging.basicConfig(level=logging.INFO)

WEBAPP = os.path.join(os.path.dirname(__file__), "webapp")


async def _supervise_bot():
    while True:
        try:
            await tg.main()
            return
        except asyncio.CancelledError:
            raise
        except Exception:
            logging.exception("бот упал, перезапуск через 5 с")
            await asyncio.sleep(5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_supervise_bot())
    yield
    task.cancel()
    with suppress(asyncio.CancelledError):
        await task


app = FastAPI(title="Nebula", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok"}


class NoCacheStatic(StaticFiles):
    """WebView Telegram кэширует мини-апп намертво, а инвалидации у Telegram нет.
    no-cache не запрещает кэш — он требует сверить ETag, поэтому новая сборка доезжает
    сразу, а трафик почти не растёт."""

    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "no-cache"
        return response


# Монтируем только webapp/: в корне лежат bot.py, requirements и .env — отдавать их наружу
# нельзя ни при каких обстоятельствах.
app.mount("/", NoCacheStatic(directory=WEBAPP, html=True), name="webapp")
