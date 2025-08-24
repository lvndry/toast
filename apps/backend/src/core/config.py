import os
from enum import Enum
from functools import lru_cache

import structlog
from dotenv import load_dotenv

load_dotenv()

logger = structlog.get_logger(service="config")


class StorageType(Enum):
    """Storage type enumeration"""

    LOCAL = "local"
    REMOTE = "remote"


class AppConfig:
    """Application configuration"""

    def __init__(self) -> None:
        self.name: str = "Toast AI"
        self.version: str = "0.1.0"
        self.env: str = os.getenv("ENVIRONMENT", "development")
        self.port: int = int(os.getenv("PORT", "8000"))
        self.debug: bool = False

    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.debug or self.env.lower() == "development"


class DatabaseConfig:
    """Database configuration"""

    def __init__(self) -> None:
        self.mongodb_uri: str = os.getenv("MONGO_URI") or ""
        self.mongodb_ssl_ca_certs: str | None = os.getenv("MONGODB_SSL_CA_CERTS")
        self.mongodb_ssl_certfile: str | None = os.getenv("MONGODB_SSL_CERTFILE")
        self.mongodb_ssl_keyfile: str | None = os.getenv("MONGODB_SSL_KEYFILE")

        if self.mongodb_uri is None:
            raise ValueError("MONGO_URI is not set")

    @property
    def database_url(self) -> str | None:
        """Get the database URL with fallback"""
        return self.mongodb_uri or None


class SecurityConfig:
    """Security configuration"""

    def __init__(self) -> None:
        self.clerk_jwks_url: str = os.getenv(
            "CLERK_JWKS_URL",
            "https://calm-squid-68.clerk.accounts.dev/.well-known/jwks.json",
        )


class CorsConfig:
    """CORS configuration"""

    def __init__(self) -> None:
        cors_origins_env = os.getenv("CORS_ORIGINS", "*")

        # In production, we should not allow "*" for security
        env: str = os.getenv("ENVIRONMENT", "development")
        if env.lower() == "production" and cors_origins_env == "*":
            logger.warning("CORS_ORIGINS is set to '*' in production - this is a security risk!")
            self.origins = ["*"]
        else:
            self.origins = cors_origins_env.split(",") if cors_origins_env != "*" else ["*"]

        self.methods: list[str] = ["*"]
        self.headers: list[str] = ["*"]
        self.credentials: bool = True

    def __str__(self) -> str:
        """String representation of CORS configuration"""
        return f"CorsConfig(origins={self.origins}, methods={self.methods}, headers={self.headers}, credentials={self.credentials})"

    @property
    def is_secure(self) -> bool:
        """Check if CORS configuration is secure for production"""
        if settings.app.env.lower() == "production":
            return "*" not in self.origins and len(self.origins) > 0
        return True


class ApiConfig:
    """API configuration"""

    def __init__(self) -> None:
        self.v1_prefix: str = ""


class EmbeddingConfig:
    """Embedding configuration"""

    def __init__(self) -> None:
        # Maximum text size for embedding (4MB limit with buffer)
        self.max_text_size_bytes: int = int(os.getenv("EMBEDDING_MAX_TEXT_SIZE_BYTES", "3500000"))
        # Batch size for processing chunks
        self.batch_size: int = int(os.getenv("EMBEDDING_BATCH_SIZE", "50"))
        # Pinecone upsert batch size
        self.upsert_batch_size: int = int(os.getenv("EMBEDDING_UPSERT_BATCH_SIZE", "100"))
        # Chunk size for text splitting
        self.chunk_size: int = int(os.getenv("EMBEDDING_CHUNK_SIZE", "1200"))
        # Chunk overlap for text splitting
        self.chunk_overlap: int = int(os.getenv("EMBEDDING_CHUNK_OVERLAP", "200"))


class TrackingConfig:
    """Tracking configuration"""

    def __init__(self) -> None:
        self.posthog_api_key: str | None = os.getenv("POSTHOG_API_KEY")
        self.posthog_host: str = os.getenv("POSTHOG_HOST", "https://us.i.posthog.com")
        self.tracking_enabled: bool = self._is_tracking_enabled()

    def _is_tracking_enabled(self) -> bool:
        """Check if tracking is enabled based on environment variables"""
        # Check if tracking is explicitly disabled
        tracking_enabled_env = os.getenv("TRACKING_ENABLED", "true").lower()
        if tracking_enabled_env in ("false", "0", "no"):
            return False

        # Check if PostHog API key is available
        return self.posthog_api_key is not None


class Settings:
    """Application settings with nested configuration objects"""

    def __init__(self) -> None:
        self.app = AppConfig()
        self.database = DatabaseConfig()
        self.security = SecurityConfig()
        self.cors = CorsConfig()
        self.api = ApiConfig()
        self.embedding = EmbeddingConfig()
        self.tracking = TrackingConfig()

        logger.info(f"Tracking enabled: {self.tracking.tracking_enabled}")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
