import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models import LoaiBatDongSan, NguoiDung, PhuongXaMoi, TinDang
from app.models.enums import TrangThaiLoaiBatDongSan, TrangThaiTinDang, VaiTroNguoiDung

client = TestClient(app)


def _dang_ky_va_lay_token() -> tuple[int, str]:
    email = f"test-loai-bds-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/auth/register",
        json={"fullName": "Người Kiểm Thử", "email": email, "password": "matkhau123"},
    )
    body = response.json()
    return int(body["user"]["id"]), body["accessToken"]


def _thang_vai_tro_admin(nguoi_dung_id: int) -> None:
    db: Session = SessionLocal()
    try:
        nguoi_dung = db.get(NguoiDung, nguoi_dung_id)
        nguoi_dung.vai_tro = VaiTroNguoiDung.QUAN_TRI
        db.commit()
    finally:
        db.close()


def _dang_ky_admin() -> tuple[int, str]:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    _thang_vai_tro_admin(nguoi_dung_id)
    return nguoi_dung_id, token


def _xoa_nguoi_dung(*id_list: int) -> None:
    db: Session = SessionLocal()
    try:
        db.query(NguoiDung).filter(NguoiDung.id.in_(id_list)).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def _xoa_loai_bat_dong_san(*id_list: int) -> None:
    db: Session = SessionLocal()
    try:
        db.query(LoaiBatDongSan).filter(LoaiBatDongSan.id.in_(id_list)).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def _lay_trang_thai(loai_id: int) -> TrangThaiLoaiBatDongSan:
    db: Session = SessionLocal()
    try:
        return db.get(LoaiBatDongSan, loai_id).trang_thai
    finally:
        db.close()


def test_quan_tri_khong_dang_nhap_bi_tu_choi() -> None:
    response = client.get("/api/loai-bat-dong-san/quan-tri")
    assert response.status_code == 401


def test_quan_tri_khong_phai_admin_bi_tu_choi() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    try:
        response = client.get(
            "/api/loai-bat-dong-san/quan-tri", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403

        response = client.post(
            "/api/loai-bat-dong-san",
            json={"name": f"KhongPhaiAdmin-{uuid.uuid4().hex[:8]}"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
    finally:
        _xoa_nguoi_dung(nguoi_dung_id)


def test_admin_tao_sua_va_doi_trang_thai_loai_bat_dong_san() -> None:
    admin_id, token = _dang_ky_admin()
    headers = {"Authorization": f"Bearer {token}"}
    ten = f"LoaiKiemThu-{uuid.uuid4().hex[:8]}"
    loai_id = None
    try:
        tao_response = client.post("/api/loai-bat-dong-san", json={"name": ten}, headers=headers)
        assert tao_response.status_code == 201
        body = tao_response.json()
        loai_id = body["id"]
        assert body["status"] == "active"
        assert body["inUse"] is False

        # Tên trùng (không phân biệt hoa/thường) bị từ chối
        trung_response = client.post(
            "/api/loai-bat-dong-san", json={"name": ten.upper()}, headers=headers
        )
        assert trung_response.status_code == 409

        # Sửa tên thành công
        ten_moi = f"{ten}-Sua"
        sua_response = client.put(
            f"/api/loai-bat-dong-san/{loai_id}", json={"name": ten_moi}, headers=headers
        )
        assert sua_response.status_code == 200
        assert sua_response.json()["ten"] == ten_moi

        # Loại đang hoạt động, xuất hiện trong danh sách công khai
        cong_khai = client.get("/api/loai-bat-dong-san").json()
        assert any(row["ten"] == ten_moi for row in cong_khai)

        # Ẩn loại
        an_response = client.patch(f"/api/loai-bat-dong-san/{loai_id}/trang-thai", headers=headers)
        assert an_response.status_code == 200
        assert an_response.json()["status"] == "hidden"
        assert _lay_trang_thai(loai_id) == TrangThaiLoaiBatDongSan.AN

        # Loại bị ẩn không còn xuất hiện trong danh sách công khai (form tạo tin mới)
        cong_khai_sau_an = client.get("/api/loai-bat-dong-san").json()
        assert not any(row["ten"] == ten_moi for row in cong_khai_sau_an)

        # Kích hoạt lại
        kich_hoat_response = client.patch(
            f"/api/loai-bat-dong-san/{loai_id}/trang-thai", headers=headers
        )
        assert kich_hoat_response.status_code == 200
        assert kich_hoat_response.json()["status"] == "active"
    finally:
        if loai_id:
            _xoa_loai_bat_dong_san(loai_id)
        _xoa_nguoi_dung(admin_id)


def test_dang_tin_khong_the_tu_tao_loai_bat_dong_san_moi() -> None:
    """Người đăng tin (không phải admin) không được tự thêm loại bất động sản mới qua form đăng tin."""
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    try:
        payload = {
            "title": "Tin kiểm thử loại BĐS không hợp lệ",
            "propertyType": f"LoaiKhongTonTai-{uuid.uuid4().hex[:8]}",
            "areaM2": 20,
            "priceVnd": 1_000_000,
            "phuongXaMoiId": 1,
            "address": "Địa chỉ kiểm thử",
            "description": "Mô tả kiểm thử",
            "anhChinhId": 1,
            "anhPhuId": [],
            "amenities": [],
            "contactName": "Người kiểm thử",
            "contactPhone": "0900000000",
            "contactMethod": "call",
            "bedrooms": 1,
            "bathrooms": 1,
        }
        response = client.post(
            "/api/rental-posts", json=payload, headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400

        so_luong_loai = SessionLocal()
        try:
            assert (
                so_luong_loai.query(LoaiBatDongSan)
                .filter(LoaiBatDongSan.ten == payload["propertyType"])
                .first()
                is None
            )
        finally:
            so_luong_loai.close()
    finally:
        _xoa_nguoi_dung(nguoi_dung_id)


def test_loai_bat_dong_san_dang_su_dung_hien_thi_dung_trong_quan_tri() -> None:
    admin_id, token = _dang_ky_admin()
    try:
        loai_dang_dung = (
            SessionLocal().query(TinDang).first()
        )
        assert loai_dang_dung is not None, "cần có ít nhất 1 tin đăng đã seed để test"

        response = client.get(
            "/api/loai-bat-dong-san/quan-tri",
            params={"page_size": 100},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        items = response.json()["items"]
        loai_item = next(row for row in items if row["id"] == loai_dang_dung.loai_bat_dong_san_id)
        assert loai_item["inUse"] is True
    finally:
        _xoa_nguoi_dung(admin_id)
