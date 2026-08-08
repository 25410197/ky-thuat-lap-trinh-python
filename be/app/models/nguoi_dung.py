from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TrangThaiNguoiDung, VaiTroNguoiDung


class NguoiDung(Base):
    __tablename__ = "nguoi_dung"

    id: Mapped[int] = mapped_column(primary_key=True)
    ho_ten: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    mat_khau_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    so_dien_thoai: Mapped[str | None] = mapped_column(String(20))
    vai_tro: Mapped[VaiTroNguoiDung] = mapped_column(
        Enum(VaiTroNguoiDung, name="vai_tro_nguoi_dung", native_enum=False, length=20),
        default=VaiTroNguoiDung.NGUOI_DUNG,
        nullable=False,
    )
    trang_thai: Mapped[TrangThaiNguoiDung] = mapped_column(
        Enum(TrangThaiNguoiDung, name="trang_thai_nguoi_dung", native_enum=False, length=20),
        default=TrangThaiNguoiDung.CHO_XAC_MINH,
        nullable=False,
    )
    ngay_tao: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ngay_cap_nhat: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    tin_dang: Mapped[list["TinDang"]] = relationship(
        back_populates="nguoi_dang", foreign_keys="TinDang.nguoi_dang_id"
    )
    tin_yeu_thich: Mapped[list["TinYeuThich"]] = relationship(back_populates="nguoi_dung")
    bao_cao_da_gui: Mapped[list["BaoCao"]] = relationship(
        back_populates="nguoi_bao_cao", foreign_keys="BaoCao.nguoi_bao_cao_id"
    )
    anh_thu_vien: Mapped[list["AnhThuVien"]] = relationship(back_populates="nguoi_dung")
