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
