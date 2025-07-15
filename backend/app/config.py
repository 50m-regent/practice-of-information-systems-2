from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "sqlite:///./db.sqlite3"
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    otp_expire_minutes: int = 10
    email_address: str
    email_password: str
    # email_address: str = "dummy@example.com"
    # email_password: str = "dummy_password"
    openai_api_key: str

    class Config:
        env_file = ".env"

settings = Settings()