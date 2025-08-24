"""Custom exception classes for backend services."""


class NotFoundError(Exception):
    """Base class for not-found errors across services."""


class CompanyNotFoundError(NotFoundError):
    """Raised when a company cannot be found by id or slug."""

    def __init__(self, *, company_id: str | None = None, slug: str | None = None):
        if company_id is not None:
            message = f"Company with id {company_id} not found"
        elif slug is not None:
            message = f"Company with slug {slug} not found"
        else:
            message = "Company not found"
        super().__init__(message)
