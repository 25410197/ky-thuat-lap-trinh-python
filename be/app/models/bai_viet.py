from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TrangThaiBaiViet


class BaiViet(Base):
    """Bài viết tin tức thị trường — admin soạn bằng rich-text, người dùng xem công khai."""

    __tablename__ = "bai_viet"

    id: Mapped[int] = mapped_column(primary_key=True)
    tieu_de: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False, index=True)
    tom_tat: Mapped[str] = mapped_column(String(200), nullable=False)
    noi_dung_html: Mapped[str] = mapped_column(Text, nullable=False)

    anh_bia_id: Mapped[int | None] = mapped_column(ForeignKey("anh_thu_vien.id"))
    trang_thai: Mapped[TrangThaiBaiViet] = mapped_column(
        Enum(TrangThaiBaiViet, name="trang_thai_bai_viet", native_enum=False, length=20),
        default=TrangThaiBaiViet.NHAP,
        nullable=False,
    )
    nguoi_tao_id: Mapped[int] = mapped_column(ForeignKey("nguoi_dung.id"), nullable=False)
    luot_xem: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ngay_dang: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    anh_bia: Mapped["AnhThuVien | None"] = relationship("AnhThuVien")
    nguoi_tao: Mapped["NguoiDung"] = relationship("NguoiDung")
