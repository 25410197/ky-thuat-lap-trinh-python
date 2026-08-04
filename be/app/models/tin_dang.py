from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import PhuongThucLienHe, TrangThaiTinDang


class TinDang(Base):
    __tablename__ = "tin_dang"

    id: Mapped[int] = mapped_column(primary_key=True)
    tieu_de: Mapped[str] = mapped_column(String(150), nullable=False)
    mo_ta: Mapped[str] = mapped_column(Text, nullable=False)
    gia_thue: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    dien_tich: Mapped[float] = mapped_column(Numeric(8, 2),nullable=False)
    phong_ngu: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    phong_tam: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    dia_chi_chi_tiet: Mapped[str] = mapped_column(String(255), nullable=False)

    loai_bat_dong_san_id: Mapped[int] = mapped_column(
        ForeignKey("loai_bat_dong_san.id"), nullable=False
    )
    phuong_xa_id: Mapped[int] = mapped_column(ForeignKey("phuong_xa.id"), nullable=False)
    nguoi_dang_id: Mapped[int] = mapped_column(ForeignKey("nguoi_dung.id"), nullable=False)

    ten_nguoi_lien_he: Mapped[str] = mapped_column(String(100), nullable=False)
    so_dien_thoai_lien_he: Mapped[str] = mapped_column(String(20), nullable=False)
    phuong_thuc_lien_he_uu_tien: Mapped[PhuongThucLienHe] = mapped_column(
        Enum(PhuongThucLienHe, name="phuong_thuc_lien_he", native_enum=False, length=20),
        default=PhuongThucLienHe.GOI_DIEN,
        nullable=False,
    )

    trang_thai: Mapped[TrangThaiTinDang] = mapped_column(
        Enum(TrangThaiTinDang, name="trang_thai_tin_dang", native_enum=False, length=20),
        default=TrangThaiTinDang.CHO_DUYET,
        nullable=False,
    )
    ly_do_khoa: Mapped[str | None] = mapped_column(String(255))
    luot_xem: Mapped[int] = mapped_column(default=0, nullable=False)

    ngay_dang: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ngay_cap_nhat: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    loai_bat_dong_san: Mapped["LoaiBatDongSan"] = relationship(back_populates="tin_dang")
    phuong_xa: Mapped["PhuongXa"] = relationship(back_populates="tin_dang")
    nguoi_dang: Mapped["NguoiDung"] = relationship(
        back_populates="tin_dang", foreign_keys=[nguoi_dang_id]
    )

    hinh_anh: Mapped[list["HinhAnhTinDang"]] = relationship(
        back_populates="tin_dang", cascade="all, delete-orphan"
    )
    tien_ich: Mapped[list["TienIch"]] = relationship(
        secondary="tin_dang_tien_ich", back_populates="tin_dang"
    )
    yeu_thich_boi: Mapped[list["TinYeuThich"]] = relationship(back_populates="tin_dang")
    bao_cao: Mapped[list["BaoCao"]] = relationship(back_populates="tin_dang")
