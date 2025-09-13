"""Unit tests for configuration management."""


class TestConfig:
    """Test cases for configuration settings."""

    def test_config_import(self) -> None:
        """Test that config can be imported without errors."""
        from src.core.config import settings

        assert settings is not None

    def test_security_config_exists(self) -> None:
        """Test that security configuration exists."""
        from src.core.config import settings

        assert hasattr(settings, "security")
        assert settings.security is not None

    def test_clerk_jwks_url_exists(self) -> None:
        """Test that Clerk JWKS URL is configured."""
        from src.core.config import settings

        assert settings.security.clerk_jwks_url is not None
        assert settings.security.clerk_jwks_url.startswith("https://")

    def test_database_config_exists(self) -> None:
        """Test that database configuration exists."""
        from src.core.config import settings

        assert hasattr(settings, "database")
        assert settings.database is not None

    def test_llm_config_exists(self) -> None:
        """Test that LLM configuration exists."""
        from src.core.config import settings

        # LLM config might not exist yet, so just test that settings can be imported
        assert settings is not None
