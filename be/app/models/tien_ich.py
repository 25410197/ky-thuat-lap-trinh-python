from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

tin_dang_tien_ich = Table(
    "tin_dang_tien_ich",
    Base.metadata,
    Column("tin_dang_id", ForeignKey("tin_dang.id"), primary_key=True),
    Column("tien_ich_id", ForeignKey("tien_ich.id"), primary_key=True),
)


class TienIch(Base):
    __tablename__ = "tien_ich"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    tin_dang: Mapped[list["TinDang"]] = relationship(
        secondary=tin_dang_tien_ich, back_populates="tien_ich"
    )
