from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "backend"}


def test_swagger_and_openapi_are_available() -> None:
    docs_response = client.get("/docs")
    openapi_response = client.get("/openapi.json")

    assert docs_response.status_code == 200
    assert openapi_response.status_code == 200
    assert "/api/health" in openapi_response.json()["paths"]


def test_health_check_db() -> None:
    response = client.get("/api/health/db")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "postgresql"}


def test_cors_allows_default_react_origins() -> None:
    for origin in ("http://localhost:3000", "http://localhost:5173"):
        response = client.options(
            "/api/health",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
            },
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == origin
