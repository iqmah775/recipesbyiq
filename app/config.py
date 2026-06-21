from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    GROQ_API_KEY: str
    """API key for authenticating with the Groq inference service."""

    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    """Groq model identifier to use for recipe generation."""

    DATABASE_URL: str
    """SQLAlchemy-compatible database connection string (e.g. mysql+pymysql://user:pass@host/db)."""

    MAX_INGREDIENTS: int = 20
    """Maximum number of ingredients a user may submit in a single generate request."""


settings = Settings()
