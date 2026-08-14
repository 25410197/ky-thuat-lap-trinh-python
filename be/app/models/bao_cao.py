from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TrangThaiBaoCao


class BaoCao(Base):
    __tablename__ = "bao_cao"

    id: Mapped[int] = mapped_column(primary_key=True)
    tin_dang_id: Mapped[int] = mapped_column(ForeignKey("tin_dang.id"), nullable=False)
    nguoi_bao_cao_id: Mapped[int] = mapped_column(ForeignKey("nguoi_dung.id"), nullable=False)
    ly_do: Mapped[str] = mapped_column(String(150), nullable=False)
    mo_ta: Mapped[str | None] = mapped_column(Text)
    trang_thai: Mapped[TrangThaiBaoCao] = mapped_column(
        Enum(TrangThaiBaoCao, name="trang_thai_bao_cao", native_enum=False, length=20),
        default=TrangThaiBaoCao.CHO_XU_LY,
        nullable=False,
    )
    nguoi_xu_ly_id: Mapped[int | None] = mapped_column(ForeignKey("nguoi_dung.id"))
    ghi_chu_xu_ly: Mapped[str | None] = mapped_column(Text)
    ngay_bao_cao: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ngay_xu_ly: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    tin_dang: Mapped["TinDang"] = relationship(back_populates="bao_cao")
    nguoi_bao_cao: Mapped["NguoiDung"] = relationship(
        back_populates="bao_cao_da_gui", foreign_keys=[nguoi_bao_cao_id]
    )
    nguoi_xu_ly: Mapped["NguoiDung | None"] = relationship(foreign_keys=[nguoi_xu_ly_id])
