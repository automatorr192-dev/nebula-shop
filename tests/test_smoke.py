import os

os.environ.setdefault("BOT_TOKEN", "1:test")

from fastapi.testclient import TestClient  # noqa: E402

import bot  # noqa: E402
from main import WEBAPP, app  # noqa: E402

# Без контекстного менеджера TestClient не запускает lifespan — а значит и бота, которому
# в тестах некуда ходить.
client = TestClient(app)


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_webapp_is_served_without_stale_cache():
    response = client.get("/")
    assert response.status_code == 200
    assert "Nebula" in response.text
    assert response.headers["cache-control"] == "no-cache"


def test_only_webapp_folder_is_exposed():
    assert client.get("/bot.py").status_code == 404
    assert client.get("/.env").status_code == 404
    assert os.path.basename(WEBAPP) == "webapp"


def test_webapp_url_carries_version():
    assert "v=" in bot.WEBAPP_URL
