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


class ThongKeTongQuanResponse(BaseModel):
    """Thống kê tổng quan cho dashboard quản trị — xem quy tắc tính ở route `thong_ke_tong_quan`."""

    model_config = ConfigDict(populate_by_name=True)

    tong_so_tin_dang: Annotated[int, Field(alias="tongSoTinDang")]
    tong_so_tin_da_duyet: Annotated[int, Field(alias="tongSoTinDaDuyet")]
    theo_loai_bat_dong_san: Annotated[list[ThongKeTheoLoai], Field(alias="theoLoaiBatDongSan")]
    theo_tinh_thanh: Annotated[list[ThongKeTheoTinhThanh], Field(alias="theoTinhThanh")]
    khu_vuc_nhieu_tin_nhat: Annotated[ThongKeTheoTinhThanh | None, Field(alias="khuVucNhieuTinNhat")]
