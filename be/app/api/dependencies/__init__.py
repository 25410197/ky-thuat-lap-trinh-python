"""Shared API dependencies."""

from app.api.dependencies.auth import get_current_admin_user, get_current_user
from app.db import get_db

__all__ = ["get_current_admin_user", "get_current_user", "get_db"]
