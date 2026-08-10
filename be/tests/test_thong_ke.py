import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models import NguoiDung
from app.models.enums import VaiTroNguoiDung

client = TestClient(app)


def _dang_ky_va_lay_token() -> tuple[int, str]:
    email = f"test-thong-ke-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/auth/register",
        json={"fullName": "Người Kiểm Thử", "email": email, "password": "matkhau123"},
    )
    body = response.json()
    return int(body["user"]["id"]), body["accessToken"]


def _dang_ky_admin() -> tuple[int, str]:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    db: Session = SessionLocal()
    try:
        nguoi_dung = db.get(NguoiDung, nguoi_dung_id)
        nguoi_dung.vai_tro = VaiTroNguoiDung.QUAN_TRI
        db.commit()
    finally:
        db.close()
    return nguoi_dung_id, token


def _xoa_nguoi_dung(*id_list: int) -> None:
    db: Session = SessionLocal()
    try:
        db.query(NguoiDung).filter(NguoiDung.id.in_(id_list)).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def test_khong_dang_nhap_bi_tu_choi() -> None:
    response = client.get("/api/thong-ke/tong-quan")
    assert response.status_code == 401


def test_khong_phai_admin_bi_tu_choi() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    try:
        response = client.get(
            "/api/thong-ke/tong-quan", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
    finally:
        _xoa_nguoi_dung(nguoi_dung_id)


def test_admin_lay_duoc_thong_ke_tong_quan() -> None:
    admin_id, token = _dang_ky_admin()
    try:
        response = client.get(
            "/api/thong-ke/tong-quan", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        body = response.json()

        assert isinstance(body["tongSoTinDang"], int)
        assert isinstance(body["tongSoTinDaDuyet"], int)
        assert body["tongSoTinDang"] >= body["tongSoTinDaDuyet"] >= 0

        assert isinstance(body["theoLoaiBatDongSan"], list)
        for muc in body["theoLoaiBatDongSan"]:
            assert muc["soLuong"] > 0
            assert muc["giaThueTrungBinh"] > 0
            assert muc["dienTichTrungBinh"] > 0
            assert muc["giaTrenM2TrungBinh"] > 0

        assert isinstance(body["theoTinhThanh"], list)
        tong_theo_tinh_thanh = sum(muc["soLuong"] for muc in body["theoTinhThanh"])
        assert tong_theo_tinh_thanh <= body["tongSoTinDaDuyet"]

        khu_vuc_nhieu_nhat = body["khuVucNhieuTinNhat"]
        if body["theoTinhThanh"]:
            assert khu_vuc_nhieu_nhat is not None
            assert khu_vuc_nhieu_nhat["soLuong"] == max(
                muc["soLuong"] for muc in body["theoTinhThanh"]
            )
        else:
            assert khu_vuc_nhieu_nhat is None
    finally:
        _xoa_nguoi_dung(admin_id)
