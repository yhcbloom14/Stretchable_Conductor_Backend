# app/config.py
from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path
import os


class Settings(BaseSettings):
     # env type
    ENV: str = "dev"

    # CORS config
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    ALLOW_CREDENTIALS: bool = True
    ALLOW_METHODS: List[str] = ["*"]
    ALLOW_HEADERS: List[str] = ["*"]
    
    # host config
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    RELOAD: bool = True
    TITLE: str = "Multi-Model Prediction API"
    VERSION: str = "v1"

    class Config:
        env_file = Path(__file__).parent / f".env.{os.getenv('ENV', 'dev')}"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
