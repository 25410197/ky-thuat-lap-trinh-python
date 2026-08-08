import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models import (
    AnhThuVien,
    HinhAnhTinDang,
    LoaiBatDongSan,
    NguoiDung,
    PhuongXa,
    PhuongXaMoi,
    QuanHuyen,
    TinDang,
    tin_dang_tien_ich,
)
from app.models.enums import TrangThaiTinDang

client = TestClient(app)


def _tao_tin_dang_voi_trang_thai(
    tieu_de: str,
    trang_thai: TrangThaiTinDang,
    phuong_xa_id: int | None = None,
    nguoi_dang_id: int | None = None,
) -> int:
    db: Session = SessionLocal()
    try:
        chu_tin = db.get(NguoiDung, nguoi_dang_id) if nguoi_dang_id else db.query(NguoiDung).first()
        loai = db.query(LoaiBatDongSan).first()
        phuong = db.get(PhuongXa, phuong_xa_id) if phuong_xa_id else db.query(PhuongXa).first()

        tin = TinDang(
            tieu_de=tieu_de,
            mo_ta="Tin đăng dùng để kiểm thử lọc trạng thái",
            gia_thue=3_000_000,
            dien_tich=25,
            dia_chi_chi_tiet="Địa chỉ kiểm thử",
            loai_bat_dong_san_id=loai.id,
            phuong_xa_id=phuong.id,
            nguoi_dang_id=chu_tin.id,
            ten_nguoi_lien_he="Người kiểm thử",
            so_dien_thoai_lien_he="0900000000",
            trang_thai=trang_thai,
        )
        db.add(tin)
        db.flush()

        anh_thu_vien = AnhThuVien(
            nguoi_dung_id=chu_tin.id,
            ten_doi_tuong=f"test-{uuid.uuid4().hex[:8]}.jpg",
            duong_dan_anh="https://example.com/anh-mac-dinh.jpg",
            ten_tep_goc="anh-mac-dinh.jpg",
            dung_luong=1000,
        )
        db.add(anh_thu_vien)
        db.flush()
        db.add(
            HinhAnhTinDang(
                tin_dang_id=tin.id,
                anh_thu_vien_id=anh_thu_vien.id,
                thu_tu_hien_thi=0,
                la_anh_dai_dien=True,
            )
        )

        db.commit()
        db.refresh(tin)
        return tin.id
    finally:
        db.close()


def _dang_ky_va_lay_token() -> tuple[int, str]:
    email = f"test-sua-tin-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/auth/register",
        json={"fullName": "Chủ Tin Kiểm Thử", "email": email, "password": "matkhau123"},
    )
    body = response.json()
    return int(body["user"]["id"]), body["accessToken"]


def _xoa_nguoi_dung_theo_id(*id_list: int) -> None:
    db: Session = SessionLocal()
    try:
        db.query(AnhThuVien).filter(AnhThuVien.nguoi_dung_id.in_(id_list)).delete(
            synchronize_session=False
        )
        db.query(NguoiDung).filter(NguoiDung.id.in_(id_list)).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def _tao_anh_thu_vien(nguoi_dung_id: int, so_luong: int = 1) -> list[int]:
    db: Session = SessionLocal()
    try:
        danh_sach = []
        for _ in range(so_luong):
            ten = f"test-{uuid.uuid4().hex[:8]}.jpg"
            anh = AnhThuVien(
                nguoi_dung_id=nguoi_dung_id,
                ten_doi_tuong=ten,
                duong_dan_anh=f"https://example.com/{ten}",
                ten_tep_goc=ten,
                dung_luong=1000,
            )
            db.add(anh)
            danh_sach.append(anh)
        db.commit()
        for anh in danh_sach:
            db.refresh(anh)
        return [anh.id for anh in danh_sach]
    finally:
        db.close()


def _lay_phuong_xa_moi_id_hop_le() -> int:
    """Lấy 1 xã/phường MỚI có ít nhất 1 phường/xã CŨ ánh xạ tới — dùng làm payload hợp lệ."""
    db: Session = SessionLocal()
    try:
        xa_moi = db.query(PhuongXaMoi).filter(PhuongXaMoi.phuong_xa_cu.any()).first()
        return xa_moi.id
    finally:
        db.close()


def _payload_sua_tin(phuong_xa_moi_id: int, anh_chinh_id: int, anh_phu_id: list[int] | None = None) -> dict:
    return {
        "title": "Tin đăng đã được chỉnh sửa",
        "propertyType": "Căn hộ",
        "areaM2": 40,
        "priceVnd": 5_000_000,
        "phuongXaMoiId": phuong_xa_moi_id,
        "address": "Địa chỉ sau khi sửa",
        "description": "Mô tả sau khi chỉnh sửa tin đăng",
        "anhChinhId": anh_chinh_id,
        "anhPhuId": anh_phu_id or [],
        "amenities": ["WiFi Miễn phí"],
        "contactName": "Người liên hệ mới",
        "contactPhone": "0911111111",
        "contactMethod": "zalo",
        "bedrooms": 2,
        "bathrooms": 1,
    }


def _xoa_tin_dang(*id_list: int) -> None:
    db: Session = SessionLocal()
    try:
        anh_thu_vien_id_list = [
            row.anh_thu_vien_id
            for row in db.query(HinhAnhTinDang).filter(HinhAnhTinDang.tin_dang_id.in_(id_list)).all()
        ]
        db.query(HinhAnhTinDang).filter(HinhAnhTinDang.tin_dang_id.in_(id_list)).delete(
            synchronize_session=False
        )
        db.execute(tin_dang_tien_ich.delete().where(tin_dang_tien_ich.c.tin_dang_id.in_(id_list)))
        db.query(TinDang).filter(TinDang.id.in_(id_list)).delete(synchronize_session=False)
        if anh_thu_vien_id_list:
            db.query(AnhThuVien).filter(AnhThuVien.id.in_(anh_thu_vien_id_list)).delete(
                synchronize_session=False
            )
        db.commit()
    finally:
        db.close()


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


def test_loc_theo_xa_phuong_moi() -> None:
    db: Session = SessionLocal()
    try:
        # Lấy 1 phường/xã CŨ có ánh xạ sang ít nhất 1 xã/phường MỚI, và 1 phường/xã cũ
        # thuộc tỉnh KHÁC để chắc chắn nó ánh xạ sang xã/phường mới khác (không trùng).
        phuong_co_map = (
            db.query(PhuongXa).filter(PhuongXa.xa_phuong_moi.any()).first()
        )
        xa_moi_cung_phe = phuong_co_map.xa_phuong_moi[0]

        phuong_tinh_khac = (
            db.query(PhuongXa)
            .join(QuanHuyen)
            .filter(
                PhuongXa.xa_phuong_moi.any(),
                QuanHuyen.tinh_thanh_id != phuong_co_map.quan_huyen.tinh_thanh_id,
            )
            .first()
        )
        xa_moi_khac_tinh = next(
            x for x in phuong_tinh_khac.xa_phuong_moi if x.tinh_thanh_id != xa_moi_cung_phe.tinh_thanh_id
        )

        id_phuong_cu = phuong_co_map.id
        id_xa_moi = xa_moi_cung_phe.id
        id_xa_moi_khac_tinh = xa_moi_khac_tinh.id
    finally:
        db.close()

    marker = f"KiemThuXaMoi-{uuid.uuid4().hex[:8]}"
    id_tin = _tao_tin_dang_voi_trang_thai(marker, TrangThaiTinDang.DA_DUYET, phuong_xa_id=id_phuong_cu)
    try:
        dung_mode = client.get(
            "/api/rental-posts", params={"phuong_xa_moi_id": id_xa_moi, "q": marker, "page_size": 50}
        )
        assert dung_mode.status_code == 200
        assert [item["id"] for item in dung_mode.json()["items"]] == [id_tin]

        sai_mode = client.get(
            "/api/rental-posts",
            params={"phuong_xa_moi_id": id_xa_moi_khac_tinh, "q": marker, "page_size": 50},
        )
        assert sai_mode.status_code == 200
        assert sai_mode.json()["items"] == []
    finally:
        _xoa_tin_dang(id_tin)


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


def test_danh_muc_xa_phuong_moi_khong_rong() -> None:
    tinh = client.get("/api/tinh-thanh").json()[0]

    response = client.get(f"/api/tinh-thanh/{tinh['id']}/xa-phuong-moi")

    assert response.status_code == 200
    assert len(response.json()) > 0


def test_danh_muc_xa_phuong_moi_tinh_khong_ton_tai_tra_ve_404() -> None:
    response = client.get("/api/tinh-thanh/999999/xa-phuong-moi")

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


def test_danh_sach_tin_dang_chi_tra_ve_tin_da_duyet() -> None:
    marker = f"KiemThuTrangThai-{uuid.uuid4().hex[:8]}"
    id_list = []
    try:
        id_duoc_duyet = _tao_tin_dang_voi_trang_thai(f"{marker} đã duyệt", TrangThaiTinDang.DA_DUYET)
        id_list.append(id_duoc_duyet)
        for trang_thai in (
            TrangThaiTinDang.CHO_DUYET,
            TrangThaiTinDang.BI_KHOA,
            TrangThaiTinDang.AN,
            TrangThaiTinDang.DA_XOA,
        ):
            id_list.append(_tao_tin_dang_voi_trang_thai(f"{marker} {trang_thai.value}", trang_thai))

        response = client.get("/api/rental-posts", params={"q": marker, "page_size": 50})

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 1
        assert [item["id"] for item in body["items"]] == [id_duoc_duyet]
    finally:
        _xoa_tin_dang(*id_list)


def test_danh_sach_tin_dang_sap_xep_theo_ngay_dang_moi_nhat() -> None:
    response = client.get("/api/rental-posts", params={"page_size": 50})

    assert response.status_code == 200
    ngay_dang_list = [item["ngayDang"] for item in response.json()["items"]]
    assert ngay_dang_list == sorted(ngay_dang_list, reverse=True)


def test_lay_tin_de_sua_khong_dang_nhap_bi_tu_choi() -> None:
    chu_id, _token = _dang_ky_va_lay_token()
    try:
        id_tin = _tao_tin_dang_voi_trang_thai(
            f"KiemThuSua-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET, nguoi_dang_id=chu_id
        )
        try:
            response = client.get(f"/api/rental-posts/{id_tin}/chinh-sua")
            assert response.status_code == 401
        finally:
            _xoa_tin_dang(id_tin)
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_lay_tin_de_sua_khong_phai_chu_tin_bi_tu_choi() -> None:
    chu_id, _chu_token = _dang_ky_va_lay_token()
    nguoi_khac_id, token_nguoi_khac = _dang_ky_va_lay_token()
    try:
        id_tin = _tao_tin_dang_voi_trang_thai(
            f"KiemThuSua-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET, nguoi_dang_id=chu_id
        )
        try:
            response = client.get(
                f"/api/rental-posts/{id_tin}/chinh-sua",
                headers={"Authorization": f"Bearer {token_nguoi_khac}"},
            )
            assert response.status_code == 403
        finally:
            _xoa_tin_dang(id_tin)
    finally:
        _xoa_nguoi_dung_theo_id(chu_id, nguoi_khac_id)


def test_lay_tin_de_sua_tra_ve_du_lieu_hien_tai_cho_chu_tin() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        marker = f"KiemThuSua-{uuid.uuid4().hex[:8]}"
        id_tin = _tao_tin_dang_voi_trang_thai(marker, TrangThaiTinDang.CHO_DUYET, nguoi_dang_id=chu_id)
        try:
            response = client.get(
                f"/api/rental-posts/{id_tin}/chinh-sua",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            body = response.json()
            assert body["title"] == marker
            assert body["status"] == "pending"
            assert body["provinceId"]
            assert body["wardId"]
        finally:
            _xoa_tin_dang(id_tin)
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_sua_tin_dang_khong_ton_tai_tra_ve_404() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        anh_chinh_id = _tao_anh_thu_vien(chu_id)[0]
        response = client.put(
            "/api/rental-posts/999999999",
            json=_payload_sua_tin(_lay_phuong_xa_moi_id_hop_le(), anh_chinh_id),
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 404
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_sua_tin_dang_anh_khong_thuoc_thu_vien_cua_minh_tra_ve_404() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    nguoi_khac_id, _token_nguoi_khac = _dang_ky_va_lay_token()
    try:
        id_tin = _tao_tin_dang_voi_trang_thai(
            f"KiemThuSua-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.CHO_DUYET, nguoi_dang_id=chu_id
        )
        anh_cua_nguoi_khac = _tao_anh_thu_vien(nguoi_khac_id)[0]
        try:
            response = client.put(
                f"/api/rental-posts/{id_tin}",
                json=_payload_sua_tin(_lay_phuong_xa_moi_id_hop_le(), anh_cua_nguoi_khac),
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 404
        finally:
            _xoa_tin_dang(id_tin)
    finally:
        _xoa_nguoi_dung_theo_id(chu_id, nguoi_khac_id)


def test_sua_tin_dang_khong_phai_chu_tin_bi_tu_choi() -> None:
    chu_id, _chu_token = _dang_ky_va_lay_token()
    nguoi_khac_id, token_nguoi_khac = _dang_ky_va_lay_token()
    try:
        id_tin = _tao_tin_dang_voi_trang_thai(
            f"KiemThuSua-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET, nguoi_dang_id=chu_id
        )
        anh_chinh_id = _tao_anh_thu_vien(chu_id)[0]
        try:
            response = client.put(
                f"/api/rental-posts/{id_tin}",
                json=_payload_sua_tin(_lay_phuong_xa_moi_id_hop_le(), anh_chinh_id),
                headers={"Authorization": f"Bearer {token_nguoi_khac}"},
            )
            assert response.status_code == 403

            db: Session = SessionLocal()
            try:
                tin = db.get(TinDang, id_tin)
                assert tin.trang_thai == TrangThaiTinDang.DA_DUYET
            finally:
                db.close()
        finally:
            _xoa_tin_dang(id_tin)
    finally:
        _xoa_nguoi_dung_theo_id(chu_id, nguoi_khac_id)


def test_sua_tin_dang_thanh_cong_cap_nhat_noi_dung() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        id_tin = _tao_tin_dang_voi_trang_thai(
            f"KiemThuSua-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.CHO_DUYET, nguoi_dang_id=chu_id
        )
        anh_chinh_id, anh_phu_id = _tao_anh_thu_vien(chu_id, so_luong=2)
        try:
            payload = _payload_sua_tin(_lay_phuong_xa_moi_id_hop_le(), anh_chinh_id, [anh_phu_id])
            response = client.put(
                f"/api/rental-posts/{id_tin}",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200

            db: Session = SessionLocal()
            try:
                tin = db.get(TinDang, id_tin)
                assert tin.tieu_de == payload["title"]
                assert tin.dia_chi_chi_tiet == payload["address"]
                assert float(tin.gia_thue) == payload["priceVnd"]
                assert [anh.anh_thu_vien_id for anh in tin.hinh_anh if anh.la_anh_dai_dien] == [
                    anh_chinh_id
                ]
                assert [anh.anh_thu_vien_id for anh in tin.hinh_anh if not anh.la_anh_dai_dien] == [
                    anh_phu_id
                ]
            finally:
                db.close()
        finally:
            _xoa_tin_dang(id_tin)
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_sua_tin_da_duyet_bi_chuyen_ve_cho_duyet() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        id_tin = _tao_tin_dang_voi_trang_thai(
            f"KiemThuSua-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET, nguoi_dang_id=chu_id
        )
        anh_chinh_id = _tao_anh_thu_vien(chu_id)[0]
        try:
            response = client.put(
                f"/api/rental-posts/{id_tin}",
                json=_payload_sua_tin(_lay_phuong_xa_moi_id_hop_le(), anh_chinh_id),
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200

            db: Session = SessionLocal()
            try:
                tin = db.get(TinDang, id_tin)
                assert tin.trang_thai == TrangThaiTinDang.CHO_DUYET
            finally:
                db.close()
        finally:
            _xoa_tin_dang(id_tin)
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)
