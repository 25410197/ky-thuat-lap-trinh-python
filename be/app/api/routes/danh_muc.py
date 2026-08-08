from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models import LoaiBatDongSan, PhuongXaMoi, QuanHuyen, TinhThanh
from app.schemas.danh_muc import (
    LoaiBatDongSanTomTat,
    PhuongXaMoiTomTat,
    QuanHuyenTomTat,
    TinhThanhTomTat,
)

router = APIRouter(tags=["danh-muc"])


@router.get("/loai-bat-dong-san", response_model=list[LoaiBatDongSanTomTat])
def danh_sach_loai_bat_dong_san(db: Session = Depends(get_db)) -> list[LoaiBatDongSanTomTat]:
    rows = db.query(LoaiBatDongSan).order_by(LoaiBatDongSan.ten).all()
    return [LoaiBatDongSanTomTat(id=row.id, ten=row.ten) for row in rows]


@router.get("/tinh-thanh", response_model=list[TinhThanhTomTat])
def danh_sach_tinh_thanh(db: Session = Depends(get_db)) -> list[TinhThanhTomTat]:
    rows = db.query(TinhThanh).order_by(TinhThanh.ten).all()
    return [TinhThanhTomTat(id=row.id, ten=row.ten) for row in rows]


@router.get("/tinh-thanh/{tinh_thanh_id}/quan-huyen", response_model=list[QuanHuyenTomTat])
def danh_sach_quan_huyen(tinh_thanh_id: int, db: Session = Depends(get_db)) -> list[QuanHuyenTomTat]:
    if db.get(TinhThanh, tinh_thanh_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tỉnh/thành.")

    rows = (
        db.query(QuanHuyen)
        .filter(QuanHuyen.tinh_thanh_id == tinh_thanh_id)
        .order_by(QuanHuyen.ten)
        .all()
    )
    return [QuanHuyenTomTat(id=row.id, ten=row.ten) for row in rows]


@router.get("/tinh-thanh/{tinh_thanh_id}/xa-phuong-moi", response_model=list[PhuongXaMoiTomTat])
def danh_sach_xa_phuong_moi(tinh_thanh_id: int, db: Session = Depends(get_db)) -> list[PhuongXaMoiTomTat]:
    """Xã/phường theo địa giới MỚI (sau sáp nhập 07/2025, không còn cấp quận/huyện)."""
    if db.get(TinhThanh, tinh_thanh_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tỉnh/thành.")

    rows = (
        db.query(PhuongXaMoi)
        .filter(PhuongXaMoi.tinh_thanh_id == tinh_thanh_id)
        .order_by(PhuongXaMoi.ten)
        .all()
    )
    return [PhuongXaMoiTomTat(id=row.id, ten=row.ten) for row in rows]
