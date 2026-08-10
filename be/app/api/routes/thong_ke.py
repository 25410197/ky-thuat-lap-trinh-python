from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user, get_db
from app.models import LoaiBatDongSan, NguoiDung, PhuongXa, QuanHuyen, TinDang, TinhThanh
from app.models.enums import TrangThaiTinDang
from app.schemas.thong_ke import ThongKeTheoLoai, ThongKeTheoTinhThanh, ThongKeTongQuanResponse

router = APIRouter(prefix="/thong-ke", tags=["thong-ke"])

_TRANG_THAI_KHONG_HOP_LE = (TrangThaiTinDang.DA_XOA, TrangThaiTinDang.BI_KHOA)


@router.get("/tong-quan", response_model=ThongKeTongQuanResponse)
def thong_ke_tong_quan(
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> ThongKeTongQuanResponse:
    """Thống kê tổng quan cho dashboard quản trị.

    - Tổng số tin đăng / tổng số tin đã duyệt: tính trên tin hợp lệ (không tính tin đã xóa/bị khóa).
    - Giá thuê TB, diện tích TB, giá/m2 TB: tách riêng theo TỪNG loại bất động sản, không gộp chung
      thành 1 con số — phòng trọ, căn hộ, nhà nguyên căn... có mặt bằng giá/diện tích khác xa nhau nên
      một con số trung bình chung sẽ không phản ánh đúng thực tế. Giá/m2 TB của mỗi loại = tổng giá
      thuê / tổng diện tích của loại đó. Chỉ tính trên tin đã DUYỆT và có giá/diện tích hợp lệ (>0).
    - Theo tỉnh/thành, khu vực nhiều tin nhất: cùng điều kiện DUYỆT + giá/diện tích hợp lệ ở trên.
    """
    tong_so_tin_dang = (
        db.query(func.count(TinDang.id))
        .filter(TinDang.trang_thai.notin_(_TRANG_THAI_KHONG_HOP_LE))
        .scalar()
        or 0
    )

    tong_so_tin_da_duyet = (
        db.query(func.count(TinDang.id))
        .filter(TinDang.trang_thai == TrangThaiTinDang.DA_DUYET)
        .scalar()
        or 0
    )

    dieu_kien_duyet_hop_le = (
        TinDang.trang_thai == TrangThaiTinDang.DA_DUYET,
        TinDang.gia_thue > 0,
        TinDang.dien_tich > 0,
    )

    theo_loai_rows = (
        db.query(
            LoaiBatDongSan.ten,
            func.count(TinDang.id),
            func.avg(TinDang.gia_thue),
            func.avg(TinDang.dien_tich),
            func.sum(TinDang.gia_thue),
            func.sum(TinDang.dien_tich),
        )
        .join(TinDang, TinDang.loai_bat_dong_san_id == LoaiBatDongSan.id)
        .filter(*dieu_kien_duyet_hop_le)
        .group_by(LoaiBatDongSan.ten)
        .order_by(func.count(TinDang.id).desc())
        .all()
    )
    theo_loai_bat_dong_san = [
        ThongKeTheoLoai(
            loai_bat_dong_san=ten,
            so_luong=so_luong,
            gia_thue_trung_binh=float(gia_tb),
            dien_tich_trung_binh=float(dien_tich_tb),
            gia_tren_m2_trung_binh=float(tong_gia / tong_dien_tich),
        )
        for ten, so_luong, gia_tb, dien_tich_tb, tong_gia, tong_dien_tich in theo_loai_rows
    ]

    theo_tinh_thanh_rows = (
        db.query(TinhThanh.ten, func.count(TinDang.id))
        .join(QuanHuyen, QuanHuyen.tinh_thanh_id == TinhThanh.id)
        .join(PhuongXa, PhuongXa.quan_huyen_id == QuanHuyen.id)
        .join(TinDang, TinDang.phuong_xa_id == PhuongXa.id)
        .filter(*dieu_kien_duyet_hop_le)
        .group_by(TinhThanh.ten)
        .order_by(func.count(TinDang.id).desc())
        .all()
    )
    theo_tinh_thanh = [
        ThongKeTheoTinhThanh(tinh_thanh=ten, so_luong=so_luong) for ten, so_luong in theo_tinh_thanh_rows
    ]

    return ThongKeTongQuanResponse(
        tong_so_tin_dang=tong_so_tin_dang,
        tong_so_tin_da_duyet=tong_so_tin_da_duyet,
        theo_loai_bat_dong_san=theo_loai_bat_dong_san,
        theo_tinh_thanh=theo_tinh_thanh,
        khu_vuc_nhieu_tin_nhat=theo_tinh_thanh[0] if theo_tinh_thanh else None,
    )
