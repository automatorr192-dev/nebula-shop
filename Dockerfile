# Мини-апп собирается на Node, а в образ попадает только готовая статика: FastAPI
# раздаёт webapp/ и держит бота в том же процессе.
FROM node:22-slim AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1     PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=web /webapp ./webapp

RUN useradd --create-home app && chown -R app /app
USER app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
