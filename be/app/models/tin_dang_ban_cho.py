from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Numeric, String, Text, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import PhuongThucLienHe


class TinDangBanCho(Base):
    """Bản chỉnh sửa đang chờ admin duyệt của 1 tin đăng đã công khai (DA_DUYET).

    Khi chủ tin sửa 1 tin đã duyệt, nội dung MỚI được lưu vào đây thay vì ghi đè thẳng lên
    `tin_dang` — nhờ vậy người dùng khác vẫn thấy bản đang công khai (chưa đổi) cho đến khi admin
    duyệt bản sửa này. Mỗi tin_dang chỉ giữ 1 bản chờ (sửa nhiều lần trước khi được duyệt thì ghi
    đè bản chờ cũ). Khi admin duyệt, dữ liệu ở đây được copy đè lên `tin_dang` rồi xoá dòng này;
    khi admin từ chối hoặc chủ tin tự huỷ, chỉ cần xoá dòng này — `tin_dang` không đổi gì.
    """

    __tablename__ = "tin_dang_ban_cho"

    id: Mapped[int] = mapped_column(primary_key=True)
    tin_dang_id: Mapped[int] = mapped_column(
        ForeignKey("tin_dang.id", ondelete="CASCADE"), nullable=False, unique=True
    )

    tieu_de: Mapped[str] = mapped_column(String(150), nullable=False)
    mo_ta: Mapped[str] = mapped_column(Text, nullable=False)
    gia_thue: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    dien_tich: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False)
    phong_ngu: Mapped[int] = mapped_column(Integer, nullable=False)
    phong_tam: Mapped[int] = mapped_column(Integer, nullable=False)
    dia_chi_chi_tiet: Mapped[str] = mapped_column(String(255), nullable=False)
    loai_bat_dong_san_id: Mapped[int] = mapped_column(ForeignKey("loai_bat_dong_san.id"), nullable=False)
    phuong_xa_id: Mapped[int] = mapped_column(ForeignKey("phuong_xa.id"), nullable=False)
    ten_nguoi_lien_he: Mapped[str] = mapped_column(String(100), nullable=False)
    so_dien_thoai_lien_he: Mapped[str] = mapped_column(String(20), nullable=False)
    phuong_thuc_lien_he_uu_tien: Mapped[PhuongThucLienHe] = mapped_column(
        Enum(PhuongThucLienHe, name="phuong_thuc_lien_he", native_enum=False, length=20),
        nullable=False,
    )

    # Quan hệ nhiều-nhiều/1-nhiều lưu dạng JSON vì bản chờ chưa có dòng hinh_anh_tin_dang/tien_ich
    # thật sự (chỉ tạo thật khi admin duyệt).
    tien_ich_ten: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    hinh_anh: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)

    ngay_gui: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tin_dang: Mapped["TinDang"] = relationship()
    loai_bat_dong_san: Mapped["LoaiBatDongSan"] = relationship()
    phuong_xa: Mapped["PhuongXa"] = relationship()
