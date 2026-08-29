from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import VaiTroNguoiDung
from app.models.nguoi_dung import NguoiDung

_VAI_TRO_SANG_ROLE: dict[VaiTroNguoiDung, str] = {
    VaiTroNguoiDung.NGUOI_DUNG: "user",
    VaiTroNguoiDung.QUAN_TRI: "admin",
}


class DangKyRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ho_ten: Annotated[str, Field(alias="fullName", min_length=2, max_length=150)]
    email: EmailStr
    mat_khau: Annotated[str, Field(alias="password", min_length=6, max_length=72)]


class DangNhapRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr
    mat_khau: Annotated[str, Field(alias="password", min_length=1)]


class NguoiDungCongKhai(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    ho_ten: Annotated[str, Field(alias="fullName")]
    email: str
    vai_tro: Annotated[str, Field(alias="role")]
    so_dien_thoai: Annotated[str | None, Field(alias="phone")] = None

    @classmethod
    def tu_nguoi_dung(cls, nguoi_dung: NguoiDung) -> "NguoiDungCongKhai":
        return cls(
            id=str(nguoi_dung.id),
            ho_ten=nguoi_dung.ho_ten,
            email=nguoi_dung.email,
            vai_tro=_VAI_TRO_SANG_ROLE[nguoi_dung.vai_tro],
            so_dien_thoai=nguoi_dung.so_dien_thoai,
        )


class PhienDangNhap(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    access_token: Annotated[str, Field(alias="accessToken")]
    user: NguoiDungCongKhai


class CapNhatHoSoRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ho_ten: Annotated[str, Field(alias="fullName", min_length=2, max_length=150)]
    so_dien_thoai: Annotated[str | None, Field(alias="phone", max_length=20)] = None


class DoiMatKhauRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mat_khau_hien_tai: Annotated[str, Field(alias="currentPassword", min_length=1)]
    mat_khau_moi: Annotated[str, Field(alias="newPassword", min_length=6, max_length=72)]
