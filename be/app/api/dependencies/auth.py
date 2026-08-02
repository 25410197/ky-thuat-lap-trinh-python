from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db import get_db
from app.models import NguoiDung
from app.models.enums import TrangThaiNguoiDung

_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> NguoiDung:
    loi_xac_thuc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise loi_xac_thuc

    try:
        payload = decode_access_token(credentials.credentials)
        nguoi_dung_id = int(payload["sub"])
    except (PyJWTError, KeyError, ValueError):
        raise loi_xac_thuc from None

    nguoi_dung = db.get(NguoiDung, nguoi_dung_id)
    if nguoi_dung is None:
        raise loi_xac_thuc

    if nguoi_dung.trang_thai == TrangThaiNguoiDung.BI_KHOA:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản đã bị khóa.")

    return nguoi_dung
