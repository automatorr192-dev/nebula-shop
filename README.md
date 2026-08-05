# Nebula — магазин цифровых товаров в Telegram

![CI](https://github.com/automatorr192-dev/nebula-shop/actions/workflows/ci.yml/badge.svg)

Витрина ИИ-подписок, игровых ключей и медиа, которая живёт внутри Telegram: каталог, карточка
товара, корзина и оплата — без единого перехода в браузер.

## Как работает

```
/start → бот отдаёт кнопку WebApp → мини-апп открывается в Telegram
       → каталог, корзина, MainButton «Оплатить»
```

Сейчас мини-апп раздаёт GitHub Pages, бот запускается отдельно. Целевая схема — один
контейнер на оба: FastAPI отдаёт статику мини-аппа, бот-лаунчер живёт фоновой задачей в его
`lifespan`. Так сделано потому, что на Amvera тарифицируется каждое приложение отдельно, и
разносить витрину с ботом по двум сервисам — платить дважды. Код готов, переезд = сменить
`WEBAPP_URL` и выключить workflow Pages.

Что здесь неочевидного:

- **Кэш мини-аппа не сбрасывается.** WebView Telegram держит старую сборку, а API инвалидации
  у Telegram нет. Поэтому адрес мини-аппа несёт метку версии (`?v=`), а статика отдаётся с
  `Cache-Control: no-cache` — браузер сверяет ETag и забирает свежее.
- **Наружу смонтирована только `webapp/`**, не корень: рядом лежат `bot.py` и `.env`.
- **Оплата в проде уходит на внешнюю онлайн-кассу по ссылке.** Сумму считает сервер — цена с
  фронта не является источником истины.

## Стек

Python 3.11 · aiogram 3 · FastAPI · Docker · GitHub Actions · Amvera

## Запуск

```bash
cp .env.example .env    # BOT_TOKEN и WEBAPP_URL
docker compose up --build
```

Без Docker:

```bash
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
uvicorn main:app --reload
```

Мини-апп открывается и просто в браузере — в этом случае методы Telegram подменяются
заглушками, чтобы верстку можно было отлаживать без телефона.

## Тесты

```bash
ruff check . && pytest -q
```
