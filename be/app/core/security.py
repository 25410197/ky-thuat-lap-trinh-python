from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(mat_khau: str) -> str:
    return pwd_context.hash(mat_khau)


def verify_password(mat_khau: str, mat_khau_hash: str) -> bool:
    return pwd_context.verify(mat_khau, mat_khau_hash)


def create_access_token(nguoi_dung_id: int) -> str:
    settings = get_settings()
    het_han = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {"sub": str(nguoi_dung_id), "exp": het_han}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
