from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_db
from app.models import PhuongXa, QuanHuyen, TinDang
from app.models.enums import TrangThaiTinDang
from app.schemas.tin_dang import DanhSachTinDang, TinDangTomTat

router = APIRouter(prefix="/rental-posts", tags=["tin-dang"])


@router.get("", response_model=DanhSachTinDang)
def danh_sach_tin_dang(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
) -> DanhSachTinDang:
    bo_loc = TinDang.trang_thai == TrangThaiTinDang.DA_DUYET

    total = db.query(func.count(TinDang.id)).filter(bo_loc).scalar() or 0

    rows = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.phuong_xa)
            .joinedload(PhuongXa.quan_huyen)
            .joinedload(QuanHuyen.tinh_thanh),
            joinedload(TinDang.hinh_anh),
            joinedload(TinDang.tien_ich),
        )
        .filter(bo_loc)
        .order_by(TinDang.ngay_dang.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        TinDangTomTat(
            id=tin.id,
            tieu_de=tin.tieu_de,
            gia_thue=float(tin.gia_thue),
            dien_tich=float(tin.dien_tich),
            dia_chi_chi_tiet=tin.dia_chi_chi_tiet,
            loai_bat_dong_san=tin.loai_bat_dong_san.ten,
            phuong_xa=tin.phuong_xa.ten,
            quan_huyen=tin.phuong_xa.quan_huyen.ten,
            tinh_thanh=tin.phuong_xa.quan_huyen.tinh_thanh.ten,
            anh_dai_dien=next(
                (anh.duong_dan_anh for anh in tin.hinh_anh if anh.la_anh_dai_dien),
                tin.hinh_anh[0].duong_dan_anh if tin.hinh_anh else None,
            ),
            tien_ich=[tien_ich.ten for tien_ich in tin.tien_ich],
            ngay_dang=tin.ngay_dang,
        )
        for tin in rows
    ]

    return DanhSachTinDang(items=items, total=total, page=page, page_size=page_size)
