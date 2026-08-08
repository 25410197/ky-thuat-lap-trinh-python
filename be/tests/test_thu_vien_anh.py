import io
import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models import AnhThuVien, HinhAnhTinDang, LoaiBatDongSan, NguoiDung, PhuongXa, TinDang
from app.models.enums import TrangThaiTinDang

client = TestClient(app)


def _dang_ky_va_lay_token() -> tuple[int, str]:
    email = f"test-thu-vien-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/auth/register",
        json={"fullName": "Chủ Thư Viện Kiểm Thử", "email": email, "password": "matkhau123"},
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


def _tao_anh_thu_vien(nguoi_dung_id: int, ten_tep: str | None = None) -> int:
    db: Session = SessionLocal()
    try:
        ten = ten_tep or f"test-{uuid.uuid4().hex[:8]}.jpg"
        anh = AnhThuVien(
            nguoi_dung_id=nguoi_dung_id,
            ten_doi_tuong=f"{uuid.uuid4().hex}.jpg",
            duong_dan_anh=f"https://example.com/{uuid.uuid4().hex}.jpg",
            ten_tep_goc=ten,
            dung_luong=1234,
        )
        db.add(anh)
        db.commit()
        db.refresh(anh)
        return anh.id
    finally:
        db.close()


def _anh_1x1_png_bytes() -> bytes:
    # PNG 1x1 trong suốt, tối thiểu để test upload thật qua MinIO.
    return bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108020000009077"
        "53de0000000c4944415408d763f8ffff3f0005fe02fea739663d0000000049454e44ae426082"
    )


def test_danh_sach_anh_thu_vien_can_dang_nhap() -> None:
    response = client.get("/api/image-library")

    assert response.status_code == 401


def test_danh_sach_anh_thu_vien_chi_tra_ve_anh_cua_minh() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    nguoi_khac_id, _token_khac = _dang_ky_va_lay_token()
    try:
        _tao_anh_thu_vien(chu_id, "cua-toi.jpg")
        _tao_anh_thu_vien(nguoi_khac_id, "cua-nguoi-khac.jpg")

        response = client.get("/api/image-library", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 1
        assert body["items"][0]["tenTep"] == "cua-toi.jpg"
    finally:
        _xoa_nguoi_dung_theo_id(chu_id, nguoi_khac_id)


def test_danh_sach_anh_thu_vien_phan_trang() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        for i in range(3):
            _tao_anh_thu_vien(chu_id, f"phan-trang-{i}.jpg")

        response = client.get(
            "/api/image-library",
            params={"page": 1, "page_size": 2},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 3
        assert len(body["items"]) == 2
        assert body["pageSize"] == 2
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_danh_sach_anh_thu_vien_tim_theo_ten_tep() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        marker = f"KiemThuTim-{uuid.uuid4().hex[:8]}"
        _tao_anh_thu_vien(chu_id, f"{marker}.jpg")
        _tao_anh_thu_vien(chu_id, "khong-lien-quan.jpg")

        response = client.get(
            "/api/image-library", params={"q": marker}, headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 1
        assert body["items"][0]["tenTep"] == f"{marker}.jpg"
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_tai_anh_len_thu_vien_thanh_cong() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        response = client.post(
            "/api/image-library",
            files={"files": ("anh-test.png", _anh_1x1_png_bytes(), "image/png")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        body = response.json()
        assert len(body) == 1
        assert body[0]["tenTep"] == "anh-test.png"
        assert body[0]["url"]

        db: Session = SessionLocal()
        try:
            assert db.query(AnhThuVien).filter(AnhThuVien.nguoi_dung_id == chu_id).count() == 1
        finally:
            db.close()
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_tai_anh_len_thu_vien_dinh_dang_khong_hop_le_bi_tu_choi() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        response = client.post(
            "/api/image-library",
            files={"files": ("anh-test.gif", b"gif89a", "image/gif")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 400
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_doi_ten_anh_khong_phai_chu_bi_tu_choi() -> None:
    chu_id, _token = _dang_ky_va_lay_token()
    nguoi_khac_id, token_nguoi_khac = _dang_ky_va_lay_token()
    try:
        anh_id = _tao_anh_thu_vien(chu_id)

        response = client.patch(
            f"/api/image-library/{anh_id}",
            json={"tenTep": "ten-moi.jpg"},
            headers={"Authorization": f"Bearer {token_nguoi_khac}"},
        )

        assert response.status_code == 403
    finally:
        _xoa_nguoi_dung_theo_id(chu_id, nguoi_khac_id)


def test_doi_ten_anh_thanh_cong() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        anh_id = _tao_anh_thu_vien(chu_id, "ten-cu.jpg")

        response = client.patch(
            f"/api/image-library/{anh_id}",
            json={"tenTep": "ten-moi.jpg"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json()["tenTep"] == "ten-moi.jpg"
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_xoa_anh_khong_ton_tai_tra_ve_404() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        response = client.delete(
            "/api/image-library/999999999", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 404
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_xoa_anh_khong_phai_chu_bi_tu_choi() -> None:
    chu_id, _token = _dang_ky_va_lay_token()
    nguoi_khac_id, token_nguoi_khac = _dang_ky_va_lay_token()
    try:
        anh_id = _tao_anh_thu_vien(chu_id)

        response = client.delete(
            f"/api/image-library/{anh_id}", headers={"Authorization": f"Bearer {token_nguoi_khac}"}
        )

        assert response.status_code == 403
    finally:
        _xoa_nguoi_dung_theo_id(chu_id, nguoi_khac_id)


def test_xoa_anh_dang_dung_trong_tin_dang_bi_chan() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        anh_id = _tao_anh_thu_vien(chu_id)

        db: Session = SessionLocal()
        try:
            loai = db.query(LoaiBatDongSan).first()
            phuong = db.query(PhuongXa).first()
            tin = TinDang(
                tieu_de="Tin đăng dùng ảnh để kiểm thử xoá",
                mo_ta="Mô tả kiểm thử",
                gia_thue=1_000_000,
                dien_tich=20,
                dia_chi_chi_tiet="Địa chỉ kiểm thử",
                loai_bat_dong_san_id=loai.id,
                phuong_xa_id=phuong.id,
                nguoi_dang_id=chu_id,
                ten_nguoi_lien_he="Người kiểm thử",
                so_dien_thoai_lien_he="0900000000",
                trang_thai=TrangThaiTinDang.CHO_DUYET,
            )
            db.add(tin)
            db.flush()
            db.add(
                HinhAnhTinDang(
                    tin_dang_id=tin.id, anh_thu_vien_id=anh_id, thu_tu_hien_thi=0, la_anh_dai_dien=True
                )
            )
            db.commit()
            id_tin = tin.id
        finally:
            db.close()

        try:
            response = client.delete(
                f"/api/image-library/{anh_id}", headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 400

            db2: Session = SessionLocal()
            try:
                assert db2.get(AnhThuVien, anh_id) is not None
            finally:
                db2.close()
        finally:
            db3: Session = SessionLocal()
            try:
                db3.query(HinhAnhTinDang).filter(HinhAnhTinDang.tin_dang_id == id_tin).delete()
                db3.query(TinDang).filter(TinDang.id == id_tin).delete()
                db3.commit()
            finally:
                db3.close()
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)


def test_xoa_anh_khong_con_dung_thi_xoa_thanh_cong() -> None:
    chu_id, token = _dang_ky_va_lay_token()
    try:
        anh_id = _tao_anh_thu_vien(chu_id)

        response = client.delete(
            f"/api/image-library/{anh_id}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 204

        db: Session = SessionLocal()
        try:
            assert db.get(AnhThuVien, anh_id) is None
        finally:
            db.close()
    finally:
        _xoa_nguoi_dung_theo_id(chu_id)
