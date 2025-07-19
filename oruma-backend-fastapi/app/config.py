from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://oruma_user:oruma_password@localhost:5432/oruma_db"
    DATABASE_POOL_SIZE: int = 20
    
    # Authentication
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 3333
    API_DEBUG: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    FILE_MAX_SIZE_MB: int = 10
    
    # External APIs
    UNIVERSITIES_API_URL: str = "http://universities.hipolabs.com"
    UNIVERSITIES_API_TIMEOUT: int = 10
    
    # Redis (optional)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10
    
    # Computed properties
    @property
    def UPLOAD_PATH(self) -> str:
        return os.path.abspath(self.UPLOAD_DIR)
    
    @property
    def MAX_FILE_SIZE_BYTES(self) -> int:
        return self.FILE_MAX_SIZE_MB * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()