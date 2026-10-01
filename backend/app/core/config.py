from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    DATABASE_URL: str = "sqlite:///./medikart.db"

    SECRET_KEY: str = "change-this-secret-key-before-deploying"

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    SMTP_SERVER: str = "smtp.gmail.com"

    SMTP_PORT: int = 587

    SMTP_EMAIL: str = ""

    SMTP_PASSWORD: str = ""
    
    OTP_EXPIRE_MINUTES: int = 5
    OTP_MAX_ATTEMPTS: int = 3
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()