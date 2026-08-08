"""Seed dữ liệu mẫu: admin, loại BĐS, tiện ích, tỉnh/quận/phường, tin đăng.

Dữ liệu hành chính (tỉnh/quận/huyện/phường/xã) là dữ liệu THẬT cho Hà Nội, Đà Nẵng,
TP.HCM — cả cấu trúc trước và sau đợt sáp nhập 07/2025, lấy từ Provinces Open API và
lưu sẵn trong app/scripts/data/ (xem app/scripts/data/README.md để biết nguồn + giới hạn).

Chạy: python -m app.scripts.seed
An toàn khi chạy lại nhiều lần cho dữ liệu tra cứu và admin (get-or-create). Riêng dữ liệu
hành chính + tin đăng mẫu sẽ được XÓA VÀ TẠO LẠI mỗi lần chạy — vì đây là dữ liệu demo,
không phải dữ liệu người dùng thật, và cần luôn khớp với dữ liệu nguồn mới nhất.
"""

import json
import random
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import (
    BaoCao,
    HinhAnhTinDang,
    LoaiBatDongSan,
    NguoiDung,
    PhuongXa,
    PhuongXaMoi,
    QuanHuyen,
    TienIch,
    TinDang,
    TinYeuThich,
    TinhThanh,
    phuong_xa_anh_xa,
    tin_dang_tien_ich,
)
from app.models.enums import (
    PhuongThucLienHe,
    TrangThaiNguoiDung,
    TrangThaiTinDang,
    VaiTroNguoiDung,
)

RANDOM_SEED = 42
DATA_DIR = Path(__file__).parent / "data"

LOAI_BAT_DONG_SAN_MAC_DINH = [
    {"ten": "Phòng trọ", "mo_ta": "Phòng cho thuê trong nhà trọ, khép kín hoặc chung chủ"},
    {"ten": "Căn hộ", "mo_ta": "Căn hộ chung cư hoặc căn hộ dịch vụ"},
    {"ten": "Nhà nguyên căn", "mo_ta": "Thuê nguyên căn nhà, không chung chủ"},
]

TIEN_ICH_MAC_DINH = [
    "WiFi miễn phí",
    "Chỗ đậu xe",
    "Thang máy",
    "Bảo vệ 24/7",
    "Nội thất cơ bản",
    "Máy lạnh",
]

KHOANG_GIA_DIEN_TICH = {
    "Phòng trọ": {"gia": (1_500_000, 4_000_000), "dien_tich": (16, 30)},
    "Căn hộ": {"gia": (5_000_000, 15_000_000), "dien_tich": (35, 70)},
    "Nhà nguyên căn": {"gia": (8_000_000, 25_000_000), "dien_tich": (60, 150)},
}

TEN_LIEN_HE_MAU = ["Anh Minh", "Chị Lan", "Anh Tuấn", "Chị Hoa", "Anh Phúc", "Chị Ngọc"]

SO_TIN_DANG_CAN_SEED = 40


def seed_admin(db: Session) -> NguoiDung:
    settings = get_settings()
    admin = db.query(NguoiDung).filter(NguoiDung.email == settings.seed_admin_email).first()
    if admin:
        return admin

    admin = NguoiDung(
        ho_ten="Quản trị viên",
        email=settings.seed_admin_email,
        mat_khau_hash=hash_password(settings.seed_admin_password),
        vai_tro=VaiTroNguoiDung.QUAN_TRI,
        trang_thai=TrangThaiNguoiDung.HOAT_DONG,
    )
    db.add(admin)
    db.flush()
    print(f"  + Tạo admin: {admin.email}")
    return admin


def seed_loai_bat_dong_san(db: Session) -> list[LoaiBatDongSan]:
    ket_qua = []
    for item in LOAI_BAT_DONG_SAN_MAC_DINH:
        loai = db.query(LoaiBatDongSan).filter(LoaiBatDongSan.ten == item["ten"]).first()
        if not loai:
            loai = LoaiBatDongSan(ten=item["ten"], mo_ta=item["mo_ta"])
            db.add(loai)
            db.flush()
            print(f"  + Tạo loại bất động sản: {loai.ten}")
        ket_qua.append(loai)
    return ket_qua


def seed_tien_ich(db: Session) -> list[TienIch]:
    ket_qua = []
    for ten in TIEN_ICH_MAC_DINH:
        tien_ich = db.query(TienIch).filter(TienIch.ten == ten).first()
        if not tien_ich:
            tien_ich = TienIch(ten=ten)
            db.add(tien_ich)
            db.flush()
            print(f"  + Tạo tiện ích: {tien_ich.ten}")
        ket_qua.append(tien_ich)
    return ket_qua


def _doc_json(ten_file: str):
    with open(DATA_DIR / ten_file, encoding="utf-8") as f:
        return json.load(f)


def _xoa_du_lieu_cu(db: Session) -> None:
    """Xóa tin đăng mẫu + dữ liệu hành chính cũ để seed lại từ đầu bằng dữ liệu thật.

    Đây là dữ liệu demo (không phải dữ liệu người dùng thật) nên mỗi lần chạy seed sẽ
    reset toàn bộ thay vì get-or-create, đảm bảo luôn khớp với dữ liệu nguồn mới nhất
    trong app/scripts/data/.
    """
    print("Xóa tin đăng mẫu + dữ liệu hành chính cũ...")
    db.query(BaoCao).delete()
    db.query(TinYeuThich).delete()
    db.query(HinhAnhTinDang).delete()
    db.execute(tin_dang_tien_ich.delete())
    db.query(TinDang).delete()
    db.execute(phuong_xa_anh_xa.delete())
    db.query(PhuongXaMoi).delete()
    db.query(PhuongXa).delete()
    db.query(QuanHuyen).delete()
    db.query(TinhThanh).delete()
    db.flush()


def seed_dia_diem(db: Session) -> list[PhuongXa]:
    """Seed dữ liệu hành chính thật cho Hà Nội, Đà Nẵng, TP.HCM — cả cấu trúc CŨ (trước
    sáp nhập 07/2025, 3 cấp: tỉnh/huyện/xã) và MỚI (sau sáp nhập, 2 cấp: tỉnh/xã), kèm
    bảng ánh xạ N-N giữa phường/xã cũ và xã/phường mới. Xem app/scripts/data/README.md.
    """
    dia_chinh_cu = _doc_json("dia_chinh_cu.json")
    dia_chinh_moi = _doc_json("dia_chinh_moi.json")
    anh_xa = _doc_json("anh_xa_cu_moi.json")

    tinh_thanh_theo_ten: dict[str, TinhThanh] = {}
    phuong_xa_theo_ma: dict[str, PhuongXa] = {}
    phuong_xa_moi_theo_ma: dict[str, PhuongXaMoi] = {}

    for tinh_data in dia_chinh_cu:
        tinh = TinhThanh(ten=tinh_data["ten"])
        db.add(tinh)
        db.flush()
        tinh_thanh_theo_ten[tinh_data["ten"]] = tinh

        for quan_data in tinh_data["quan_huyen"]:
            quan = QuanHuyen(ten=quan_data["ten"], tinh_thanh_id=tinh.id)
            db.add(quan)
            db.flush()

            for phuong_data in quan_data["phuong_xa"]:
                phuong = PhuongXa(
                    ten=phuong_data["ten"],
                    ma_hanh_chinh=phuong_data["ma_hanh_chinh"],
                    quan_huyen_id=quan.id,
                )
                db.add(phuong)
                db.flush()
                phuong_xa_theo_ma[phuong_data["ma_hanh_chinh"]] = phuong

    # Xã/phường MỚI thuộc thẳng tỉnh — dùng lại đúng TinhThanh vừa tạo ở trên vì tên
    # 3 tỉnh này không đổi qua đợt sáp nhập (chỉ mở rộng địa giới + bỏ cấp huyện).
    for tinh_data in dia_chinh_moi:
        tinh = tinh_thanh_theo_ten.get(tinh_data["ten"])
        if tinh is None:
            tinh = TinhThanh(ten=tinh_data["ten"])
            db.add(tinh)
            db.flush()
            tinh_thanh_theo_ten[tinh_data["ten"]] = tinh

        for xa_data in tinh_data["xa_phuong"]:
            xa_moi = PhuongXaMoi(
                ten=xa_data["ten"],
                ma_hanh_chinh=xa_data["ma_hanh_chinh"],
                tinh_thanh_id=tinh.id,
            )
            db.add(xa_moi)
            db.flush()
            phuong_xa_moi_theo_ma[xa_data["ma_hanh_chinh"]] = xa_moi

    hang_anh_xa = []
    so_bo_qua = 0
    for cap in anh_xa:
        phuong = phuong_xa_theo_ma.get(cap["phuong_xa_cu"])
        xa_moi = phuong_xa_moi_theo_ma.get(cap["phuong_xa_moi"])
        if phuong is None or xa_moi is None:
            so_bo_qua += 1
            continue
        hang_anh_xa.append({"phuong_xa_id": phuong.id, "phuong_xa_moi_id": xa_moi.id})
    if hang_anh_xa:
        db.execute(phuong_xa_anh_xa.insert(), hang_anh_xa)

    n_quan = sum(len(t["quan_huyen"]) for t in dia_chinh_cu)
    print(
        f"  + Tạo {len(tinh_thanh_theo_ten)} tỉnh/thành, {n_quan} quận/huyện, "
        f"{len(phuong_xa_theo_ma)} phường/xã (cũ), {len(phuong_xa_moi_theo_ma)} xã/phường (mới), "
        f"{len(hang_anh_xa)} cặp ánh xạ."
    )
    if so_bo_qua:
        print(f"  ! Bỏ qua {so_bo_qua} cặp ánh xạ không khớp dữ liệu (thuộc tỉnh ngoài phạm vi seed).")

    return list(phuong_xa_theo_ma.values())


def seed_tin_dang(
    db: Session,
    admin: NguoiDung,
    danh_sach_loai: list[LoaiBatDongSan],
    danh_sach_tien_ich: list[TienIch],
    danh_sach_phuong: list[PhuongXa],
) -> None:
    rng = random.Random(RANDOM_SEED)

    for i in range(1, SO_TIN_DANG_CAN_SEED + 1):
        loai = rng.choice(danh_sach_loai)
        phuong = rng.choice(danh_sach_phuong)
        khoang = KHOANG_GIA_DIEN_TICH[loai.ten]
        gia_thue = rng.randrange(khoang["gia"][0], khoang["gia"][1], 100_000)
        dien_tich = rng.randint(*khoang["dien_tich"])
        so_nha = rng.randint(1, 200)

        tin_dang = TinDang(
            tieu_de=f"{loai.ten} cho thuê tại {phuong.ten} #{i}",
            mo_ta=(
                f"{loai.ten} rộng {dien_tich}m², vị trí {phuong.ten}, "
                "gần chợ và trường học, thích hợp cho người đi làm hoặc sinh viên."
            ),
            gia_thue=gia_thue,
            dien_tich=dien_tich,
            dia_chi_chi_tiet=f"Số {so_nha} đường {phuong.ten}",
            loai_bat_dong_san_id=loai.id,
            phuong_xa_id=phuong.id,
            nguoi_dang_id=admin.id,
            ten_nguoi_lien_he=rng.choice(TEN_LIEN_HE_MAU),
            so_dien_thoai_lien_he=f"09{rng.randint(10_000_000, 99_999_999)}",
            phuong_thuc_lien_he_uu_tien=rng.choice(list(PhuongThucLienHe)),
            trang_thai=TrangThaiTinDang.DA_DUYET if i <= 35 else TrangThaiTinDang.CHO_DUYET,
        )
        tin_dang.tien_ich = rng.sample(danh_sach_tien_ich, k=rng.randint(2, 3))
        db.add(tin_dang)
        db.flush()

        for thu_tu in range(2):
            db.add(
                HinhAnhTinDang(
                    tin_dang_id=tin_dang.id,
                    duong_dan_anh=f"https://picsum.photos/seed/tin-dang-{tin_dang.id}-{thu_tu}/800/600",
                    thu_tu_hien_thi=thu_tu,
                    la_anh_dai_dien=(thu_tu == 0),
                )
            )

    print(f"  + Tạo {SO_TIN_DANG_CAN_SEED} tin đăng mẫu.")


def main() -> None:
    db = SessionLocal()
    try:
        print("Seed admin...")
        admin = seed_admin(db)

        print("Seed loại bất động sản...")
        danh_sach_loai = seed_loai_bat_dong_san(db)

        print("Seed tiện ích...")
        danh_sach_tien_ich = seed_tien_ich(db)

        _xoa_du_lieu_cu(db)

        print("Seed tỉnh/quận/phường (dữ liệu thật, cả cũ và mới)...")
        danh_sach_phuong = seed_dia_diem(db)

        print("Seed tin đăng mẫu...")
        seed_tin_dang(db, admin, danh_sach_loai, danh_sach_tien_ich, danh_sach_phuong)

        db.commit()
        print("Hoàn tất seed dữ liệu.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
