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

        assert isinstance(body["giaThueTrungBinh"], (int, float))
        assert isinstance(body["dienTichTrungBinh"], (int, float))
        assert isinstance(body["giaTrenM2TrungBinh"], (int, float))
        assert body["giaThueTrungBinh"] >= 0
        assert body["dienTichTrungBinh"] >= 0
        assert body["giaTrenM2TrungBinh"] >= 0

        assert isinstance(body["theoLoaiBatDongSan"], list)
        for muc in body["theoLoaiBatDongSan"]:
            assert muc["soLuong"] > 0
            assert muc["giaThueTrungBinh"] > 0
            assert muc["dienTichTrungBinh"] > 0
            assert muc["giaTrenM2TrungBinh"] > 0

        assert isinstance(body["theoTinhThanh"], list)
        tong_theo_tinh_thanh = sum(muc["soLuong"] for muc in body["theoTinhThanh"])
        assert tong_theo_tinh_thanh <= body["tongSoTinDaDuyet"]
        for muc in body["theoTinhThanh"]:
            assert muc["giaThueTrungBinh"] > 0

        khu_vuc_nhieu_nhat = body["khuVucNhieuTinNhat"]
        if body["theoTinhThanh"]:
            assert khu_vuc_nhieu_nhat is not None
            assert khu_vuc_nhieu_nhat["soLuong"] == max(
                muc["soLuong"] for muc in body["theoTinhThanh"]
            )
        else:
            assert khu_vuc_nhieu_nhat is None

        assert isinstance(body["phanBoGia"], list)
        assert len(body["phanBoGia"]) == 6
        for khoang in body["phanBoGia"]:
            assert isinstance(khoang["khoangGia"], str) and khoang["khoangGia"]
            assert isinstance(khoang["soLuong"], int)
            assert khoang["soLuong"] >= 0
        tong_theo_khoang_gia = sum(khoang["soLuong"] for khoang in body["phanBoGia"])
        tong_theo_loai = sum(muc["soLuong"] for muc in body["theoLoaiBatDongSan"])
        assert tong_theo_khoang_gia == tong_theo_loai
    finally:
        _xoa_nguoi_dung(admin_id)


def _lay_2_quan_huyen_cung_tinh() -> list[int]:
    """Lấy 2 ID quận/huyện thuộc cùng 1 tỉnh/thành có sẵn trong dữ liệu (endpoint công khai)."""
    danh_sach_tinh = client.get("/api/tinh-thanh").json()
    for tinh in danh_sach_tinh:
        quan_huyen = client.get(f"/api/tinh-thanh/{tinh['id']}/quan-huyen").json()
        if len(quan_huyen) >= 2:
            return [quan_huyen[0]["id"], quan_huyen[1]["id"]]
    raise AssertionError("Không có tỉnh/thành nào đủ 2 quận/huyện để test.")


def test_so_sanh_khu_vuc_khong_dang_nhap_bi_tu_choi() -> None:
    quan_huyen_ids = _lay_2_quan_huyen_cung_tinh()
    response = client.get(
        "/api/thong-ke/so-sanh-khu-vuc",
        params={"quan_huyen_id": quan_huyen_ids},
    )
    assert response.status_code == 401


def test_so_sanh_khu_vuc_khong_phai_admin_bi_tu_choi() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    try:
        quan_huyen_ids = _lay_2_quan_huyen_cung_tinh()
        response = client.get(
            "/api/thong-ke/so-sanh-khu-vuc",
            params={"quan_huyen_id": quan_huyen_ids},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
    finally:
        _xoa_nguoi_dung(nguoi_dung_id)


def test_so_sanh_khu_vuc_id_khong_ton_tai_tra_ve_404() -> None:
    admin_id, token = _dang_ky_admin()
    try:
        response = client.get(
            "/api/thong-ke/so-sanh-khu-vuc",
            params={"quan_huyen_id": [999_999_999]},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 404
    finally:
        _xoa_nguoi_dung(admin_id)


def test_so_sanh_khu_vuc_tra_ve_dung_cau_truc() -> None:
    admin_id, token = _dang_ky_admin()
    try:
        quan_huyen_ids = _lay_2_quan_huyen_cung_tinh()
        response = client.get(
            "/api/thong-ke/so-sanh-khu-vuc",
            params={"quan_huyen_id": quan_huyen_ids},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        body = response.json()

        assert isinstance(body["nguongMauNho"], int) and body["nguongMauNho"] > 0
        assert isinstance(body["ketQua"], list)
        assert len(body["ketQua"]) == len(quan_huyen_ids)
        # Giữ đúng thứ tự đã chọn.
        assert [muc["quanHuyenId"] for muc in body["ketQua"]] == quan_huyen_ids

        for muc in body["ketQua"]:
            assert isinstance(muc["quanHuyen"], str) and muc["quanHuyen"]
            assert isinstance(muc["tinhThanh"], str) and muc["tinhThanh"]
            assert isinstance(muc["soLuong"], int) and muc["soLuong"] >= 0

            if muc["soLuong"] == 0:
                assert muc["giaThueTrungBinh"] is None
                assert muc["giaThueTrungVi"] is None
                assert muc["giaTrenM2TrungBinh"] is None
                assert muc["mauNho"] is False
            else:
                assert muc["giaThueTrungBinh"] > 0
                assert muc["giaThueTrungVi"] > 0
                assert muc["giaTrenM2TrungBinh"] > 0
                assert muc["mauNho"] == (muc["soLuong"] < body["nguongMauNho"])
    finally:
        _xoa_nguoi_dung(admin_id)


def test_so_sanh_khu_vuc_loc_theo_loai_bat_dong_san() -> None:
    admin_id, token = _dang_ky_admin()
    try:
        quan_huyen_ids = _lay_2_quan_huyen_cung_tinh()
        loai = client.get("/api/loai-bat-dong-san").json()
        assert loai, "Cần có ít nhất 1 loại bất động sản để test lọc."

        response = client.get(
            "/api/thong-ke/so-sanh-khu-vuc",
            params={"quan_huyen_id": quan_huyen_ids, "loai_bat_dong_san_id": loai[0]["id"]},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        body = response.json()
        assert len(body["ketQua"]) == len(quan_huyen_ids)
    finally:
        _xoa_nguoi_dung(admin_id)
