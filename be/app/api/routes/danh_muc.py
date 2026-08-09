from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user, get_db
from app.models import LoaiBatDongSan, NguoiDung, PhuongXaMoi, QuanHuyen, TinDang, TinhThanh
from app.models.enums import TrangThaiLoaiBatDongSan
from app.schemas.danh_muc import (
    DanhSachLoaiBatDongSanQuanTri,
    LoaiBatDongSanQuanTri,
    LoaiBatDongSanSuaRequest,
    LoaiBatDongSanTaoRequest,
    LoaiBatDongSanTomTat,
    PhuongXaMoiTomTat,
    QuanHuyenTomTat,
    TinhThanhTomTat,
)

router = APIRouter(tags=["danh-muc"])


def _co_dang_su_dung(db: Session, loai_id: int) -> bool:
    return db.query(TinDang.id).filter(TinDang.loai_bat_dong_san_id == loai_id).first() is not None


def _tim_loai_bat_dong_san_hoac_404(db: Session, loai_id: int) -> LoaiBatDongSan:
    row = db.get(LoaiBatDongSan, loai_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy loại bất động sản.")
    return row


def _kiem_tra_trung_ten(db: Session, ten: str, bo_qua_id: int | None = None) -> None:
    truy_van = db.query(LoaiBatDongSan).filter(func.lower(LoaiBatDongSan.ten) == ten.lower())
    if bo_qua_id is not None:
        truy_van = truy_van.filter(LoaiBatDongSan.id != bo_qua_id)
    if truy_van.first() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Tên loại bất động sản đã tồn tại."
        )


@router.get("/loai-bat-dong-san", response_model=list[LoaiBatDongSanTomTat])
def danh_sach_loai_bat_dong_san(db: Session = Depends(get_db)) -> list[LoaiBatDongSanTomTat]:
    """Danh sách công khai — chỉ trả về loại đang hoạt động (dùng cho form tạo tin, bộ lọc)."""
    rows = (
        db.query(LoaiBatDongSan)
        .filter(LoaiBatDongSan.trang_thai == TrangThaiLoaiBatDongSan.HOAT_DONG)
        .order_by(LoaiBatDongSan.ten)
        .all()
    )
    return [LoaiBatDongSanTomTat(id=row.id, ten=row.ten) for row in rows]


@router.get("/loai-bat-dong-san/quan-tri", response_model=DanhSachLoaiBatDongSanQuanTri)
def danh_sach_loai_bat_dong_san_quan_tri(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: str | None = Query(None, description="Tìm theo tên"),
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> DanhSachLoaiBatDongSanQuanTri:
    truy_van = db.query(LoaiBatDongSan)
    if q:
        truy_van = truy_van.filter(LoaiBatDongSan.ten.ilike(f"%{q.strip()}%"))

    total = truy_van.with_entities(func.count(LoaiBatDongSan.id)).scalar() or 0
    rows = (
        truy_van.order_by(LoaiBatDongSan.ten)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    items = [LoaiBatDongSanQuanTri.tu_model(row, _co_dang_su_dung(db, row.id)) for row in rows]
    return DanhSachLoaiBatDongSanQuanTri(items=items, total=total, page=page, page_size=page_size)


@router.post(
    "/loai-bat-dong-san", response_model=LoaiBatDongSanQuanTri, status_code=status.HTTP_201_CREATED
)
def tao_loai_bat_dong_san(
    du_lieu: LoaiBatDongSanTaoRequest,
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> LoaiBatDongSanQuanTri:
    ten = du_lieu.ten.strip()
    _kiem_tra_trung_ten(db, ten)

    row = LoaiBatDongSan(ten=ten, trang_thai=TrangThaiLoaiBatDongSan.HOAT_DONG)
    db.add(row)
    db.commit()
    db.refresh(row)
    return LoaiBatDongSanQuanTri.tu_model(row, dang_su_dung=False)


@router.put("/loai-bat-dong-san/{loai_id}", response_model=LoaiBatDongSanQuanTri)
def sua_loai_bat_dong_san(
    loai_id: int,
    du_lieu: LoaiBatDongSanSuaRequest,
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> LoaiBatDongSanQuanTri:
    row = _tim_loai_bat_dong_san_hoac_404(db, loai_id)

    ten = du_lieu.ten.strip()
    _kiem_tra_trung_ten(db, ten, bo_qua_id=loai_id)

    row.ten = ten
    db.commit()
    db.refresh(row)
    return LoaiBatDongSanQuanTri.tu_model(row, _co_dang_su_dung(db, row.id))


@router.patch("/loai-bat-dong-san/{loai_id}/trang-thai", response_model=LoaiBatDongSanQuanTri)
def doi_trang_thai_loai_bat_dong_san(
    loai_id: int,
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> LoaiBatDongSanQuanTri:
    """Bật/tắt (ẩn — kích hoạt lại) một loại bất động sản. Không xóa cứng dù đang được tin đăng sử dụng."""
    row = _tim_loai_bat_dong_san_hoac_404(db, loai_id)

    row.trang_thai = (
        TrangThaiLoaiBatDongSan.AN
        if row.trang_thai == TrangThaiLoaiBatDongSan.HOAT_DONG
        else TrangThaiLoaiBatDongSan.HOAT_DONG
    )
    db.commit()
    db.refresh(row)
    return LoaiBatDongSanQuanTri.tu_model(row, _co_dang_su_dung(db, row.id))


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
