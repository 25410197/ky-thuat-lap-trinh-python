from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class NguoiDungTomTat(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    ho_ten: Annotated[str, Field(alias="hoTen")]
    email: str


class TinDangNganGach(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: int
    tieu_de: Annotated[str, Field(alias="tieuDe")]
    is_blocked: Annotated[bool, Field(default=False, alias="isBlocked")]
    trang_thai: Annotated[str | None, Field(default=None, alias="trangThai")]



class BaoCaoTomTat(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    ly_do: Annotated[str, Field(alias="lyDo")]
    trang_thai: Annotated[str, Field(alias="trangThai")]
    ngay_bao_cao: Annotated[datetime, Field(alias="ngayBaoCao")]
    nguoi_bao_cao: Annotated[NguoiDungTomTat, Field(alias="nguoiBaoCao")]
    tin_dang: Annotated[TinDangNganGach, Field(alias="tinDang")]


class DanhSachBaoCao(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[BaoCaoTomTat]
    total: int
    page: int
    page_size: Annotated[int, Field(alias="pageSize")]


class BaoCaoChiTiet(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    ly_do: Annotated[str, Field(alias="lyDo")]
    mo_ta: Annotated[str | None, Field(alias="moTa")]
    trang_thai: Annotated[str, Field(alias="trangThai")]
    ngay_bao_cao: Annotated[datetime, Field(alias="ngayBaoCao")]
    nguoi_bao_cao: Annotated[NguoiDungTomTat, Field(alias="nguoiBaoCao")]
    tin_dang: Annotated[TinDangNganGach, Field(alias="tinDang")]
    nguoi_xu_ly: Annotated[NguoiDungTomTat | None, Field(alias="nguoiXuLy")]
    ngay_xu_ly: Annotated[datetime | None, Field(alias="ngayXuLy")]
    ghi_chu_xu_ly: Annotated[str | None, Field(alias="ghiChuXuLy")]


class BaoCaoProcessRequest(BaseModel):
    action: str  # 'RESOLVED' or 'REJECTED'
    ghi_chu_xu_ly: str = Field(..., alias="ghiChuXuLy")
    khoa_tin: bool = Field(False, alias="khoaTin")
    ly_do_khoa: str | None = Field(None, alias="lyDoKhoa")


class BaoCaoCreateRequest(BaseModel):
    ly_do: str = Field(..., alias="lyDo")
    mo_ta: str | None = Field(None, alias="moTa")
