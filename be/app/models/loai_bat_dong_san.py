from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TrangThaiLoaiBatDongSan


class LoaiBatDongSan(Base):
    __tablename__ = "loai_bat_dong_san"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    mo_ta: Mapped[str | None] = mapped_column(String(255))
    trang_thai: Mapped[TrangThaiLoaiBatDongSan] = mapped_column(
        Enum(TrangThaiLoaiBatDongSan, name="trang_thai_loai_bat_dong_san", native_enum=False, length=20),
        default=TrangThaiLoaiBatDongSan.HOAT_DONG,
        nullable=False,
    )

    tin_dang: Mapped[list["TinDang"]] = relationship(back_populates="loai_bat_dong_san")
