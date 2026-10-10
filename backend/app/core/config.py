import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
# Load .env file from backend root if present
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Multi-Language Code Translator"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENV: str = os.getenv("ENV", "development")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-production-quality-key-replace-in-env-99238472938472")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'translator.db'}")
    
    # AI Provider configuration
    # Default provider: 'openai', 'ollama', or 'rule_based'
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "openai")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "codellama")
    
    REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "45"))
    MAX_SOURCE_CODE_SIZE_BYTES: int = int(os.getenv("MAX_SOURCE_CODE_SIZE_BYTES", "100000")) # 100 KB
    
    # Sandbox / Execution
    ENABLE_SANDBOX: bool = os.getenv("ENABLE_SANDBOX", "false").lower() in ("true", "1", "yes")
    EXECUTION_TIMEOUT_SECONDS: int = int(os.getenv("EXECUTION_TIMEOUT_SECONDS", "5"))
    EXECUTION_MEMORY_LIMIT_MB: int = int(os.getenv("EXECUTION_MEMORY_LIMIT_MB", "128"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
