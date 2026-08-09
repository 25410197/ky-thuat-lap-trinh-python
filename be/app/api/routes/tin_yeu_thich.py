from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_db, get_current_user
from app.models import HinhAnhTinDang, NguoiDung, PhuongXa, QuanHuyen, TinDang, TinYeuThich
from app.models.enums import TrangThaiTinDang
from app.schemas.tin_dang import TinDangTomTat
from app.schemas.tin_yeu_thich import DanhSachYeuThich

router = APIRouter(prefix="/favorites", tags=["tin-yeu-thich"])


@router.get("", response_model=DanhSachYeuThich)
def danh_sach_yeu_thich(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> DanhSachYeuThich:
    # Chỉ hiển thị các tin còn công khai — tin đã bị khóa/ẩn/xóa tự động biến mất khỏi danh sách yêu thích.
    dieu_kien = and_(
        TinYeuThich.nguoi_dung_id == nguoi_dung.id,
        TinDang.trang_thai == TrangThaiTinDang.DA_DUYET,
    )

    total = (
        db.query(func.count(TinYeuThich.id))
        .join(TinDang, TinYeuThich.tin_dang_id == TinDang.id)
        .filter(dieu_kien)
        .scalar()
        or 0
    )

    rows = (
        db.query(TinDang)
        .join(TinYeuThich, TinYeuThich.tin_dang_id == TinDang.id)
        .options(
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.phuong_xa)
            .joinedload(PhuongXa.quan_huyen)
            .joinedload(QuanHuyen.tinh_thanh),
            joinedload(TinDang.hinh_anh).joinedload(HinhAnhTinDang.anh_thu_vien),
            joinedload(TinDang.tien_ich),
        )
        .filter(dieu_kien)
        .order_by(TinYeuThich.ngay_luu.desc())
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
                (anh.anh_thu_vien.duong_dan_anh for anh in tin.hinh_anh if anh.la_anh_dai_dien),
                tin.hinh_anh[0].anh_thu_vien.duong_dan_anh if tin.hinh_anh else None,
            ),
            tien_ich=[tien_ich.ten for tien_ich in tin.tien_ich],
            ngay_dang=tin.ngay_dang,
        )
        for tin in rows
    ]

    return DanhSachYeuThich(items=items, total=total, page=page, page_size=page_size)


@router.get("/ids", response_model=list[int])
def danh_sach_id_da_luu(
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> list[int]:
    """Danh sách rút gọn các tin_dang_id đã lưu — FE dùng để tô trạng thái trái tim trên danh sách/chi tiết."""
    rows = db.query(TinYeuThich.tin_dang_id).filter(TinYeuThich.nguoi_dung_id == nguoi_dung.id).all()
    return [row[0] for row in rows]


@router.post("/{tin_dang_id}", status_code=status.HTTP_201_CREATED)
def luu_tin_yeu_thich(
    tin_dang_id: int,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
):
    tin = (
        db.query(TinDang)
        .filter(TinDang.id == tin_dang_id, TinDang.trang_thai == TrangThaiTinDang.DA_DUYET)
        .first()
    )
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")

    da_luu = (
        db.query(TinYeuThich)
        .filter(TinYeuThich.nguoi_dung_id == nguoi_dung.id, TinYeuThich.tin_dang_id == tin_dang_id)
        .first()
    )
    if da_luu is not None:
        return {"message": "Tin đăng đã có trong danh sách yêu thích."}

    db.add(TinYeuThich(nguoi_dung_id=nguoi_dung.id, tin_dang_id=tin_dang_id))
    db.commit()

    return {"message": "Đã lưu vào yêu thích."}


@router.delete("/{tin_dang_id}")
def bo_luu_tin_yeu_thich(
    tin_dang_id: int,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
):
    so_dong_xoa = (
        db.query(TinYeuThich)
        .filter(TinYeuThich.nguoi_dung_id == nguoi_dung.id, TinYeuThich.tin_dang_id == tin_dang_id)
        .delete(synchronize_session=False)
    )
    db.commit()

    if not so_dong_xoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tin đăng chưa có trong danh sách yêu thích."
        )

    return {"message": "Đã bỏ khỏi danh sách yêu thích."}
