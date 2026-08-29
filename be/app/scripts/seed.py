"""Seed dữ liệu mẫu: admin, thành viên nhóm, loại BĐS, tiện ích, tỉnh/quận/phường, tin đăng.

Dữ liệu hành chính (tỉnh/quận/huyện/phường/xã) là dữ liệu THẬT cho Hà Nội, Đà Nẵng,
TP.HCM — cả cấu trúc trước và sau đợt sáp nhập 07/2025, lấy từ Provinces Open API và
lưu sẵn trong app/scripts/data/ (xem app/scripts/data/README.md để biết nguồn + giới hạn).

Chạy: python -m app.scripts.seed
An toàn khi chạy lại nhiều lần cho dữ liệu tra cứu, admin và thành viên (get-or-create). Riêng
dữ liệu hành chính + tin đăng mẫu sẽ được XÓA VÀ TẠO LẠI mỗi lần chạy — vì đây là dữ liệu demo,
không phải dữ liệu người dùng thật, và cần luôn khớp với dữ liệu nguồn mới nhất.

Tài khoản thành viên demo (mật khẩu chung: Member@123):
  - minhhai@example.com      (Tô Minh Hải)
  - hoaitien@example.com     (Nguyễn Hoài Tiến)
  - minhanh@example.com      (Nguyễn Minh Anh)
  - phuongtrinh@example.com  (Trần Thị Phương Trinh)

Ngoài ra seed thêm ~16 tài khoản người dùng demo (cùng mật khẩu Member@123, xem
NGUOI_DUNG_DEMO_BO_SUNG) để trang quản trị người dùng có đủ dữ liệu test tìm kiếm/phân
trang/khóa-mở khóa — trạng thái đa dạng (hoạt động, chờ xác minh, bị khóa).
"""

import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import (
    AnhThuVien,
    BaiViet,
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
    TrangThaiBaiViet,
    TrangThaiNguoiDung,
    TrangThaiTinDang,
    VaiTroNguoiDung,
)

RANDOM_SEED = 42
DATA_DIR = Path(__file__).parent / "data"

# ~20 id ảnh nhà/căn hộ/nội thất/kiến trúc THẬT trên picsum.photos — chọn tay, xem trực tiếp
# từng ảnh trước khi đưa vào đây (không lấy id ngẫu nhiên). Mục đích: ảnh đại diện tin đăng
# luôn liên quan tới bất động sản, không còn ra đàn guitar/xe cổ/quả mâm xôi như trước.
PICSUM_ID_NHA_O = [
    42, 49, 57, 76, 122, 142, 146, 188, 206, 236, 257, 283, 288, 299, 311, 322, 369, 397, 398,
    405, 428, 437, 445,
]

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

# Bài viết tin tức thị trường mẫu — nội dung thật (không lorem), get-or-create theo slug.
BAI_VIET_MAU = [
    {
        "tieu_de": "Giá thuê căn hộ tại các thành phố lớn tăng nhẹ trong quý gần đây",
        "slug": "gia-thue-can-ho-tang-nhe-quy-gan-day",
        "tom_tat": "Giá thuê căn hộ ở Hà Nội, TP.HCM và Đà Nẵng nhích lên do nhu cầu ở thực tăng, trong khi phòng trọ và nhà nguyên căn khá ổn định.",
        "noi_dung_html": (
            "<p>Theo tổng hợp từ các tin đăng trên hệ thống, giá thuê căn hộ tại ba thành phố lớn "
            "— Hà Nội, TP. Hồ Chí Minh và Đà Nẵng — có xu hướng tăng nhẹ so với giai đoạn trước. "
            "Nguyên nhân chính đến từ nhu cầu thuê ở thực của người đi làm và sinh viên quay lại "
            "thành phố sau kỳ nghỉ dài.</p>"
            "<h2>Vì sao giá căn hộ tăng nhanh hơn các loại hình khác</h2>"
            "<p>Khác với phòng trọ và nhà nguyên căn vốn có nguồn cung phân tán ở nhiều khu vực, "
            "căn hộ chung cư tập trung ở một số dự án nhất định nên nhạy hơn với biến động cung cầu. "
            "Khi tỷ lệ lấp đầy tại các dự án gần trung tâm hoặc gần khu công nghiệp tăng, chủ nhà có "
            "xu hướng điều chỉnh giá thuê theo mặt bằng chung của khu vực.</p>"
            "<ul>"
            "<li>Căn hộ gần trung tâm, gần trường học: nhu cầu ổn định quanh năm.</li>"
            "<li>Căn hộ gần khu công nghiệp: tăng theo mùa tuyển dụng.</li>"
            "<li>Phòng trọ, nhà nguyên căn: giá ít biến động hơn do nguồn cung đa dạng.</li>"
            "</ul>"
            "<p>Người thuê nên theo dõi biến động giá theo khu vực cụ thể thay vì chỉ nhìn mặt bằng "
            "chung toàn thành phố, vì chênh lệch giữa các quận/huyện có thể khá lớn.</p>"
        ),
    },
    {
        "tieu_de": "5 kinh nghiệm tìm phòng trọ cho sinh viên mới nhập học",
        "slug": "kinh-nghiem-tim-phong-tro-cho-sinh-vien",
        "tom_tat": "Tổng hợp 5 kinh nghiệm thực tế giúp sinh viên năm nhất tìm phòng trọ phù hợp, an toàn và đúng ngân sách.",
        "noi_dung_html": (
            "<p>Đầu năm học là thời điểm nhu cầu tìm phòng trọ tăng mạnh, đặc biệt quanh khu vực "
            "các trường đại học. Dưới đây là một số kinh nghiệm giúp sinh viên, nhất là tân sinh viên, "
            "tìm được phòng phù hợp mà không mất quá nhiều thời gian.</p>"
            "<h2>Xác định ngân sách trước khi tìm</h2>"
            "<p>Nên dành tối đa 30–35% chi phí sinh hoạt hàng tháng cho tiền phòng, để còn khoản dự "
            "phòng cho ăn uống, đi lại và học tập. Dùng bộ lọc giá trên trang tìm kiếm để không mất "
            "thời gian xem những phòng vượt ngân sách.</p>"
            "<h2>Ưu tiên khoảng cách tới trường hơn diện tích</h2>"
            "<p>Một phòng nhỏ hơn nhưng gần trường thường tiết kiệm hơn về lâu dài so với phòng rộng "
            "nhưng xa, vì chi phí đi lại và thời gian di chuyển cộng dồn mỗi ngày là không nhỏ.</p>"
            "<ul>"
            "<li>Xem kỹ ảnh thật và mô tả tiện ích trước khi liên hệ.</li>"
            "<li>Hỏi rõ tiền điện nước, wifi có tính riêng hay đã gồm trong giá thuê.</li>"
            "<li>Đến xem phòng trực tiếp, tránh chuyển tiền cọc khi chưa xem nhà.</li>"
            "<li>Đọc kỹ điều khoản hợp đồng, đặc biệt điều kiện hoàn cọc.</li>"
            "<li>Ưu tiên phòng có người quen từng ở hoặc đánh giá tốt.</li>"
            "</ul>"
        ),
    },
    {
        "tieu_de": "So sánh chi phí thuê nhà giữa khu vực trung tâm và ngoại thành",
        "slug": "so-sanh-chi-phi-thue-nha-trung-tam-va-ngoai-thanh",
        "tom_tat": "Chênh lệch giá thuê giữa khu trung tâm và ngoại thành có thể lên tới 40–50%, nhưng cần cân nhắc thêm chi phí đi lại.",
        "noi_dung_html": (
            "<p>Một câu hỏi phổ biến của người đi thuê là nên chọn nhà ở trung tâm với giá cao, hay "
            "chấp nhận ở xa hơn để tiết kiệm chi phí thuê. Bài viết này tổng hợp một số điểm cần cân "
            "nhắc dựa trên dữ liệu tin đăng thực tế trên hệ thống.</p>"
            "<h2>Chênh lệch giá theo khoảng cách tới trung tâm</h2>"
            "<p>Nhìn chung, giá thuê ở các quận trung tâm cao hơn khu vực ngoại thành từ 40% đến 50% "
            "với cùng diện tích và loại hình. Tuy nhiên khoảng cách xa hơn đồng nghĩa với chi phí xăng "
            "xe, thời gian di chuyển và đôi khi cả chi phí gửi xe tăng thêm.</p>"
            "<h2>Khi nào nên chọn ngoại thành</h2>"
            "<p>Nếu công việc cho phép làm việc linh hoạt hoặc gần các khu công nghiệp ở ngoại thành, "
            "việc thuê nhà xa trung tâm sẽ hợp lý hơn về tổng chi phí sinh hoạt. Ngược lại, nếu di "
            "chuyển hàng ngày vào trung tâm là bắt buộc, phần tiết kiệm từ giá thuê có thể bị bù trừ "
            "bởi chi phí và thời gian đi lại.</p>"
        ),
    },
]

# Tài khoản thành viên trong nhóm — dữ liệu demo để đăng nhập thử/test, không phải người dùng thật.
MAT_KHAU_THANH_VIEN_MAC_DINH = "Member@123"

THANH_VIEN_MAC_DINH = [
    {"ho_ten": "Tô Minh Hải", "email": "minhhai@example.com", "so_dien_thoai": "0912345671"},
    {"ho_ten": "Nguyễn Hoài Tiến", "email": "hoaitien@example.com", "so_dien_thoai": "0912345672"},
    {"ho_ten": "Nguyễn Minh Anh", "email": "minhanh@example.com", "so_dien_thoai": "0912345673"},
    {"ho_ten": "Trần Thị Phương Trinh", "email": "phuongtrinh@example.com", "so_dien_thoai": "0912345674"},
]

# Người dùng demo bổ sung — chỉ để trang quản trị người dùng có đủ dữ liệu test (tìm kiếm,
# phân trang, khóa/mở khóa). Không phải người dùng thật, không tham gia đăng tin mẫu.
NGUOI_DUNG_DEMO_BO_SUNG = [
    {"ho_ten": "Đặng Thị Hồng Nhung", "email": "hongnhung@example.com", "so_dien_thoai": "0912345675", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Vũ Anh Tuấn", "email": "anhtuan@example.com", "so_dien_thoai": "0912345676", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Phạm Gia Bảo", "email": "giabao@example.com", "so_dien_thoai": "0912345677", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Hoàng Thị Kim Ngân", "email": "kimngan@example.com", "so_dien_thoai": "0912345678", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Bùi Văn Long", "email": "vanlong@example.com", "so_dien_thoai": "0912345679", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Đỗ Thị Mai Anh", "email": "maianh@example.com", "so_dien_thoai": "0912345680", "trang_thai": TrangThaiNguoiDung.CHO_XAC_MINH},
    {"ho_ten": "Ngô Quốc Huy", "email": "quochuy@example.com", "so_dien_thoai": "0912345681", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Dương Thị Thu Hà", "email": "thuha@example.com", "so_dien_thoai": "0912345682", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Lý Hoàng Nam", "email": "hoangnam@example.com", "so_dien_thoai": "0912345683", "trang_thai": TrangThaiNguoiDung.BI_KHOA},
    {"ho_ten": "Trịnh Thị Bích Ngọc", "email": "bichngoc@example.com", "so_dien_thoai": "0912345684", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Phan Đức Thịnh", "email": "ducthinh@example.com", "so_dien_thoai": "0912345685", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Huỳnh Thị Ngọc Diễm", "email": "ngocdiem@example.com", "so_dien_thoai": "0912345686", "trang_thai": TrangThaiNguoiDung.CHO_XAC_MINH},
    {"ho_ten": "Vương Minh Khôi", "email": "minhkhoi@example.com", "so_dien_thoai": "0912345687", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Lâm Thị Thanh Thảo", "email": "thanhthao@example.com", "so_dien_thoai": "0912345688", "trang_thai": TrangThaiNguoiDung.BI_KHOA},
    {"ho_ten": "Đinh Văn Phát", "email": "vanphat@example.com", "so_dien_thoai": "0912345689", "trang_thai": TrangThaiNguoiDung.HOAT_DONG},
    {"ho_ten": "Chu Thị Yến Nhi", "email": "yennhi@example.com", "so_dien_thoai": "0912345690", "trang_thai": TrangThaiNguoiDung.CHO_XAC_MINH},
]


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


def seed_thanh_vien(db: Session) -> list[NguoiDung]:
    """THANH_VIEN_MAC_DINH là roster thật của nhóm (không phải profile người dùng tự sửa),
    nên họ tên/SĐT luôn được đồng bộ lại từ danh sách nguồn kể cả khi tài khoản đã tồn tại —
    khác với trang_thai (có thể đã bị admin khóa/mở khóa tay) thì không đụng vào."""
    ket_qua = []
    for item in THANH_VIEN_MAC_DINH:
        thanh_vien = db.query(NguoiDung).filter(NguoiDung.email == item["email"]).first()
        if thanh_vien:
            thanh_vien.ho_ten = item["ho_ten"]
            thanh_vien.so_dien_thoai = item["so_dien_thoai"]
        else:
            thanh_vien = NguoiDung(
                ho_ten=item["ho_ten"],
                email=item["email"],
                mat_khau_hash=hash_password(MAT_KHAU_THANH_VIEN_MAC_DINH),
                so_dien_thoai=item["so_dien_thoai"],
                vai_tro=VaiTroNguoiDung.NGUOI_DUNG,
                trang_thai=TrangThaiNguoiDung.HOAT_DONG,
            )
            db.add(thanh_vien)
            db.flush()
            print(f"  + Tạo thành viên: {thanh_vien.ho_ten} ({thanh_vien.email})")
        ket_qua.append(thanh_vien)
    return ket_qua


def seed_nguoi_dung_demo_bo_sung(db: Session) -> None:
    """Get-or-create — không ghi đè trạng_thai nếu tài khoản đã tồn tại, vì admin có thể
    đã khóa/mở khóa tài khoản này qua trang quản trị và không nên bị seed reset lại."""
    for item in NGUOI_DUNG_DEMO_BO_SUNG:
        da_ton_tai = db.query(NguoiDung).filter(NguoiDung.email == item["email"]).first()
        if da_ton_tai:
            continue
        nguoi_dung = NguoiDung(
            ho_ten=item["ho_ten"],
            email=item["email"],
            mat_khau_hash=hash_password(MAT_KHAU_THANH_VIEN_MAC_DINH),
            so_dien_thoai=item["so_dien_thoai"],
            vai_tro=VaiTroNguoiDung.NGUOI_DUNG,
            trang_thai=item["trang_thai"],
        )
        db.add(nguoi_dung)
        db.flush()
        print(f"  + Tạo người dùng demo: {nguoi_dung.ho_ten} ({nguoi_dung.email})")


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


def seed_bai_viet(db: Session, admin: NguoiDung) -> None:
    for i, item in enumerate(BAI_VIET_MAU):
        bai_viet = db.query(BaiViet).filter(BaiViet.slug == item["slug"]).first()
        if bai_viet:
            continue
        bai_viet = BaiViet(
            tieu_de=item["tieu_de"],
            slug=item["slug"],
            tom_tat=item["tom_tat"],
            noi_dung_html=item["noi_dung_html"],
            trang_thai=TrangThaiBaiViet.DA_DANG,
            nguoi_tao_id=admin.id,
            ngay_dang=datetime.now(timezone.utc) - timedelta(days=(len(BAI_VIET_MAU) - i) * 2),
        )
        db.add(bai_viet)
        print(f"  + Tạo bài viết: {bai_viet.tieu_de}")


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
    # Không xóa ảnh đang làm ảnh bìa bài viết (bai_viet.anh_bia_id) — bài viết không bị
    # reset mỗi lần seed nên ảnh bìa của nó phải giữ nguyên, tránh lỗi khóa ngoại.
    db.query(AnhThuVien).filter(
        ~AnhThuVien.id.in_(
            db.query(BaiViet.anh_bia_id).filter(BaiViet.anh_bia_id.isnot(None))
        )
    ).delete(synchronize_session=False)
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
    danh_sach_thanh_vien: list[NguoiDung],
    danh_sach_loai: list[LoaiBatDongSan],
    danh_sach_tien_ich: list[TienIch],
    danh_sach_phuong: list[PhuongXa],
) -> None:
    rng = random.Random(RANDOM_SEED)
    # Phần lớn tin đăng thuộc về thành viên (chủ trọ tự đăng), một phần nhỏ do admin đăng hộ
    # — giống thực tế hơn là dồn hết cho admin.
    nguoi_dang_theo_trong_so = danh_sach_thanh_vien * 3 + [admin]

    for i in range(1, SO_TIN_DANG_CAN_SEED + 1):
        loai = rng.choice(danh_sach_loai)
        phuong = rng.choice(danh_sach_phuong)
        khoang = KHOANG_GIA_DIEN_TICH[loai.ten]
        gia_thue = rng.randrange(khoang["gia"][0], khoang["gia"][1], 100_000)
        dien_tich = rng.randint(*khoang["dien_tich"])
        so_nha = rng.randint(1, 200)
        nguoi_dang = rng.choice(nguoi_dang_theo_trong_so)

        if nguoi_dang is admin:
            ten_lien_he = rng.choice(TEN_LIEN_HE_MAU)
            so_dien_thoai_lien_he = f"09{rng.randint(10_000_000, 99_999_999)}"
        else:
            ten_lien_he = nguoi_dang.ho_ten
            so_dien_thoai_lien_he = nguoi_dang.so_dien_thoai

        # 3 tin đầu: is_blocked=True (để demo trang quản trị tin bị khóa)
        # Tin cuối cùng: is_deleted=True (demo soft-delete)
        is_blocked = i <= 3
        is_deleted = i == SO_TIN_DANG_CAN_SEED

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
            nguoi_dang_id=nguoi_dang.id,
            ten_nguoi_lien_he=ten_lien_he,
            so_dien_thoai_lien_he=so_dien_thoai_lien_he,
            phuong_thuc_lien_he_uu_tien=rng.choice(list(PhuongThucLienHe)),
            trang_thai=TrangThaiTinDang.DA_DUYET if i <= 35 else TrangThaiTinDang.CHO_DUYET,
            is_blocked=is_blocked,
            is_deleted=is_deleted,
            ly_do_khoa="Vi phạm nội dung cho thuê" if is_blocked else None,
        )
        tin_dang.tien_ich = rng.sample(danh_sach_tien_ich, k=rng.randint(2, 3))
        db.add(tin_dang)
        db.flush()

        for thu_tu in range(2):
            url = f"https://picsum.photos/id/{rng.choice(PICSUM_ID_NHA_O)}/800/600"
            anh_thu_vien = AnhThuVien(
                nguoi_dung_id=nguoi_dang.id,
                ten_doi_tuong=f"tin-dang-{tin_dang.id}-{thu_tu}.jpg",
                duong_dan_anh=url,
                ten_tep_goc=f"tin-dang-{tin_dang.id}-{thu_tu}.jpg",
                dung_luong=0,
            )
            db.add(anh_thu_vien)
            db.flush()
            db.add(
                HinhAnhTinDang(
                    tin_dang_id=tin_dang.id,
                    anh_thu_vien_id=anh_thu_vien.id,
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

        print("Seed thành viên nhóm...")
        danh_sach_thanh_vien = seed_thanh_vien(db)

        print("Seed người dùng demo bổ sung...")
        seed_nguoi_dung_demo_bo_sung(db)

        print("Seed loại bất động sản...")
        danh_sach_loai = seed_loai_bat_dong_san(db)

        print("Seed tiện ích...")
        danh_sach_tien_ich = seed_tien_ich(db)

        _xoa_du_lieu_cu(db)

        print("Seed tỉnh/quận/phường (dữ liệu thật, cả cũ và mới)...")
        danh_sach_phuong = seed_dia_diem(db)

        print("Seed tin đăng mẫu...")
        seed_tin_dang(db, admin, danh_sach_thanh_vien, danh_sach_loai, danh_sach_tien_ich, danh_sach_phuong)

        print("Seed bài viết tin tức thị trường...")
        seed_bai_viet(db, admin)

        db.commit()
        print("Hoàn tất seed dữ liệu.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
