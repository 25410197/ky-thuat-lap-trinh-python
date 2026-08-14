import uuid
from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models import BaoCao, LoaiBatDongSan, NguoiDung, PhuongXa, TinDang
from app.models.enums import TrangThaiBaoCao, TrangThaiTinDang, VaiTroNguoiDung

client = TestClient(app)


def _dang_ky_va_lay_token() -> tuple[int, str]:
    email = f"test-bao-cao-{uuid.uuid4().hex[:12]}@example.com"
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


def _tao_tin_dang_va_bao_cao() -> tuple[int, int]:
    """Returns (tin_dang_id, bao_cao_id)"""
    db: Session = SessionLocal()
    try:
        nguoi_dang = db.query(NguoiDung).filter(NguoiDung.vai_tro == VaiTroNguoiDung.NGUOI_DUNG).first()
        if not nguoi_dang:
            # Create a dummy user if none exists
            nguoi_dang = NguoiDung(
                ho_ten="Chủ Tin", email=f"chutin-{uuid.uuid4().hex[:8]}@example.com", mat_khau_hash="abc"
            )
            db.add(nguoi_dang)
            db.flush()

        loai = db.query(LoaiBatDongSan).first()
        phuong = db.query(PhuongXa).first()

        tin = TinDang(
            tieu_de=f"Tin đăng bị báo cáo {uuid.uuid4().hex[:8]}",
            mo_ta="Tin đăng vi phạm",
            gia_thue=3000000,
            dien_tich=25,
            dia_chi_chi_tiet="Địa chỉ 123",
            loai_bat_dong_san_id=loai.id,
            phuong_xa_id=phuong.id,
            nguoi_dang_id=nguoi_dang.id,
            ten_nguoi_lien_he="Người liên hệ",
            so_dien_thoai_lien_he="0900000000",
            trang_thai=TrangThaiTinDang.DA_DUYET,
        )
        db.add(tin)
        db.flush()

        nguoi_bao_cao = db.query(NguoiDung).filter(NguoiDung.id != nguoi_dang.id).first()

        bao_cao = BaoCao(
            tin_dang_id=tin.id,
            nguoi_bao_cao_id=nguoi_bao_cao.id,
            ly_do="Tin đăng lừa đảo",
            mo_ta="Tôi gọi điện nhưng báo số không tồn tại",
            trang_thai=TrangThaiBaoCao.CHO_XU_LY,
            ngay_bao_cao=datetime.now(timezone.utc),
        )
        db.add(bao_cao)
        db.commit()
        db.refresh(tin)
        db.refresh(bao_cao)

        return tin.id, bao_cao.id
    finally:
        db.close()


def _xoa_tin_dang_va_bao_cao(tin_dang_id: int, bao_cao_id: int) -> None:
    db: Session = SessionLocal()
    try:
        db.query(BaoCao).filter(BaoCao.id == bao_cao_id).delete(synchronize_session=False)
        db.query(TinDang).filter(TinDang.id == tin_dang_id).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def test_danh_sach_bao_cao_khong_dang_nhap_bi_tu_choi() -> None:
    response = client.get("/api/admin/bao-cao")
    assert response.status_code == 401


def test_danh_sach_bao_cao_khong_phai_admin_bi_tu_choi() -> None:
    user_id, token = _dang_ky_va_lay_token()
    try:
        response = client.get("/api/admin/bao-cao", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 403
    finally:
        db: Session = SessionLocal()
        db.query(NguoiDung).filter(NguoiDung.id == user_id).delete()
        db.commit()
        db.close()


def test_danh_sach_bao_cao_admin_lay_thanh_cong() -> None:
    admin_id, token = _dang_ky_admin()
    tin_dang_id, bao_cao_id = _tao_tin_dang_va_bao_cao()
    try:
        response = client.get("/api/admin/bao-cao", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        body = response.json()
        assert "items" in body
        assert "total" in body
        assert body["total"] >= 1
        
        # Verify schema mapping (camelCase)
        item = body["items"][0]
        assert "id" in item
        assert "lyDo" in item
        assert "trangThai" in item
        assert "ngayBaoCao" in item
        assert "nguoiBaoCao" in item
        assert "tinDang" in item
    finally:
        _xoa_tin_dang_va_bao_cao(tin_dang_id, bao_cao_id)
        db: Session = SessionLocal()
        db.query(NguoiDung).filter(NguoiDung.id == admin_id).delete()
        db.commit()
        db.close()


def test_chi_tiet_bao_cao_admin_lay_thanh_cong() -> None:
    admin_id, token = _dang_ky_admin()
    tin_dang_id, bao_cao_id = _tao_tin_dang_va_bao_cao()
    try:
        response = client.get(f"/api/admin/bao-cao/{bao_cao_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        body = response.json()
        
        assert body["id"] == bao_cao_id
        assert body["lyDo"] == "Tin đăng lừa đảo"
        assert body["trangThai"] == "cho_xu_ly"
        assert body["tinDang"]["id"] == tin_dang_id
        assert "moTa" in body
        assert "ngayXuLy" in body
        assert "ghiChuXuLy" in body
    finally:
        _xoa_tin_dang_va_bao_cao(tin_dang_id, bao_cao_id)
        db: Session = SessionLocal()
        db.query(NguoiDung).filter(NguoiDung.id == admin_id).delete()
        db.commit()
        db.close()


def test_xu_ly_bao_cao_tu_choi() -> None:
    admin_id, token = _dang_ky_admin()
    tin_dang_id, bao_cao_id = _tao_tin_dang_va_bao_cao()
    try:
        payload = {
            "action": "REJECTED",
            "ghiChuXuLy": "Không thấy có dấu hiệu lừa đảo.",
            "khoaTin": False
        }
        response = client.put(f"/api/admin/bao-cao/{bao_cao_id}/xu-ly", json=payload, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        body = response.json()
        
        assert body["trangThai"] == "tu_choi"
        assert body["ghiChuXuLy"] == "Không thấy có dấu hiệu lừa đảo."
        assert body["nguoiXuLy"]["id"] == admin_id
        
        db: Session = SessionLocal()
        tin_dang = db.get(TinDang, tin_dang_id)
        assert tin_dang.is_blocked == False
        db.close()
    finally:
        _xoa_tin_dang_va_bao_cao(tin_dang_id, bao_cao_id)
        db: Session = SessionLocal()
        db.query(NguoiDung).filter(NguoiDung.id == admin_id).delete()
        db.commit()
        db.close()


def test_xu_ly_bao_cao_duyet_va_khoa_tin() -> None:
    admin_id, token = _dang_ky_admin()
    tin_dang_id, bao_cao_id = _tao_tin_dang_va_bao_cao()
    try:
        payload = {
            "action": "RESOLVED",
            "ghiChuXuLy": "Đã xác minh lừa đảo.",
            "khoaTin": True,
            "lyDoKhoa": "Vi phạm quy định diễn đàn."
        }
        response = client.put(f"/api/admin/bao-cao/{bao_cao_id}/xu-ly", json=payload, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        body = response.json()
        
        assert body["trangThai"] == "da_xu_ly"
        assert body["ghiChuXuLy"] == "Đã xác minh lừa đảo."
        assert body["nguoiXuLy"]["id"] == admin_id
        
        db: Session = SessionLocal()
        tin_dang = db.get(TinDang, tin_dang_id)
        assert tin_dang.is_blocked == True
        assert tin_dang.ly_do_khoa == "Vi phạm quy định diễn đàn."
        db.close()
    finally:
        _xoa_tin_dang_va_bao_cao(tin_dang_id, bao_cao_id)
        db: Session = SessionLocal()
        db.query(NguoiDung).filter(NguoiDung.id == admin_id).delete()
        db.commit()
        db.close()


def test_gui_bao_cao_chua_dang_nhap_bi_tu_choi() -> None:
    response = client.post("/api/bao-cao/999", json={"lyDo": "Test"})
    assert response.status_code == 401


def test_gui_bao_cao_tin_dang_khong_ton_tai() -> None:
    user_id, token = _dang_ky_va_lay_token()
    try:
        response = client.post("/api/bao-cao/999999", json={"lyDo": "Test"}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404
    finally:
        db: Session = SessionLocal()
        db.query(NguoiDung).filter(NguoiDung.id == user_id).delete()
        db.commit()
        db.close()


def test_khong_the_bao_cao_tin_cua_chinh_minh() -> None:
    chu_tin_id, token = _dang_ky_va_lay_token()
    db: Session = SessionLocal()
    try:
        loai = db.query(LoaiBatDongSan).first()
        phuong = db.query(PhuongXa).first()

        tin = TinDang(
            tieu_de=f"Tin của tôi {uuid.uuid4().hex[:8]}",
            mo_ta="Mô tả",
            gia_thue=3000000,
            dien_tich=25,
            dia_chi_chi_tiet="Địa chỉ",
            loai_bat_dong_san_id=loai.id,
            phuong_xa_id=phuong.id,
            nguoi_dang_id=chu_tin_id,
            ten_nguoi_lien_he="Liên hệ",
            so_dien_thoai_lien_he="090",
            trang_thai=TrangThaiTinDang.DA_DUYET,
        )
        db.add(tin)
        db.commit()
        db.refresh(tin)

        response = client.post(f"/api/bao-cao/{tin.id}", json={"lyDo": "Test"}, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 400
        assert "chính mình" in response.json()["detail"]
        
        db.query(TinDang).filter(TinDang.id == tin.id).delete(synchronize_session=False)
        db.commit()
    finally:
        db.query(NguoiDung).filter(NguoiDung.id == chu_tin_id).delete(synchronize_session=False)
        db.commit()
        db.close()


def test_gui_bao_cao_thanh_cong_va_bi_chan_spam() -> None:
    nguoi_bao_cao_id, token = _dang_ky_va_lay_token()
    tin_dang_id, bao_cao_id = _tao_tin_dang_va_bao_cao()
    try:
        payload = {"lyDo": "Lừa đảo", "moTa": "Chi tiết"}
        response1 = client.post(f"/api/bao-cao/{tin_dang_id}", json=payload, headers={"Authorization": f"Bearer {token}"})
        assert response1.status_code == 200
        assert "baoCaoId" in response1.json()
        new_bao_cao_id = response1.json()["baoCaoId"]

        response2 = client.post(f"/api/bao-cao/{tin_dang_id}", json=payload, headers={"Authorization": f"Bearer {token}"})
        assert response2.status_code == 400
        assert "đang chờ quản trị viên xử lý" in response2.json()["detail"]
        
        db: Session = SessionLocal()
        db.query(BaoCao).filter(BaoCao.id == new_bao_cao_id).delete(synchronize_session=False)
        db.commit()
        db.close()
    finally:
        _xoa_tin_dang_va_bao_cao(tin_dang_id, bao_cao_id)
        db: Session = SessionLocal()
        db.query(NguoiDung).filter(NguoiDung.id == nguoi_bao_cao_id).delete(synchronize_session=False)
        db.commit()
        db.close()


def test_luong_e2e_tu_nguoi_dung_den_admin() -> None:
    chu_tin_id, _ = _dang_ky_va_lay_token()
    db: Session = SessionLocal()
    try:
        loai = db.query(LoaiBatDongSan).first()
        phuong = db.query(PhuongXa).first()
        tin = TinDang(
            tieu_de=f"Tin E2E {uuid.uuid4().hex[:8]}",
            mo_ta="Mô tả",
            gia_thue=5000000,
            dien_tich=30,
            dia_chi_chi_tiet="Địa chỉ test",
            loai_bat_dong_san_id=loai.id,
            phuong_xa_id=phuong.id,
            nguoi_dang_id=chu_tin_id,
            ten_nguoi_lien_he="Lien he",
            so_dien_thoai_lien_he="09",
            trang_thai=TrangThaiTinDang.DA_DUYET,
        )
        db.add(tin)
        db.commit()
        db.refresh(tin)
        tin_id = tin.id
    finally:
        db.close()

    nguoi_bao_cao_id, token_client = _dang_ky_va_lay_token()
    admin_id, token_admin = _dang_ky_admin()
    bao_cao_id = None
    try:
        payload_client = {"lyDo": "Lừa đảo", "moTa": "Test E2E"}
        resp_client = client.post(f"/api/bao-cao/{tin_id}", json=payload_client, headers={"Authorization": f"Bearer {token_client}"})
        assert resp_client.status_code == 200
        bao_cao_id = resp_client.json()["baoCaoId"]

        resp_admin_list = client.get("/api/admin/bao-cao?trang_thai=cho_xu_ly", headers={"Authorization": f"Bearer {token_admin}"})
        assert resp_admin_list.status_code == 200
        items = resp_admin_list.json()["items"]
        assert any(item["id"] == bao_cao_id for item in items), "Không tìm thấy báo cáo mới tạo"

        payload_admin = {
            "action": "RESOLVED",
            "ghiChuXuLy": "Đã xử lý E2E",
            "khoaTin": True,
            "lyDoKhoa": "Khóa E2E"
        }
        resp_admin_process = client.put(f"/api/admin/bao-cao/{bao_cao_id}/xu-ly", json=payload_admin, headers={"Authorization": f"Bearer {token_admin}"})
        assert resp_admin_process.status_code == 200
        assert resp_admin_process.json()["trangThai"] == "da_xu_ly"

        db2: Session = SessionLocal()
        try:
            tin_sau_khi_khoa = db2.get(TinDang, tin_id)
            assert tin_sau_khi_khoa.is_blocked is True
            assert tin_sau_khi_khoa.ly_do_khoa == "Khóa E2E"
        finally:
            db2.close()

    finally:
        db3: Session = SessionLocal()
        try:
            if bao_cao_id:
                db3.query(BaoCao).filter(BaoCao.id == bao_cao_id).delete(synchronize_session=False)
            db3.query(TinDang).filter(TinDang.id == tin_id).delete(synchronize_session=False)
            db3.query(NguoiDung).filter(NguoiDung.id.in_([chu_tin_id, nguoi_bao_cao_id, admin_id])).delete(synchronize_session=False)
            db3.commit()
        finally:
            db3.close()
