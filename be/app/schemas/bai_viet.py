from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.bai_viet import BaiViet
from app.models.enums import TrangThaiBaiViet

_TRANG_THAI_SANG_STATUS_EN: dict[TrangThaiBaiViet, str] = {
    TrangThaiBaiViet.NHAP: "draft",
    TrangThaiBaiViet.DA_DANG: "published",
    TrangThaiBaiViet.AN: "hidden",
}
_STATUS_EN_SANG_TRANG_THAI: dict[str, TrangThaiBaiViet] = {
    value: key for key, value in _TRANG_THAI_SANG_STATUS_EN.items()
}

StatusBaiViet = Literal["draft", "published", "hidden"]


def trang_thai_tu_status(status: str) -> TrangThaiBaiViet | None:
    return _STATUS_EN_SANG_TRANG_THAI.get(status)


def _anh_bia_url(bai_viet: BaiViet) -> str | None:
    return bai_viet.anh_bia.duong_dan_anh if bai_viet.anh_bia is not None else None


class BaiVietCongKhaiTomTat(BaseModel):
    """Bài viết trong danh sách công khai — không kèm nội dung đầy đủ."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    tieu_de: Annotated[str, Field(alias="title")]
    slug: str
    tom_tat: Annotated[str, Field(alias="excerpt")]
    anh_bia: Annotated[str | None, Field(alias="coverImageUrl")]
    luot_xem: Annotated[int, Field(alias="viewCount")]
    ngay_dang: Annotated[datetime | None, Field(alias="publishedAt")]

    @classmethod
    def tu_model(cls, bai_viet: BaiViet) -> "BaiVietCongKhaiTomTat":
        return cls(
            id=bai_viet.id,
            tieu_de=bai_viet.tieu_de,
            slug=bai_viet.slug,
            tom_tat=bai_viet.tom_tat,
            anh_bia=_anh_bia_url(bai_viet),
            luot_xem=bai_viet.luot_xem,
            ngay_dang=bai_viet.ngay_dang,
        )


class BaiVietCongKhaiChiTiet(BaiVietCongKhaiTomTat):
    """Chi tiết 1 bài viết công khai — kèm nội dung HTML đầy đủ (đã sanitize)."""

    noi_dung_html: Annotated[str, Field(alias="contentHtml")]

    @classmethod
    def tu_model(cls, bai_viet: BaiViet) -> "BaiVietCongKhaiChiTiet":
        return cls(
            id=bai_viet.id,
            tieu_de=bai_viet.tieu_de,
            slug=bai_viet.slug,
            tom_tat=bai_viet.tom_tat,
            anh_bia=_anh_bia_url(bai_viet),
            luot_xem=bai_viet.luot_xem,
            ngay_dang=bai_viet.ngay_dang,
            noi_dung_html=bai_viet.noi_dung_html,
        )


class DanhSachBaiVietCongKhai(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[BaiVietCongKhaiTomTat]
    total: int
    page: int
    page_size: Annotated[int, Field(alias="pageSize")]


class BaiVietQuanTriTomTat(BaseModel):
    """Bài viết trong danh sách quản trị — kèm trạng thái, không kèm nội dung đầy đủ."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    tieu_de: Annotated[str, Field(alias="title")]
    slug: str
    tom_tat: Annotated[str, Field(alias="excerpt")]
    anh_bia: Annotated[str | None, Field(alias="coverImageUrl")]
    trang_thai: Annotated[StatusBaiViet, Field(alias="status")]
    luot_xem: Annotated[int, Field(alias="viewCount")]
    ngay_dang: Annotated[datetime | None, Field(alias="publishedAt")]

    @classmethod
    def tu_model(cls, bai_viet: BaiViet) -> "BaiVietQuanTriTomTat":
        return cls(
            id=bai_viet.id,
            tieu_de=bai_viet.tieu_de,
            slug=bai_viet.slug,
            tom_tat=bai_viet.tom_tat,
            anh_bia=_anh_bia_url(bai_viet),
            trang_thai=_TRANG_THAI_SANG_STATUS_EN[bai_viet.trang_thai],
            luot_xem=bai_viet.luot_xem,
            ngay_dang=bai_viet.ngay_dang,
        )


class BaiVietQuanTriChiTiet(BaiVietQuanTriTomTat):
    """Chi tiết 1 bài viết cho form sửa của admin — kèm nội dung HTML + id ảnh bìa."""

    noi_dung_html: Annotated[str, Field(alias="contentHtml")]
    anh_bia_id: Annotated[int | None, Field(alias="coverImageId")]

    @classmethod
    def tu_model(cls, bai_viet: BaiViet) -> "BaiVietQuanTriChiTiet":
        return cls(
            id=bai_viet.id,
            tieu_de=bai_viet.tieu_de,
            slug=bai_viet.slug,
            tom_tat=bai_viet.tom_tat,
            anh_bia=_anh_bia_url(bai_viet),
            trang_thai=_TRANG_THAI_SANG_STATUS_EN[bai_viet.trang_thai],
            luot_xem=bai_viet.luot_xem,
            ngay_dang=bai_viet.ngay_dang,
            noi_dung_html=bai_viet.noi_dung_html,
            anh_bia_id=bai_viet.anh_bia_id,
        )


class DanhSachBaiVietQuanTri(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: list[BaiVietQuanTriTomTat]
    total: int
    page: int
    page_size: Annotated[int, Field(alias="pageSize")]


class BaiVietTaoRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    tieu_de: Annotated[str, Field(alias="title", min_length=1, max_length=200)]
    slug: Annotated[str | None, Field(max_length=220)] = None
    tom_tat: Annotated[str, Field(alias="excerpt", min_length=1, max_length=200)]
    noi_dung_html: Annotated[str, Field(alias="contentHtml", min_length=1)]
    anh_bia_id: Annotated[int | None, Field(alias="coverImageId")] = None


class BaiVietSuaRequest(BaiVietTaoRequest):
    pass


class BaiVietDoiTrangThaiRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    trang_thai: Annotated[StatusBaiViet, Field(alias="status")]

    def to_enum(self) -> TrangThaiBaiViet:
        return _STATUS_EN_SANG_TRANG_THAI[self.trang_thai]
