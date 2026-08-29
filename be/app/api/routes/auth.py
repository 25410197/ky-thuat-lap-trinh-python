from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models import NguoiDung
from app.models.enums import TrangThaiNguoiDung, VaiTroNguoiDung
from app.schemas.auth import (
    CapNhatHoSoRequest,
    DangKyRequest,
    DangNhapRequest,
    DoiMatKhauRequest,
    NguoiDungCongKhai,
    PhienDangNhap,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _tao_phien_dang_nhap(nguoi_dung: NguoiDung) -> PhienDangNhap:
    return PhienDangNhap(
        access_token=create_access_token(nguoi_dung.id),
        user=NguoiDungCongKhai.tu_nguoi_dung(nguoi_dung),
    )


@router.post("/register", response_model=PhienDangNhap, status_code=status.HTTP_201_CREATED)
def dang_ky(du_lieu: DangKyRequest, db: Session = Depends(get_db)) -> PhienDangNhap:
    email = du_lieu.email.strip().lower()

    da_ton_tai = db.query(NguoiDung).filter(NguoiDung.email == email).first()
    if da_ton_tai is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email đã được sử dụng.")

    nguoi_dung = NguoiDung(
        ho_ten=du_lieu.ho_ten.strip(),
        email=email,
        mat_khau_hash=hash_password(du_lieu.mat_khau),
        vai_tro=VaiTroNguoiDung.NGUOI_DUNG,
        trang_thai=TrangThaiNguoiDung.HOAT_DONG,
    )
    db.add(nguoi_dung)
    db.commit()
    db.refresh(nguoi_dung)

    return _tao_phien_dang_nhap(nguoi_dung)


@router.post("/login", response_model=PhienDangNhap)
def dang_nhap(du_lieu: DangNhapRequest, db: Session = Depends(get_db)) -> PhienDangNhap:
    loi_dang_nhap = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email hoặc mật khẩu không đúng.",
    )

    nguoi_dung = db.query(NguoiDung).filter(NguoiDung.email == du_lieu.email.strip().lower()).first()
    if nguoi_dung is None or not verify_password(du_lieu.mat_khau, nguoi_dung.mat_khau_hash):
        raise loi_dang_nhap

    if nguoi_dung.trang_thai == TrangThaiNguoiDung.BI_KHOA:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản đã bị khóa.")

    return _tao_phien_dang_nhap(nguoi_dung)


@router.get("/me", response_model=NguoiDungCongKhai)
def thong_tin_ca_nhan(nguoi_dung: NguoiDung = Depends(get_current_user)) -> NguoiDungCongKhai:
    return NguoiDungCongKhai.tu_nguoi_dung(nguoi_dung)


@router.patch("/me", response_model=NguoiDungCongKhai)
def cap_nhat_ho_so(
    du_lieu: CapNhatHoSoRequest,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> NguoiDungCongKhai:
    nguoi_dung.ho_ten = du_lieu.ho_ten.strip()
    nguoi_dung.so_dien_thoai = du_lieu.so_dien_thoai.strip() if du_lieu.so_dien_thoai else None
    db.commit()
    db.refresh(nguoi_dung)
    return NguoiDungCongKhai.tu_nguoi_dung(nguoi_dung)


@router.post("/doi-mat-khau", status_code=status.HTTP_204_NO_CONTENT)
def doi_mat_khau(
    du_lieu: DoiMatKhauRequest,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> None:
    if not verify_password(du_lieu.mat_khau_hien_tai, nguoi_dung.mat_khau_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Mật khẩu hiện tại không đúng."
        )

    nguoi_dung.mat_khau_hash = hash_password(du_lieu.mat_khau_moi)
    db.commit()
