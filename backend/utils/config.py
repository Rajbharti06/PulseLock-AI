from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "anthropic/claude-haiku-4-5"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    DATABASE_URL: str = "sqlite+aiosqlite:///./pulselock.db"
    ALERT_WEBHOOK_URL: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
