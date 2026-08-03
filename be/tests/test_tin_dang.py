from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_danh_sach_tin_dang_tra_ve_key_dang_camelcase() -> None:
    response = client.get("/api/rental-posts", params={"page_size": 1})

    assert response.status_code == 200
    body = response.json()
    assert "pageSize" in body
    assert body["items"], "cần có ít nhất 1 tin đăng đã seed để test"

    item = body["items"][0]
    for key in (
        "tieuDe",
        "giaThue",
        "dienTich",
        "diaChiChiTiet",
        "loaiBatDongSan",
        "phuongXa",
        "quanHuyen",
        "tinhThanh",
        "tienIch",
        "ngayDang",
    ):
        assert key in item


def test_danh_sach_tin_dang_phan_trang() -> None:
    response = client.get("/api/rental-posts", params={"page": 1, "page_size": 5})

    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) <= 5
    assert body["page"] == 1
    assert body["pageSize"] == 5


def test_loc_theo_tu_khoa() -> None:
    tat_ca = client.get("/api/rental-posts", params={"page_size": 50}).json()
    tu_khoa = tat_ca["items"][0]["tieuDe"].split(" ")[0]

    response = client.get("/api/rental-posts", params={"q": tu_khoa, "page_size": 50})

    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    for item in items:
        assert tu_khoa.lower() in item["tieuDe"].lower() or tu_khoa.lower() in item["diaChiChiTiet"].lower()


def test_loc_theo_loai_bat_dong_san() -> None:
    loai = client.get("/api/loai-bat-dong-san").json()[0]

    response = client.get(
        "/api/rental-posts", params={"loai_bat_dong_san_id": loai["id"], "page_size": 50}
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    for item in items:
        assert item["loaiBatDongSan"] == loai["ten"]


def test_loc_theo_khoang_gia() -> None:
    response = client.get(
        "/api/rental-posts", params={"gia_tu": 2_000_000, "gia_den": 5_000_000, "page_size": 50}
    )

    assert response.status_code == 200
    for item in response.json()["items"]:
        assert 2_000_000 <= item["giaThue"] <= 5_000_000


def test_loc_theo_khoang_dien_tich() -> None:
    response = client.get(
        "/api/rental-posts", params={"dien_tich_tu": 20, "dien_tich_den": 40, "page_size": 50}
    )

    assert response.status_code == 200
    for item in response.json()["items"]:
        assert 20 <= item["dienTich"] <= 40


def test_loc_theo_tinh_thanh() -> None:
    tinh = client.get("/api/tinh-thanh").json()[0]

    response = client.get("/api/rental-posts", params={"tinh_thanh_id": tinh["id"], "page_size": 50})

    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    for item in items:
        assert item["tinhThanh"] == tinh["ten"]


def test_loc_theo_quan_huyen() -> None:
    tinh = client.get("/api/tinh-thanh").json()[0]
    quan = client.get(f"/api/tinh-thanh/{tinh['id']}/quan-huyen").json()[0]

    response = client.get("/api/rental-posts", params={"quan_huyen_id": quan["id"], "page_size": 50})

    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    for item in items:
        assert item["quanHuyen"] == quan["ten"]


def test_danh_muc_loai_bat_dong_san_khong_rong() -> None:
    response = client.get("/api/loai-bat-dong-san")

    assert response.status_code == 200
    assert len(response.json()) > 0


def test_danh_muc_tinh_thanh_khong_rong() -> None:
    response = client.get("/api/tinh-thanh")

    assert response.status_code == 200
    assert len(response.json()) > 0


def test_danh_muc_quan_huyen_tinh_khong_ton_tai_tra_ve_404() -> None:
    response = client.get("/api/tinh-thanh/999999/quan-huyen")

    assert response.status_code == 404


def test_chi_tiet_tin_dang_tra_ve_key_dang_camelcase() -> None:
    id_tin = client.get("/api/rental-posts", params={"page_size": 1}).json()["items"][0]["id"]

    response = client.get(f"/api/rental-posts/{id_tin}")

    assert response.status_code == 200
    body = response.json()
    for key in (
        "id",
        "tieuDe",
        "moTa",
        "giaThue",
        "dienTich",
        "diaChiChiTiet",
        "loaiBatDongSan",
        "phuongXa",
        "quanHuyen",
        "tinhThanh",
        "hinhAnh",
        "tienIch",
        "tenNguoiLienHe",
        "soDienThoaiLienHe",
        "phuongThucLienHeUuTien",
        "luotXem",
        "ngayDang",
    ):
        assert key in body


def test_chi_tiet_tin_dang_tang_luot_xem_moi_lan_goi() -> None:
    id_tin = client.get("/api/rental-posts", params={"page_size": 1}).json()["items"][0]["id"]

    luot_xem_truoc = client.get(f"/api/rental-posts/{id_tin}").json()["luotXem"]
    luot_xem_sau = client.get(f"/api/rental-posts/{id_tin}").json()["luotXem"]

    assert luot_xem_sau == luot_xem_truoc + 1


def test_chi_tiet_tin_dang_khong_ton_tai_tra_ve_404() -> None:
    response = client.get("/api/rental-posts/999999999")

    assert response.status_code == 404
