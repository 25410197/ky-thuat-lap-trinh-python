from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class TinDangTomTat(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    tieu_de: Annotated[str, Field(alias="tieuDe")]
    gia_thue: Annotated[float, Field(alias="giaThue")]
    dien_tich: Annotated[float, Field(alias="dienTich")]
    dia_chi_chi_tiet: Annotated[str, Field(alias="diaChiChiTiet")]
    loai_bat_dong_san: Annotated[str, Field(alias="loaiBatDongSan")]
    phuong_xa: Annotated[str, Field(alias="phuongXa")]
    quan_huyen: Annotated[str, Field(alias="quanHuyen")]
    tinh_thanh: Annotated[str, Field(alias="tinhThanh")]
    anh_dai_dien: Annotated[str | None, Field(alias="anhDaiDien")]
    tien_ich: Annotated[list[str], Field(alias="tienIch")]
    ngay_dang: Annotated[datetime, Field(alias="ngayDang")]


class DanhSachTinDang(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[TinDangTomTat]
    total: int
    page: int
    page_size: Annotated[int, Field(alias="pageSize")]


class TinDangCuaToiResponse(BaseModel):
    id: str
    title: str
    description: str
    priceVnd: float
    address: str
    city: str
    bedrooms: int
    bathrooms: int
    areaM2: float
    coverImageUrl: str | None
    status: str
    ownerId: str
    createdAt: str

class DangTinRequest(BaseModel):
    title: str
    propertyType: str
    areaM2: float
    priceVnd: float
    phuongXaMoiId: int
    address: str
    description: str
    anhChinh: str
    anhPhu: list[str] = []
    amenities: list[str]
    contactName: str
    contactPhone: str
    contactMethod: str
    bedrooms: int
    bathrooms: int


class TinDangChiTiet(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    tieu_de: Annotated[str, Field(alias="tieuDe")]
    mo_ta: Annotated[str, Field(alias="moTa")]
    gia_thue: Annotated[float, Field(alias="giaThue")]
    dien_tich: Annotated[float, Field(alias="dienTich")]
    dia_chi_chi_tiet: Annotated[str, Field(alias="diaChiChiTiet")]
    loai_bat_dong_san: Annotated[str, Field(alias="loaiBatDongSan")]
    phuong_xa: Annotated[str, Field(alias="phuongXa")]
    quan_huyen: Annotated[str, Field(alias="quanHuyen")]
    tinh_thanh: Annotated[str, Field(alias="tinhThanh")]
    hinh_anh: Annotated[list[str], Field(alias="hinhAnh")]
    tien_ich: Annotated[list[str], Field(alias="tienIch")]
    ten_nguoi_lien_he: Annotated[str, Field(alias="tenNguoiLienHe")]
    so_dien_thoai_lien_he: Annotated[str, Field(alias="soDienThoaiLienHe")]
    phuong_thuc_lien_he_uu_tien: Annotated[str, Field(alias="phuongThucLienHeUuTien")]
    luot_xem: Annotated[int, Field(alias="luotXem")]
    ngay_dang: Annotated[datetime, Field(alias="ngayDang")]
