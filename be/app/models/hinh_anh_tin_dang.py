from sqlalchemy import Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class HinhAnhTinDang(Base):
    """Bảng nối tin đăng ↔ ảnh trong thư viện — giữ thứ tự hiển thị + đánh dấu ảnh đại diện.

    Không lưu URL trực tiếp; ảnh thật nằm ở `AnhThuVien` (thư viện cá nhân), có thể dùng
    lại cho nhiều tin đăng khác nhau.
    """

    __tablename__ = "hinh_anh_tin_dang"

    id: Mapped[int] = mapped_column(primary_key=True)
    tin_dang_id: Mapped[int] = mapped_column(ForeignKey("tin_dang.id"), nullable=False)
    anh_thu_vien_id: Mapped[int] = mapped_column(ForeignKey("anh_thu_vien.id"), nullable=False)
    thu_tu_hien_thi: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    la_anh_dai_dien: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    tin_dang: Mapped["TinDang"] = relationship(back_populates="hinh_anh")
    anh_thu_vien: Mapped["AnhThuVien"] = relationship(back_populates="hinh_anh_tin_dang")
