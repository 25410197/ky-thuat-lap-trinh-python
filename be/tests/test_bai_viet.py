import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models import BaiViet, NguoiDung
from app.models.enums import VaiTroNguoiDung

client = TestClient(app)


def _dang_ky_va_lay_token() -> tuple[int, str]:
    email = f"test-bai-viet-{uuid.uuid4().hex[:12]}@example.com"
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


def _xoa_bai_viet(*id_list: int) -> None:
    db: Session = SessionLocal()
    try:
        db.query(BaiViet).filter(BaiViet.id.in_(id_list)).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def test_quan_tri_khong_dang_nhap_bi_tu_choi() -> None:
    response = client.get("/api/admin/tin-tuc")
    assert response.status_code == 401


def test_luong_tao_sua_dang_an_bai_viet() -> None:
    admin_id, token = _dang_ky_admin()
    headers = {"Authorization": f"Bearer {token}"}
    bai_viet_id = None
    try:
        # Tạo bài — mặc định ở trạng thái nháp
        tao = client.post(
            "/api/admin/tin-tuc",
            json={
                "title": "Giá thuê căn hộ quý 3 tăng nhẹ",
                "excerpt": "Tổng hợp biến động giá thuê căn hộ trong quý 3.",
                "contentHtml": "<p>Nội dung <strong>ban đầu</strong>.</p>",
            },
            headers=headers,
        )
        assert tao.status_code == 201
        body = tao.json()
        bai_viet_id = body["id"]
        assert body["status"] == "draft"
        assert body["slug"]

        # Bài nháp chưa xuất hiện công khai
        cong_khai_truoc = client.get(f"/api/tin-tuc/{body['slug']}")
        assert cong_khai_truoc.status_code == 404

        # Sửa nội dung
        sua = client.put(
            f"/api/admin/tin-tuc/{bai_viet_id}",
            json={
                "title": "Giá thuê căn hộ quý 3 tăng nhẹ",
                "excerpt": "Tổng hợp biến động giá thuê căn hộ trong quý 3 (đã cập nhật).",
                "contentHtml": "<p>Nội dung <strong>đã sửa</strong>.</p>",
            },
            headers=headers,
        )
        assert sua.status_code == 200
        assert "đã cập nhật" in sua.json()["excerpt"]

        # Đăng bài
        dang = client.patch(
            f"/api/admin/tin-tuc/{bai_viet_id}/trang-thai",
            json={"status": "published"},
            headers=headers,
        )
        assert dang.status_code == 200
        assert dang.json()["status"] == "published"
        assert dang.json()["publishedAt"] is not None

        # Giờ xuất hiện công khai, tăng lượt xem sau khi gọi chi tiết
        slug = body["slug"]
        chi_tiet_cong_khai = client.get(f"/api/tin-tuc/{slug}")
        assert chi_tiet_cong_khai.status_code == 200
        assert chi_tiet_cong_khai.json()["viewCount"] == 1
        assert "đã sửa" in chi_tiet_cong_khai.json()["contentHtml"]

        danh_sach_cong_khai = client.get("/api/tin-tuc")
        assert any(item["slug"] == slug for item in danh_sach_cong_khai.json()["items"])

        # Ẩn bài — biến mất khỏi công khai
        an = client.patch(
            f"/api/admin/tin-tuc/{bai_viet_id}/trang-thai",
            json={"status": "hidden"},
            headers=headers,
        )
        assert an.status_code == 200
        assert an.json()["status"] == "hidden"

        sau_khi_an = client.get(f"/api/tin-tuc/{slug}")
        assert sau_khi_an.status_code == 404

        danh_sach_sau_khi_an = client.get("/api/tin-tuc")
        assert all(item["slug"] != slug for item in danh_sach_sau_khi_an.json()["items"])
    finally:
        if bai_viet_id is not None:
            _xoa_bai_viet(bai_viet_id)
        _xoa_nguoi_dung(admin_id)


def test_slug_trung_tieu_de_tu_dong_them_hau_to() -> None:
    admin_id, token = _dang_ky_admin()
    headers = {"Authorization": f"Bearer {token}"}
    ids: list[int] = []
    try:
        payload = {
            "title": "Bản tin thị trường tuần này",
            "excerpt": "Tóm tắt ngắn.",
            "contentHtml": "<p>Nội dung.</p>",
        }
        bai_1 = client.post("/api/admin/tin-tuc", json=payload, headers=headers)
        bai_2 = client.post("/api/admin/tin-tuc", json=payload, headers=headers)
        assert bai_1.status_code == 201
        assert bai_2.status_code == 201
        ids = [bai_1.json()["id"], bai_2.json()["id"]]

        assert bai_1.json()["slug"] != bai_2.json()["slug"]
    finally:
        _xoa_bai_viet(*ids)
        _xoa_nguoi_dung(admin_id)


def test_noi_dung_html_duoc_sanitize_chong_xss() -> None:
    admin_id, token = _dang_ky_admin()
    headers = {"Authorization": f"Bearer {token}"}
    bai_viet_id = None
    try:
        tao = client.post(
            "/api/admin/tin-tuc",
            json={
                "title": "Bài viết kiểm tra XSS",
                "excerpt": "Kiểm tra sanitize.",
                "contentHtml": '<p>An toàn</p><script>alert(1)</script><img src=x onerror="alert(1)">',
            },
            headers=headers,
        )
        assert tao.status_code == 201
        body = tao.json()
        bai_viet_id = body["id"]

        assert "<script>" not in body["contentHtml"]
        assert "onerror" not in body["contentHtml"]
        assert "<p>An toàn</p>" in body["contentHtml"]
    finally:
        if bai_viet_id is not None:
            _xoa_bai_viet(bai_viet_id)
        _xoa_nguoi_dung(admin_id)
