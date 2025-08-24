"""User service for managing user operations."""

from datetime import datetime
from typing import ClassVar

from core.logging import get_logger
from src.services.base_service import BaseService
from src.user import User

logger = get_logger(__name__)


class UserService(BaseService):
    """Service for user-related database operations."""

    _instance: ClassVar["UserService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def upsert_user(self, user: User) -> User:
        """Create or update a user in the database."""
        try:
            existing = await self.db.users.find_one({"id": user.id})
            now = datetime.now()
            doc = user.model_dump(mode="json")
            doc["updated_at"] = now

            if existing:
                await self.db.users.update_one({"id": user.id}, {"$set": doc})
                logger.info(f"Updated user {user.id}")
            else:
                doc["created_at"] = now
                await self.db.users.insert_one(doc)
                logger.info(f"Created user {user.id}")

            return user
        except Exception as e:
            logger.error(f"Error upserting user {user.id}: {e}")
            raise e

    async def get_user_by_id(self, user_id: str) -> User | None:
        """Get a user by their ID."""
        try:
            doc = await self.db.users.find_one({"id": user_id})
            return User(**doc) if doc else None
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None

    async def get_user_by_email(self, email: str) -> User | None:
        """Get a user by their email."""
        try:
            doc = await self.db.users.find_one({"email": email})
            return User(**doc) if doc else None
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            return None

    async def delete_user(self, user_id: str) -> bool:
        """Delete a user from the database."""
        try:
            result = await self.db.users.delete_one({"id": user_id})
            success = result.deleted_count > 0
            if success:
                logger.info(f"Deleted user {user_id}")
            else:
                logger.warning(f"No user found with id {user_id} to delete")
            return success
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            raise e

    async def set_user_onboarding_completed(self, user_id: str) -> bool:
        """Mark a user's onboarding as completed."""
        try:
            now = datetime.now()
            result = await self.db.users.update_one(
                {"id": user_id},
                {"$set": {"onboarding_completed": True, "updated_at": now}},
                upsert=False,
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Marked onboarding completed for user {user_id}")
            else:
                logger.warning(f"No user found with id {user_id} to update onboarding")
            return success
        except Exception as e:
            logger.error(f"Error updating onboarding for user {user_id}: {e}")
            raise e

    async def get_all_users(self) -> list[User]:
        """Get all users from the database."""
        try:
            users = await self.db.users.find().to_list(length=None)
            return [User(**user) for user in users]
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            raise e

    async def update_user_profile(self, user_id: str, profile_data: dict) -> bool:
        """Update a user's profile information."""
        try:
            now = datetime.now()
            profile_data["updated_at"] = now

            result = await self.db.users.update_one(
                {"id": user_id},
                {"$set": profile_data},
                upsert=False,
            )
            success = result.modified_count > 0
            if success:
                logger.info(f"Updated profile for user {user_id}")
            else:
                logger.warning(f"No user found with id {user_id} to update profile")
            return success
        except Exception as e:
            logger.error(f"Error updating profile for user {user_id}: {e}")
            raise e


# Global instance
user_service = UserService()
