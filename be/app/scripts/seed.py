"""Seed dữ liệu mẫu: admin, loại BĐS, tiện ích, tỉnh/quận/phường, tin đăng.

Chạy: python -m app.scripts.seed
An toàn khi chạy lại nhiều lần (get-or-create cho dữ liệu tra cứu và admin;
tin đăng mẫu chỉ được tạo nếu bảng tin_dang đang trống).
"""

import random

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import (
    HinhAnhTinDang,
    LoaiBatDongSan,
    NguoiDung,
    PhuongXa,
    QuanHuyen,
    TienIch,
    TinDang,
    TinhThanh,
)
from app.models.enums import (
    PhuongThucLienHe,
    TrangThaiNguoiDung,
    TrangThaiTinDang,
    VaiTroNguoiDung,
)

RANDOM_SEED = 42

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

# tỉnh -> quận -> [phường]
DIA_DIEM_MAU = {
    "Thành phố Hồ Chí Minh": {
        "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao"],
        "Quận 3": ["Phường 6", "Phường 7", "Phường Võ Thị Sáu"],
        "Thành phố Thủ Đức": ["Phường Linh Trung", "Phường Bình Thọ"],
    },
    "Hà Nội": {
        "Quận Ba Đình": ["Phường Điện Biên", "Phường Kim Mã"],
        "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Nghĩa Đô"],
    },
    "Đà Nẵng": {
        "Quận Hải Châu": ["Phường Hải Châu 1", "Phường Thạch Thang"],
        "Quận Thanh Khê": ["Phường Thanh Khê Tây", "Phường Xuân Hà"],
    },
}

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


def seed_dia_diem(db: Session) -> list[PhuongXa]:
    danh_sach_phuong = []
    for ten_tinh, quan_huyen_map in DIA_DIEM_MAU.items():
        tinh = db.query(TinhThanh).filter(TinhThanh.ten == ten_tinh).first()
        if not tinh:
            tinh = TinhThanh(ten=ten_tinh)
            db.add(tinh)
            db.flush()
            print(f"  + Tạo tỉnh/thành: {tinh.ten}")

        for ten_quan, ten_phuong_list in quan_huyen_map.items():
            quan = (
                db.query(QuanHuyen)
                .filter(QuanHuyen.ten == ten_quan, QuanHuyen.tinh_thanh_id == tinh.id)
                .first()
            )
            if not quan:
                quan = QuanHuyen(ten=ten_quan, tinh_thanh_id=tinh.id)
                db.add(quan)
                db.flush()
                print(f"    + Tạo quận/huyện: {quan.ten}")

            for ten_phuong in ten_phuong_list:
                phuong = (
                    db.query(PhuongXa)
                    .filter(PhuongXa.ten == ten_phuong, PhuongXa.quan_huyen_id == quan.id)
                    .first()
                )
                if not phuong:
                    phuong = PhuongXa(ten=ten_phuong, quan_huyen_id=quan.id)
                    db.add(phuong)
                    db.flush()
                    print(f"      + Tạo phường/xã: {phuong.ten}")
                danh_sach_phuong.append(phuong)

    return danh_sach_phuong


def seed_tin_dang(
    db: Session,
    admin: NguoiDung,
    danh_sach_loai: list[LoaiBatDongSan],
    danh_sach_tien_ich: list[TienIch],
    danh_sach_phuong: list[PhuongXa],
) -> None:
    if db.query(TinDang).count() > 0:
        print("  · Đã có tin đăng, bỏ qua seed tin đăng mẫu.")
        return

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

        print("Seed tỉnh/quận/phường...")
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
