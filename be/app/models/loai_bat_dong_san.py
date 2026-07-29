from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LoaiBatDongSan(Base):
    __tablename__ = "loai_bat_dong_san"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    mo_ta: Mapped[str | None] = mapped_column(String(255))

    tin_dang: Mapped[list["TinDang"]] = relationship(back_populates="loai_bat_dong_san")
