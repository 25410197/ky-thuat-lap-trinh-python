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
    postgres_host: str
    postgres_port: int
    postgres_db: str
    postgres_user: str
    postgres_password: str

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


def get_settings() -> Settings:
    return Settings(
        app_name=os.getenv("APP_NAME", "Python Course Backend"),
        app_env=os.getenv("APP_ENV", "development"),
        cors_origins=_cors_origins_from_env(),
        postgres_host=os.getenv("POSTGRES_HOST", "localhost"),
        postgres_port=int(os.getenv("POSTGRES_PORT", "5432")),
        postgres_db=os.getenv("POSTGRES_DB", "app"),
        postgres_user=os.getenv("POSTGRES_USER", "app"),
        postgres_password=os.getenv("POSTGRES_PASSWORD", "app"),
    )
