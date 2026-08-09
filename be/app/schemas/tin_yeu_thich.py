from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.tin_dang import TinDangTomTat


class DanhSachYeuThich(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[TinDangTomTat]
    total: int
    page: int
    page_size: Annotated[int, Field(alias="pageSize")]
