from typing import Any, cast

import httpx
import structlog
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from models.clerkUser import ClerkUser

from core.config import settings

logger = structlog.get_logger(service="jwt")

# Security scheme for token extraction
security = HTTPBearer(auto_error=False)


class ClerkAuthService:
    """Service to handle Clerk JWT token authentication"""

    def __init__(self) -> None:
        self.jwks: dict[str, Any] | None = None
        self.jwks_url = settings.security.clerk_jwks_url

    async def get_jwks(self) -> dict[str, Any]:
        """Fetch JWKS from Clerk"""
        if self.jwks is None:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(self.jwks_url)
                    response.raise_for_status()
                    self.jwks = response.json()
            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=500, detail=f"Failed to fetch JWKS: {str(e)}"
                ) from e
        return self.jwks

    async def verify_token(self, token: str) -> dict[str, Any]:
        """Verify JWT token and return payload"""
        try:
            # Get JWKS
            jwks = await self.get_jwks()

            # Decode token header to get key ID
            unverified_header = jwt.get_unverified_header(token)
            key_id = unverified_header.get("kid")

            if not key_id:
                raise HTTPException(
                    status_code=401, detail="Invalid token: missing key ID"
                ) from None

            # Find the correct key
            key = None
            for jwk in jwks.get("keys", []):
                if jwk.get("kid") == key_id:
                    key = jwk
                    break

            if not key:
                raise HTTPException(
                    status_code=401, detail="Invalid token: key not found"
                ) from None

            try:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=["RS256"],
                    options={
                        "verify_signature": True,
                        "verify_aud": False,
                        "verify_iss": False,
                    },
                )
            except Exception as e:
                logger.exception(f"Failed to decode token: {e}")
                raise HTTPException(
                    status_code=401, detail=f"Invalid token: {str(e)}"
                ) from e

            return payload

        except JWTError as e:
            raise HTTPException(
                status_code=401, detail=f"Invalid token: {str(e)}"
            ) from e
        except Exception as e:
            raise HTTPException(
                status_code=401, detail=f"Token verification failed: {str(e)}"
            ) from e

    async def extract_user_info(
        self, credentials: HTTPAuthorizationCredentials | None = None
    ) -> ClerkUser:
        """Extract user information from Clerk token and return ClerkUser object"""
        if not credentials:
            raise HTTPException(status_code=401, detail="Authorization header required")

        token = credentials.credentials
        payload = await self.verify_token(token)

        # Extract user information from payload
        # user information
        user_id = payload.get("sub") or payload.get("id")
        email = payload.get("email")
        name = payload.get("name")

        if not user_id:
            raise HTTPException(
                status_code=401, detail="Invalid token: missing user ID"
            )

        return ClerkUser(
            user_id=cast(str, user_id),
            email=cast(str, email),
            name=cast(str, name),
        )


# Singleton instance
clerk_auth_service = ClerkAuthService()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> ClerkUser:
    """Dependency to get current authenticated user"""
    return await clerk_auth_service.extract_user_info(credentials)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> ClerkUser | None:
    """Dependency to get current user if authenticated, None otherwise"""
    try:
        if credentials:
            return await clerk_auth_service.extract_user_info(credentials)
    except HTTPException:
        return None
    return None
