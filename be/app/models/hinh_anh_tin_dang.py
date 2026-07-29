from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class HinhAnhTinDang(Base):
    __tablename__ = "hinh_anh_tin_dang"

    id: Mapped[int] = mapped_column(primary_key=True)
    tin_dang_id: Mapped[int] = mapped_column(ForeignKey("tin_dang.id"), nullable=False)
    duong_dan_anh: Mapped[str] = mapped_column(String(500), nullable=False)
    thu_tu_hien_thi: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    la_anh_dai_dien: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    tin_dang: Mapped["TinDang"] = relationship(back_populates="hinh_anh")
