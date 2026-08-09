from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user, get_db
from app.models import NguoiDung, TinDang
from app.schemas.nguoi_dung import (
    CapNhatTrangThaiNguoiDungRequest,
    DanhSachNguoiDungAdmin,
    NguoiDungAdminTomTat,
)

router = APIRouter(prefix="/users", tags=["nguoi-dung"])


def _dem_tin_dang(db: Session, nguoi_dung_id: int) -> int:
    return db.query(func.count(TinDang.id)).filter(TinDang.nguoi_dang_id == nguoi_dung_id).scalar() or 0


@router.get("", response_model=DanhSachNguoiDungAdmin)
def danh_sach_nguoi_dung(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    q: str | None = Query(None, description="Tìm theo họ tên hoặc email"),
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> DanhSachNguoiDungAdmin:
    truy_van = db.query(NguoiDung)
    if q:
        tu_khoa = f"%{q.strip()}%"
        truy_van = truy_van.filter(or_(NguoiDung.ho_ten.ilike(tu_khoa), NguoiDung.email.ilike(tu_khoa)))

    total = truy_van.with_entities(func.count(NguoiDung.id)).scalar() or 0

    rows = (
        truy_van.order_by(NguoiDung.ngay_tao.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    so_luong_theo_id: dict[int, int] = {}
    if rows:
        so_luong_theo_id = dict(
            db.query(TinDang.nguoi_dang_id, func.count(TinDang.id))
            .filter(TinDang.nguoi_dang_id.in_([row.id for row in rows]))
            .group_by(TinDang.nguoi_dang_id)
            .all()
        )

    items = [
        NguoiDungAdminTomTat.tu_nguoi_dung(row, so_luong_theo_id.get(row.id, 0)) for row in rows
    ]

    return DanhSachNguoiDungAdmin(items=items, total=total, page=page, page_size=page_size)


@router.patch("/{nguoi_dung_id}/trang-thai", response_model=NguoiDungAdminTomTat)
def cap_nhat_trang_thai_nguoi_dung(
    nguoi_dung_id: int,
    du_lieu: CapNhatTrangThaiNguoiDungRequest,
    db: Session = Depends(get_db),
    admin: NguoiDung = Depends(get_current_admin_user),
) -> NguoiDungAdminTomTat:
    nguoi_dung = db.get(NguoiDung, nguoi_dung_id)
    if nguoi_dung is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")

    trang_thai_moi = du_lieu.to_enum()
    if nguoi_dung.id == admin.id and du_lieu.trang_thai == "locked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể tự khóa tài khoản đang đăng nhập.",
        )

    nguoi_dung.trang_thai = trang_thai_moi
    db.commit()
    db.refresh(nguoi_dung)

    return NguoiDungAdminTomTat.tu_nguoi_dung(nguoi_dung, _dem_tin_dang(db, nguoi_dung.id))
