from datetime import datetime

from pydantic import BaseModel


class TinDangTomTat(BaseModel):
    id: int
    tieu_de: str
    gia_thue: float
    dien_tich: float
    dia_chi_chi_tiet: str
    loai_bat_dong_san: str
    phuong_xa: str
    quan_huyen: str
    tinh_thanh: str
    anh_dai_dien: str | None
    tien_ich: list[str]
    ngay_dang: datetime


class DanhSachTinDang(BaseModel):
    items: list[TinDangTomTat]
    total: int
    page: int
    page_size: int


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
    province: str
    ward: str
    address: str
    description: str
    images: list[str] = []
    amenities: list[str]
    contactName: str
    contactPhone: str
    contactMethod: str
    bedrooms: int
    bathrooms: int
