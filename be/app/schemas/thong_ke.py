from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class ThongKeTheoLoai(BaseModel):
    """Số lượng + giá/diện tích trung bình tách riêng theo từng loại bất động sản.

    Tách riêng (không gộp chung 1 con số) vì các loại hình như phòng trọ, căn hộ, nhà nguyên căn có
    mặt bằng giá/diện tích khác xa nhau — gộp chung sẽ cho một con số không phản ánh đúng thực tế.
    """

    model_config = ConfigDict(populate_by_name=True)

    loai_bat_dong_san: Annotated[str, Field(alias="loaiBatDongSan")]
    so_luong: Annotated[int, Field(alias="soLuong")]
    gia_thue_trung_binh: Annotated[float, Field(alias="giaThueTrungBinh")]
    dien_tich_trung_binh: Annotated[float, Field(alias="dienTichTrungBinh")]
    gia_tren_m2_trung_binh: Annotated[float, Field(alias="giaTrenM2TrungBinh")]


class ThongKeTheoTinhThanh(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    tinh_thanh: Annotated[str, Field(alias="tinhThanh")]
    so_luong: Annotated[int, Field(alias="soLuong")]
    gia_thue_trung_binh: Annotated[float, Field(alias="giaThueTrungBinh")]


class ThongKePhanBoGia(BaseModel):
    """Một khoảng giá trong biểu đồ phân bố giá thuê (histogram)."""

    model_config = ConfigDict(populate_by_name=True)

    khoang_gia: Annotated[str, Field(alias="khoangGia")]
    so_luong: Annotated[int, Field(alias="soLuong")]


class ThongKeTongQuanResponse(BaseModel):
    """Thống kê tổng quan cho dashboard quản trị — xem quy tắc tính ở route `thong_ke_tong_quan`."""

    model_config = ConfigDict(populate_by_name=True)

    tong_so_tin_dang: Annotated[int, Field(alias="tongSoTinDang")]
    tong_so_tin_da_duyet: Annotated[int, Field(alias="tongSoTinDaDuyet")]
    gia_thue_trung_binh: Annotated[float, Field(alias="giaThueTrungBinh")]
    dien_tich_trung_binh: Annotated[float, Field(alias="dienTichTrungBinh")]
    gia_tren_m2_trung_binh: Annotated[float, Field(alias="giaTrenM2TrungBinh")]
    theo_loai_bat_dong_san: Annotated[list[ThongKeTheoLoai], Field(alias="theoLoaiBatDongSan")]
    theo_tinh_thanh: Annotated[list[ThongKeTheoTinhThanh], Field(alias="theoTinhThanh")]
    khu_vuc_nhieu_tin_nhat: Annotated[ThongKeTheoTinhThanh | None, Field(alias="khuVucNhieuTinNhat")]
    phan_bo_gia: Annotated[list[ThongKePhanBoGia], Field(alias="phanBoGia")]


class SoSanhKhuVucItem(BaseModel):
    """Số liệu giá thuê của 1 quận/huyện trong màn so sánh khu vực.

    `gia_*` là `None` khi khu vực không có tin nào hợp lệ (đã duyệt, giá/diện tích > 0) — frontend
    phải hiển thị rõ "không có dữ liệu" thay vì suy diễn/kết luận từ con số rỗng.
    """

    model_config = ConfigDict(populate_by_name=True)

    quan_huyen_id: Annotated[int, Field(alias="quanHuyenId")]
    quan_huyen: Annotated[str, Field(alias="quanHuyen")]
    tinh_thanh: Annotated[str, Field(alias="tinhThanh")]
    so_luong: Annotated[int, Field(alias="soLuong")]
    gia_thue_trung_binh: Annotated[float | None, Field(alias="giaThueTrungBinh")]
    gia_thue_trung_vi: Annotated[float | None, Field(alias="giaThueTrungVi")]
    gia_tren_m2_trung_binh: Annotated[float | None, Field(alias="giaTrenM2TrungBinh")]
    mau_nho: Annotated[
        bool,
        Field(alias="mauNho", description="True khi khu vực có tin nhưng số lượng quá ít, số liệu dễ lệch."),
    ]


class SoSanhKhuVucResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    nguong_mau_nho: Annotated[
        int,
        Field(alias="nguongMauNho", description="Số tin tối thiểu để không bị coi là mẫu nhỏ."),
    ]
    ket_qua: Annotated[list[SoSanhKhuVucItem], Field(alias="ketQua")]
