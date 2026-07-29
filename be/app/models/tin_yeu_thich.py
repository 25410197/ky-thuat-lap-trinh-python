from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TinYeuThich(Base):
    __tablename__ = "tin_yeu_thich"
    __table_args__ = (
        UniqueConstraint("nguoi_dung_id", "tin_dang_id", name="uq_nguoi_dung_tin_dang_yeu_thich"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    nguoi_dung_id: Mapped[int] = mapped_column(ForeignKey("nguoi_dung.id"), nullable=False)
    tin_dang_id: Mapped[int] = mapped_column(ForeignKey("tin_dang.id"), nullable=False)
    ngay_luu: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    nguoi_dung: Mapped["NguoiDung"] = relationship(back_populates="tin_yeu_thich")
    tin_dang: Mapped["TinDang"] = relationship(back_populates="yeu_thich_boi")
