from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AnhThuVien(Base):
    """Ảnh trong thư viện cá nhân của người dùng — tải lên 1 lần, dùng lại được cho nhiều tin đăng."""

    __tablename__ = "anh_thu_vien"

    id: Mapped[int] = mapped_column(primary_key=True)
    nguoi_dung_id: Mapped[int] = mapped_column(ForeignKey("nguoi_dung.id"), nullable=False)

    ten_doi_tuong: Mapped[str] = mapped_column(String(255), nullable=False)
    duong_dan_anh: Mapped[str] = mapped_column(String(500), nullable=False)
    ten_tep_goc: Mapped[str] = mapped_column(String(255), nullable=False)
    dung_luong: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    ngay_tai_len: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    nguoi_dung: Mapped["NguoiDung"] = relationship(back_populates="anh_thu_vien")
    hinh_anh_tin_dang: Mapped[list["HinhAnhTinDang"]] = relationship(back_populates="anh_thu_vien")
