from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class AnhThuVienItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    url: Annotated[str, Field(alias="url")]
    ten_tep: Annotated[str, Field(alias="tenTep")]
    dung_luong: Annotated[int, Field(alias="dungLuong")]
    ngay_tai_len: Annotated[datetime, Field(alias="ngayTaiLen")]


class DanhSachAnhThuVien(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[AnhThuVienItem]
    total: int
    page: int
    page_size: Annotated[int, Field(alias="pageSize")]


class DoiTenAnhRequest(BaseModel):
    ten_tep: Annotated[str, Field(alias="tenTep", min_length=1, max_length=255)]

    model_config = ConfigDict(populate_by_name=True)
