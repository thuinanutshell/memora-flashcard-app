import os
from datetime import timedelta


class BaseConfig:
    """Base configuration with common settings"""

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_RECORD_QUERIES = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_ALGORITHM = "HS256"
    # Default Redis URL
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


class DevelopmentConfig(BaseConfig):
    """Development configuration"""

    DEBUG = True
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DEV_DATABASE_URI", "sqlite:///development.db")
    JWT_SECRET_KEY = os.getenv("DEV_JWT_SECRET_KEY", "dev-secret-change-in-production")
    REDIS_URL = os.getenv("DEV_REDIS_URL", "redis://localhost:6379/1")


class ProductionConfig(BaseConfig):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.getenv("PROD_DATABASE_URI", "sqlite:///production.db")
    JWT_SECRET_KEY = os.getenv("PROD_JWT_SECRET_KEY")
    REDIS_URL = os.getenv("PROD_REDIS_URL", "redis://localhost:6379/0")

    @classmethod
    def init_app(cls, app):
        BaseConfig.init_app(app)

        # Validate critical production settings
        required_vars = ["PROD_JWT_SECRET_KEY", "PROD_DATABASE_URI"]
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(
                f"Missing required production environment variables: {missing}"
            )


class TestingConfig(BaseConfig):
    """Testing configuration"""

    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-jwt-secret-key-123"
    REDIS_URL = "redis://localhost:6379/2"
    WTF_CSRF_ENABLED = False
