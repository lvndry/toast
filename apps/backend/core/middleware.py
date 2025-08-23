from typing import Awaitable, Callable

import structlog
from fastapi import FastAPI, HTTPException, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from core.jwt import clerk_auth_service

logger = structlog.get_logger(service="auth_middleware")

# Middleware to protect all routes except whitelisted ones
WHITELISTED_ROUTES = {
    "/health",
    "/health/detailed",
    "/health/ready",
    "/health/live",
    "/health/startup",
    "/docs",
    "/openapi.json",
}


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI) -> None:
        super().__init__(app)
        self.logger = structlog.get_logger(service="auth_middleware")

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Middleware to require JWT authentication for all routes except whitelisted ones"""
        self.logger.info(
            "Incoming request",
            method=request.method,
            url=str(request.url),
            path=request.url.path,
        )

        # Skip authentication for whitelisted routes
        if request.url.path in WHITELISTED_ROUTES or request.method == "OPTIONS":
            return await call_next(request)

        # Check for authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            self.logger.warning(
                "Missing or invalid authorization header",
                path=request.url.path,
                method=request.method,
            )
            raise HTTPException(status_code=401, detail="Authorization header required")

        # Extract and verify token
        try:
            token = auth_header.split(" ")[1]
            user_info = await clerk_auth_service.verify_token(token)

            # Add user info to request state for use in route handlers
            request.state.user = user_info

            self.logger.info(
                "User authenticated successfully",
                email=user_info.get("email"),
                user_id=user_info.get("user_id"),
                path=request.url.path,
            )
        except Exception as e:
            self.logger.exception(
                f"Exception during token verification: {str(e)}",
                path=request.url.path,
                method=request.method,
            )
            raise HTTPException(
                status_code=401, detail=f"Invalid token: {str(e)}"
            ) from e

        response = await call_next(request)

        self.logger.info(
            "Request completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
        )

        return response
