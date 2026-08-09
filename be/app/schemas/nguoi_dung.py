from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TrangThaiNguoiDung, VaiTroNguoiDung
from app.models.nguoi_dung import NguoiDung

_VAI_TRO_SANG_ROLE: dict[VaiTroNguoiDung, str] = {
    VaiTroNguoiDung.NGUOI_DUNG: "user",
    VaiTroNguoiDung.QUAN_TRI: "admin",
}

_TRANG_THAI_SANG_STATUS: dict[TrangThaiNguoiDung, str] = {
    TrangThaiNguoiDung.CHO_XAC_MINH: "pending",
    TrangThaiNguoiDung.HOAT_DONG: "active",
    TrangThaiNguoiDung.BI_KHOA: "locked",
}

_STATUS_SANG_TRANG_THAI: dict[str, TrangThaiNguoiDung] = {
    status: trang_thai for trang_thai, status in _TRANG_THAI_SANG_STATUS.items()
}


class NguoiDungAdminTomTat(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    ho_ten: Annotated[str, Field(alias="fullName")]
    email: str
    vai_tro: Annotated[str, Field(alias="role")]
    trang_thai: Annotated[str, Field(alias="status")]
    so_luong_tin_dang: Annotated[int, Field(alias="postCount")]
    ngay_tao: Annotated[datetime, Field(alias="createdAt")]

    @classmethod
    def tu_nguoi_dung(cls, nguoi_dung: NguoiDung, so_luong_tin_dang: int) -> "NguoiDungAdminTomTat":
        return cls(
            id=str(nguoi_dung.id),
            ho_ten=nguoi_dung.ho_ten,
            email=nguoi_dung.email,
            vai_tro=_VAI_TRO_SANG_ROLE[nguoi_dung.vai_tro],
            trang_thai=_TRANG_THAI_SANG_STATUS[nguoi_dung.trang_thai],
            so_luong_tin_dang=so_luong_tin_dang,
            ngay_tao=nguoi_dung.ngay_tao,
        )


class DanhSachNguoiDungAdmin(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[NguoiDungAdminTomTat]
    total: int
    page: int
    page_size: Annotated[int, Field(alias="pageSize")]


class CapNhatTrangThaiNguoiDungRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    trang_thai: Annotated[Literal["active", "locked"], Field(alias="status")]

    def to_enum(self) -> TrangThaiNguoiDung:
        return _STATUS_SANG_TRANG_THAI[self.trang_thai]
