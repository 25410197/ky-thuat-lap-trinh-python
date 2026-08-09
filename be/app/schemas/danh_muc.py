from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TrangThaiLoaiBatDongSan
from app.models.loai_bat_dong_san import LoaiBatDongSan

_TRANG_THAI_SANG_STATUS_EN: dict[TrangThaiLoaiBatDongSan, str] = {
    TrangThaiLoaiBatDongSan.HOAT_DONG: "active",
    TrangThaiLoaiBatDongSan.AN: "hidden",
}


class LoaiBatDongSanTomTat(BaseModel):
    id: int
    ten: str


class TinhThanhTomTat(BaseModel):
    id: int
    ten: str


class QuanHuyenTomTat(BaseModel):
    id: int
    ten: str


class PhuongXaMoiTomTat(BaseModel):
    id: int
    ten: str


class LoaiBatDongSanQuanTri(BaseModel):
    """Loại bất động sản kèm trạng thái — dùng cho màn quản trị."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    ten: str
    trang_thai: Annotated[str, Field(alias="status")]
    dang_su_dung: Annotated[bool, Field(alias="inUse")]

    @classmethod
    def tu_model(cls, loai: LoaiBatDongSan, dang_su_dung: bool) -> "LoaiBatDongSanQuanTri":
        return cls(
            id=loai.id,
            ten=loai.ten,
            trang_thai=_TRANG_THAI_SANG_STATUS_EN[loai.trang_thai],
            dang_su_dung=dang_su_dung,
        )


class DanhSachLoaiBatDongSanQuanTri(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[LoaiBatDongSanQuanTri]
    total: int
    page: int
    page_size: Annotated[int, Field(alias="pageSize")]


class LoaiBatDongSanTaoRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ten: Annotated[str, Field(alias="name", min_length=1, max_length=100)]


class LoaiBatDongSanSuaRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ten: Annotated[str, Field(alias="name", min_length=1, max_length=100)]
