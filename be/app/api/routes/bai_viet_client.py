from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_db
from app.models import BaiViet
from app.models.enums import TrangThaiBaiViet
from app.schemas.bai_viet import BaiVietCongKhaiChiTiet, BaiVietCongKhaiTomTat, DanhSachBaiVietCongKhai

router = APIRouter(prefix="/tin-tuc", tags=["tin-tuc"])


@router.get("", response_model=DanhSachBaiVietCongKhai)
def danh_sach_bai_viet(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    q: str | None = Query(None, description="Tìm theo tiêu đề"),
    db: Session = Depends(get_db),
) -> DanhSachBaiVietCongKhai:
    truy_van = db.query(BaiViet).options(joinedload(BaiViet.anh_bia)).filter(
        BaiViet.trang_thai == TrangThaiBaiViet.DA_DANG
    )
    if q:
        truy_van = truy_van.filter(BaiViet.tieu_de.ilike(f"%{q.strip()}%"))

    total = truy_van.with_entities(func.count(BaiViet.id)).scalar() or 0
    rows = (
        truy_van.order_by(BaiViet.ngay_dang.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    items = [BaiVietCongKhaiTomTat.tu_model(row) for row in rows]
    return DanhSachBaiVietCongKhai(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=BaiVietCongKhaiChiTiet)
def chi_tiet_bai_viet(slug: str, db: Session = Depends(get_db)) -> BaiVietCongKhaiChiTiet:
    bai_viet = (
        db.query(BaiViet)
        .options(joinedload(BaiViet.anh_bia))
        .filter(BaiViet.slug == slug, BaiViet.trang_thai == TrangThaiBaiViet.DA_DANG)
        .first()
    )
    if bai_viet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bài viết.")

    bai_viet.luot_xem += 1
    db.commit()
    db.refresh(bai_viet)

    return BaiVietCongKhaiChiTiet.tu_model(bai_viet)
