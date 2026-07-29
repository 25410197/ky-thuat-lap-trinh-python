from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TinhThanh(Base):
    __tablename__ = "tinh_thanh"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    quan_huyen: Mapped[list["QuanHuyen"]] = relationship(back_populates="tinh_thanh")


class QuanHuyen(Base):
    __tablename__ = "quan_huyen"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), nullable=False)
    tinh_thanh_id: Mapped[int] = mapped_column(ForeignKey("tinh_thanh.id"), nullable=False)

    tinh_thanh: Mapped["TinhThanh"] = relationship(back_populates="quan_huyen")
    phuong_xa: Mapped[list["PhuongXa"]] = relationship(back_populates="quan_huyen")


class PhuongXa(Base):
    __tablename__ = "phuong_xa"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), nullable=False)
    quan_huyen_id: Mapped[int] = mapped_column(ForeignKey("quan_huyen.id"), nullable=False)

    quan_huyen: Mapped["QuanHuyen"] = relationship(back_populates="phuong_xa")
    tin_dang: Mapped[list["TinDang"]] = relationship(back_populates="phuong_xa")
