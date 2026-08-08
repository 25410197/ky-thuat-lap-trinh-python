from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

phuong_xa_anh_xa = Table(
    "phuong_xa_anh_xa",
    Base.metadata,
    Column("phuong_xa_id", ForeignKey("phuong_xa.id"), primary_key=True),
    Column("phuong_xa_moi_id", ForeignKey("phuong_xa_moi.id"), primary_key=True),
)


class TinhThanh(Base):
    __tablename__ = "tinh_thanh"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    quan_huyen: Mapped[list["QuanHuyen"]] = relationship(back_populates="tinh_thanh")
    xa_phuong_moi: Mapped[list["PhuongXaMoi"]] = relationship(back_populates="tinh_thanh")


class QuanHuyen(Base):
    __tablename__ = "quan_huyen"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), nullable=False)
    tinh_thanh_id: Mapped[int] = mapped_column(ForeignKey("tinh_thanh.id"), nullable=False)

    tinh_thanh: Mapped["TinhThanh"] = relationship(back_populates="quan_huyen")
    phuong_xa: Mapped[list["PhuongXa"]] = relationship(back_populates="quan_huyen")


class PhuongXa(Base):
    """Phường/xã theo địa giới CŨ — trước đợt sáp nhập tỉnh/xã 07/2025 (3 cấp: tỉnh/huyện/xã).

    `tin_dang.phuong_xa_id` luôn trỏ vào đây, không đổi theo mode lọc.
    """

    __tablename__ = "phuong_xa"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), nullable=False)
    ma_hanh_chinh: Mapped[str | None] = mapped_column(String(20), unique=True)
    quan_huyen_id: Mapped[int] = mapped_column(ForeignKey("quan_huyen.id"), nullable=False)

    quan_huyen: Mapped["QuanHuyen"] = relationship(back_populates="phuong_xa")
    tin_dang: Mapped[list["TinDang"]] = relationship(back_populates="phuong_xa")
    xa_phuong_moi: Mapped[list["PhuongXaMoi"]] = relationship(
        secondary=phuong_xa_anh_xa, back_populates="phuong_xa_cu"
    )


class PhuongXaMoi(Base):
    """Xã/phường theo địa giới MỚI — sau đợt sáp nhập 07/2025 (2 cấp: tỉnh/xã, không còn quận/huyện).

    Một xã/phường mới có thể gộp từ nhiều phường/xã cũ (quan hệ N-N với `PhuongXa`
    vì trên thực tế một vài phường/xã cũ bị chia về nhiều xã/phường mới khác nhau).
    """

    __tablename__ = "phuong_xa_moi"

    id: Mapped[int] = mapped_column(primary_key=True)
    ten: Mapped[str] = mapped_column(String(100), nullable=False)
    ma_hanh_chinh: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    tinh_thanh_id: Mapped[int] = mapped_column(ForeignKey("tinh_thanh.id"), nullable=False)

    tinh_thanh: Mapped["TinhThanh"] = relationship(back_populates="xa_phuong_moi")
    phuong_xa_cu: Mapped[list["PhuongXa"]] = relationship(
        secondary=phuong_xa_anh_xa, back_populates="xa_phuong_moi"
    )
