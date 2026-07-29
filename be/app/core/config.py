import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()

DEFAULT_CORS_ORIGINS = (
    "http://localhost:3000",
    "http://localhost:5173",
)


def _cors_origins_from_env() -> tuple[str, ...]:
    raw_origins = os.getenv("CORS_ORIGINS")
    if not raw_origins:
        return DEFAULT_CORS_ORIGINS

    return tuple(origin.strip() for origin in raw_origins.split(",") if origin.strip())


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_env: str
    cors_origins: tuple[str, ...]


def get_settings() -> Settings:
    return Settings(
        app_name=os.getenv("APP_NAME", "Python Course Backend"),
        app_env=os.getenv("APP_ENV", "development"),
        cors_origins=_cors_origins_from_env(),
    )
