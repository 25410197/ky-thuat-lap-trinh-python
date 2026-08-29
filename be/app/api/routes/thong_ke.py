from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user, get_db
from app.models import LoaiBatDongSan, NguoiDung, PhuongXa, QuanHuyen, TinDang, TinhThanh
from app.models.enums import TrangThaiTinDang
from app.schemas.thong_ke import (
    SoSanhKhuVucItem,
    SoSanhKhuVucResponse,
    ThongKePhanBoGia,
    ThongKeTheoLoai,
    ThongKeTheoTinhThanh,
    ThongKeTongQuanResponse,
)

router = APIRouter(prefix="/thong-ke", tags=["thong-ke"])

# Khoảng giá cho biểu đồ phân bố giá thuê (histogram) — đơn vị VNĐ/tháng, mốc chọn theo mặt bằng giá
# thực tế của phòng trọ/căn hộ/nhà nguyên căn trong hệ thống (xem KHOANG_GIA_DIEN_TICH ở seed.py).
CAC_KHOANG_GIA: list[tuple[float, float | None, str]] = [
    (0, 2_000_000, "Dưới 2 triệu"),
    (2_000_000, 5_000_000, "2 - 5 triệu"),
    (5_000_000, 8_000_000, "5 - 8 triệu"),
    (8_000_000, 12_000_000, "8 - 12 triệu"),
    (12_000_000, 20_000_000, "12 - 20 triệu"),
    (20_000_000, None, "Trên 20 triệu"),
]

# Số tin tối thiểu để giá trung bình/trung vị của 1 khu vực được coi là đáng tin — dưới ngưỡng này
# frontend phải cảnh báo "mẫu nhỏ" vì vài tin lẻ tẻ có thể kéo lệch số liệu rất nhiều.
NGUONG_MAU_NHO = 5


@router.get("/tong-quan", response_model=ThongKeTongQuanResponse)
def thong_ke_tong_quan(
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> ThongKeTongQuanResponse:
    """Thống kê tổng quan cho dashboard quản trị.

    - Tổng số tin đăng / tổng số tin đã duyệt (= đang hoạt động): tính trên tin hợp lệ (không tính
      tin đã xóa/bị khóa).
    - Giá thuê TB, diện tích TB, giá/m2 TB ở cấp tổng quan: gộp chung toàn hệ thống, dùng cho các thẻ
      tổng quan trên dashboard. Chỉ tính trên tin đã DUYỆT và có giá/diện tích hợp lệ (>0).
    - Theo loại bất động sản: TÁCH RIÊNG giá/diện tích TB cho từng loại — phòng trọ, căn hộ, nhà
      nguyên căn... có mặt bằng giá/diện tích khác xa nhau nên một con số gộp sẽ không phản ánh đúng
      thực tế. Giá/m2 TB của mỗi loại = tổng giá thuê / tổng diện tích của loại đó.
    - Theo tỉnh/thành: số lượng + giá thuê TB mỗi khu vực; khu vực nhiều tin nhất lấy từ danh sách này.
    - Phân bố giá thuê: số tin theo từng khoảng giá cố định (xem `CAC_KHOANG_GIA`), luôn trả đủ khoảng
      kể cả khoảng có 0 tin, để biểu đồ ở frontend không bị thiếu cột.
    - Tất cả cùng điều kiện DUYỆT + giá/diện tích hợp lệ ở trên.
    """
    tong_so_tin_dang = (
        db.query(func.count(TinDang.id))
        .filter(TinDang.is_deleted == False)
        .scalar()
        or 0
    )

    tong_so_tin_da_duyet = (
        db.query(func.count(TinDang.id))
        .filter(TinDang.trang_thai == TrangThaiTinDang.DA_DUYET, TinDang.is_deleted == False)
        .scalar()
        or 0
    )

    dieu_kien_duyet_hop_le = (
        TinDang.trang_thai == TrangThaiTinDang.DA_DUYET,
        TinDang.is_deleted == False,
        TinDang.gia_thue > 0,
        TinDang.dien_tich > 0,
    )

    tong_gia_thue, tong_dien_tich_chung, tong_so_tin_hop_le = (
        db.query(
            func.sum(TinDang.gia_thue),
            func.sum(TinDang.dien_tich),
            func.count(TinDang.id),
        )
        .filter(*dieu_kien_duyet_hop_le)
        .one()
    )
    co_du_lieu_hop_le = bool(tong_so_tin_hop_le)
    gia_thue_trung_binh = float(tong_gia_thue / tong_so_tin_hop_le) if co_du_lieu_hop_le else 0.0
    dien_tich_trung_binh = float(tong_dien_tich_chung / tong_so_tin_hop_le) if co_du_lieu_hop_le else 0.0
    gia_tren_m2_trung_binh = float(tong_gia_thue / tong_dien_tich_chung) if co_du_lieu_hop_le else 0.0

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
        db.query(TinhThanh.ten, func.count(TinDang.id), func.avg(TinDang.gia_thue))
        .join(QuanHuyen, QuanHuyen.tinh_thanh_id == TinhThanh.id)
        .join(PhuongXa, PhuongXa.quan_huyen_id == QuanHuyen.id)
        .join(TinDang, TinDang.phuong_xa_id == PhuongXa.id)
        .filter(*dieu_kien_duyet_hop_le)
        .group_by(TinhThanh.ten)
        .order_by(func.count(TinDang.id).desc())
        .all()
    )
    theo_tinh_thanh = [
        ThongKeTheoTinhThanh(tinh_thanh=ten, so_luong=so_luong, gia_thue_trung_binh=float(gia_tb))
        for ten, so_luong, gia_tb in theo_tinh_thanh_rows
    ]

    nhan_khoang_gia = case(
        *[
            ((TinDang.gia_thue >= tu) & (TinDang.gia_thue < den), nhan)
            for tu, den, nhan in CAC_KHOANG_GIA
            if den is not None
        ],
        else_=CAC_KHOANG_GIA[-1][2],
    )
    so_luong_theo_khoang = dict(
        db.query(nhan_khoang_gia, func.count(TinDang.id))
        .filter(*dieu_kien_duyet_hop_le)
        .group_by(nhan_khoang_gia)
        .all()
    )
    phan_bo_gia = [
        ThongKePhanBoGia(khoang_gia=nhan, so_luong=so_luong_theo_khoang.get(nhan, 0))
        for _, _, nhan in CAC_KHOANG_GIA
    ]

    return ThongKeTongQuanResponse(
        tong_so_tin_dang=tong_so_tin_dang,
        tong_so_tin_da_duyet=tong_so_tin_da_duyet,
        gia_thue_trung_binh=gia_thue_trung_binh,
        dien_tich_trung_binh=dien_tich_trung_binh,
        gia_tren_m2_trung_binh=gia_tren_m2_trung_binh,
        theo_loai_bat_dong_san=theo_loai_bat_dong_san,
        theo_tinh_thanh=theo_tinh_thanh,
        khu_vuc_nhieu_tin_nhat=theo_tinh_thanh[0] if theo_tinh_thanh else None,
        phan_bo_gia=phan_bo_gia,
    )


@router.get("/so-sanh-khu-vuc", response_model=SoSanhKhuVucResponse)
def so_sanh_khu_vuc(
    quan_huyen_id: list[int] = Query(..., description="Danh sách ID quận/huyện cần so sánh"),
    loai_bat_dong_san_id: int | None = Query(None, description="Lọc theo 1 loại bất động sản (tùy chọn)"),
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> SoSanhKhuVucResponse:
    """So sánh giá thuê giữa các quận/huyện do người dùng chọn.

    - Chỉ tính trên tin đã DUYỆT, không xóa, giá/diện tích hợp lệ (>0) — như các thống kê khác.
    - Trả về CẢ những quận/huyện không có tin hợp lệ nào (`soLuong=0`, các trường `gia*` là `null`) để
      frontend hiển thị rõ "không có dữ liệu" thay vì âm thầm bỏ qua khiến người xem hiểu nhầm.
    - `mauNho=true` khi có tin nhưng ít hơn `nguongMauNho` — số trung bình/trung vị dễ bị lệch bởi
      1-2 tin ngoại lệ nên cần cảnh báo, không phải là "không có dữ liệu".
    - Giá trung vị dùng `percentile_cont(0.5)` (nội suy), giá/m2 TB = tổng giá thuê / tổng diện tích.
    """
    danh_sach_quan_huyen = (
        db.query(QuanHuyen, TinhThanh.ten)
        .join(TinhThanh, QuanHuyen.tinh_thanh_id == TinhThanh.id)
        .filter(QuanHuyen.id.in_(quan_huyen_id))
        .all()
    )
    tim_thay_ids = {qh.id for qh, _ in danh_sach_quan_huyen}
    thieu_ids = set(quan_huyen_id) - tim_thay_ids
    if thieu_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy quận/huyện: {sorted(thieu_ids)}",
        )

    dieu_kien = [
        TinDang.trang_thai == TrangThaiTinDang.DA_DUYET,
        TinDang.is_deleted == False,
        TinDang.gia_thue > 0,
        TinDang.dien_tich > 0,
        PhuongXa.quan_huyen_id.in_(quan_huyen_id),
    ]
    if loai_bat_dong_san_id is not None:
        dieu_kien.append(TinDang.loai_bat_dong_san_id == loai_bat_dong_san_id)

    so_lieu_rows = (
        db.query(
            PhuongXa.quan_huyen_id,
            func.count(TinDang.id),
            func.avg(TinDang.gia_thue),
            func.percentile_cont(0.5).within_group(TinDang.gia_thue),
            func.sum(TinDang.gia_thue),
            func.sum(TinDang.dien_tich),
        )
        .join(TinDang, TinDang.phuong_xa_id == PhuongXa.id)
        .filter(*dieu_kien)
        .group_by(PhuongXa.quan_huyen_id)
        .all()
    )
    so_lieu_theo_quan = {row[0]: row[1:] for row in so_lieu_rows}

    ket_qua = []
    for qh, ten_tinh_thanh in danh_sach_quan_huyen:
        so_lieu = so_lieu_theo_quan.get(qh.id)
        if so_lieu is None:
            ket_qua.append(
                SoSanhKhuVucItem(
                    quan_huyen_id=qh.id,
                    quan_huyen=qh.ten,
                    tinh_thanh=ten_tinh_thanh,
                    so_luong=0,
                    gia_thue_trung_binh=None,
                    gia_thue_trung_vi=None,
                    gia_tren_m2_trung_binh=None,
                    mau_nho=False,
                )
            )
            continue

        so_luong, gia_tb, gia_trung_vi, tong_gia, tong_dien_tich = so_lieu
        ket_qua.append(
            SoSanhKhuVucItem(
                quan_huyen_id=qh.id,
                quan_huyen=qh.ten,
                tinh_thanh=ten_tinh_thanh,
                so_luong=so_luong,
                gia_thue_trung_binh=float(gia_tb),
                gia_thue_trung_vi=float(gia_trung_vi),
                gia_tren_m2_trung_binh=float(tong_gia / tong_dien_tich),
                mau_nho=so_luong < NGUONG_MAU_NHO,
            )
        )

    # Giữ đúng thứ tự người dùng chọn để frontend hiển thị ổn định, không phụ thuộc thứ tự SQL trả về.
    thu_tu = {id_: i for i, id_ in enumerate(quan_huyen_id)}
    ket_qua.sort(key=lambda item: thu_tu[item.quan_huyen_id])

    return SoSanhKhuVucResponse(nguong_mau_nho=NGUONG_MAU_NHO, ket_qua=ket_qua)
