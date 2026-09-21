from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ---------------------------------------------------------
    # Database
    # ---------------------------------------------------------

    DATABASE_URL: str

    # ---------------------------------------------------------
    # JWT
    # ---------------------------------------------------------

    SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ---------------------------------------------------------
    # Frontend
    # ---------------------------------------------------------

    FRONTEND_URL: str = "http://localhost:5173"

    # ---------------------------------------------------------
    # OTP
    # ---------------------------------------------------------

    OTP_EXPIRE_MINUTES: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()