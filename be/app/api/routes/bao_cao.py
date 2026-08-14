from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user, get_db
from app.models import BaoCao, NguoiDung, TinDang
from app.models.enums import TrangThaiBaoCao
from app.schemas.bao_cao import (
    BaoCaoChiTiet,
    BaoCaoProcessRequest,
    BaoCaoTomTat,
    DanhSachBaoCao,
    NguoiDungTomTat,
    TinDangNganGach,
)

router = APIRouter(prefix="/bao-cao", tags=["bao-cao"])


@router.get("", response_model=DanhSachBaoCao)
def lay_danh_sach_bao_cao(
    trang_thai: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
):
    query = db.query(BaoCao)
    if trang_thai:
        query = query.filter(BaoCao.trang_thai == trang_thai)

    total = query.count()
    items = (
        query.order_by(desc(BaoCao.ngay_bao_cao))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    result = []
    for item in items:
        result.append(
            BaoCaoTomTat(
                id=item.id,
                lyDo=item.ly_do,
                trangThai=item.trang_thai.value,
                ngayBaoCao=item.ngay_bao_cao,
                nguoiBaoCao=NguoiDungTomTat(
                    id=item.nguoi_bao_cao.id,
                    hoTen=item.nguoi_bao_cao.ho_ten,
                    email=item.nguoi_bao_cao.email,
                ),
                tinDang=TinDangNganGach(
                    id=item.tin_dang.id,
                    tieuDe=item.tin_dang.tieu_de,
                ),
            )
        )

    return DanhSachBaoCao(
        items=result,
        total=total,
        page=page,
        pageSize=page_size,
    )


@router.get("/{id}", response_model=BaoCaoChiTiet)
def lay_chi_tiet_bao_cao(
    id: int,
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
):
    item = db.query(BaoCao).filter(BaoCao.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")

    nguoi_xu_ly = None
    if item.nguoi_xu_ly:
        nguoi_xu_ly = NguoiDungTomTat(
            id=item.nguoi_xu_ly.id,
            hoTen=item.nguoi_xu_ly.ho_ten,
            email=item.nguoi_xu_ly.email,
        )

    return BaoCaoChiTiet(
        id=item.id,
        lyDo=item.ly_do,
        moTa=item.mo_ta,
        trangThai=item.trang_thai.value,
        ngayBaoCao=item.ngay_bao_cao,
        nguoiBaoCao=NguoiDungTomTat(
            id=item.nguoi_bao_cao.id,
            hoTen=item.nguoi_bao_cao.ho_ten,
            email=item.nguoi_bao_cao.email,
        ),
        tinDang=TinDangNganGach(
            id=item.tin_dang.id,
            tieuDe=item.tin_dang.tieu_de,
        ),
        nguoiXuLy=nguoi_xu_ly,
        ngayXuLy=item.ngay_xu_ly,
        ghiChuXuLy=item.ghi_chu_xu_ly,
    )


@router.put("/{id}/xu-ly", response_model=BaoCaoChiTiet)
def xu_ly_bao_cao(
    id: int,
    payload: BaoCaoProcessRequest,
    db: Session = Depends(get_db),
    admin: NguoiDung = Depends(get_current_admin_user),
):
    item = db.query(BaoCao).filter(BaoCao.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo cáo")

    if payload.action == "RESOLVED":
        item.trang_thai = TrangThaiBaoCao.DA_XU_LY
    elif payload.action == "REJECTED":
        item.trang_thai = TrangThaiBaoCao.TU_CHOI
    else:
        raise HTTPException(status_code=400, detail="Hành động không hợp lệ")

    item.nguoi_xu_ly_id = admin.id
    item.ngay_xu_ly = datetime.now(timezone.utc)
    item.ghi_chu_xu_ly = payload.ghi_chu_xu_ly

    if payload.khoa_tin:
        if not payload.ly_do_khoa:
            raise HTTPException(status_code=400, detail="Vui lòng nhập lý do khóa tin")
        
        tin_dang = db.query(TinDang).filter(TinDang.id == item.tin_dang_id).first()
        if tin_dang:
            tin_dang.is_blocked = True
            tin_dang.ly_do_khoa = payload.ly_do_khoa
            tin_dang.ngay_cap_nhat = datetime.now(timezone.utc)

    db.commit()
    db.refresh(item)

    # Re-fetch for response
    return lay_chi_tiet_bao_cao(id, db, admin)
