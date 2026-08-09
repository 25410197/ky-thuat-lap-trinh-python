import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.main import app
from app.models import AnhThuVien, HinhAnhTinDang, NguoiDung, TinDang, TinYeuThich, tin_dang_tien_ich
from app.models.enums import TrangThaiTinDang

client = TestClient(app)


def _tao_tin_dang_voi_trang_thai(
    tieu_de: str,
    trang_thai: TrangThaiTinDang,
    nguoi_dang_id: int | None = None,
) -> int:
    db: Session = SessionLocal()
    try:
        from app.models import LoaiBatDongSan, PhuongXa

        chu_tin = db.get(NguoiDung, nguoi_dang_id) if nguoi_dang_id else db.query(NguoiDung).first()
        loai = db.query(LoaiBatDongSan).first()
        phuong = db.query(PhuongXa).first()

        tin = TinDang(
            tieu_de=tieu_de,
            mo_ta="Tin đăng dùng để kiểm thử yêu thích",
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
    email = f"test-yeu-thich-{uuid.uuid4().hex[:12]}@example.com"
    response = client.post(
        "/api/auth/register",
        json={"fullName": "Người Kiểm Thử Yêu Thích", "email": email, "password": "matkhau123"},
    )
    body = response.json()
    return int(body["user"]["id"]), body["accessToken"]


def _xoa_nguoi_dung_theo_id(*id_list: int) -> None:
    db: Session = SessionLocal()
    try:
        db.query(TinYeuThich).filter(TinYeuThich.nguoi_dung_id.in_(id_list)).delete(
            synchronize_session=False
        )
        db.query(AnhThuVien).filter(AnhThuVien.nguoi_dung_id.in_(id_list)).delete(
            synchronize_session=False
        )
        db.query(NguoiDung).filter(NguoiDung.id.in_(id_list)).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()


def _xoa_tin_dang(*id_list: int) -> None:
    db: Session = SessionLocal()
    try:
        db.query(TinYeuThich).filter(TinYeuThich.tin_dang_id.in_(id_list)).delete(
            synchronize_session=False
        )
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


def test_luu_tin_yeu_thich_khong_dang_nhap_bi_tu_choi() -> None:
    id_tin = client.get("/api/rental-posts", params={"page_size": 1}).json()["items"][0]["id"]

    response = client.post(f"/api/favorites/{id_tin}")

    assert response.status_code == 401


def test_luu_va_lay_danh_sach_yeu_thich() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    marker = f"KiemThuYeuThich-{uuid.uuid4().hex[:8]}"
    id_tin = _tao_tin_dang_voi_trang_thai(marker, TrangThaiTinDang.DA_DUYET)
    try:
        headers = {"Authorization": f"Bearer {token}"}

        luu = client.post(f"/api/favorites/{id_tin}", headers=headers)
        assert luu.status_code == 201

        danh_sach = client.get("/api/favorites", headers=headers)
        assert danh_sach.status_code == 200
        body = danh_sach.json()
        assert [item["id"] for item in body["items"]] == [id_tin]

        ids = client.get("/api/favorites/ids", headers=headers)
        assert ids.status_code == 200
        assert ids.json() == [id_tin]
    finally:
        _xoa_tin_dang(id_tin)
        _xoa_nguoi_dung_theo_id(nguoi_dung_id)


def test_luu_trung_khong_tao_ban_ghi_moi() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    id_tin = _tao_tin_dang_voi_trang_thai(
        f"KiemThuYeuThich-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET
    )
    try:
        headers = {"Authorization": f"Bearer {token}"}

        client.post(f"/api/favorites/{id_tin}", headers=headers)
        lan_hai = client.post(f"/api/favorites/{id_tin}", headers=headers)
        assert lan_hai.status_code == 201

        db: Session = SessionLocal()
        try:
            so_luong = (
                db.query(TinYeuThich)
                .filter(TinYeuThich.nguoi_dung_id == nguoi_dung_id, TinYeuThich.tin_dang_id == id_tin)
                .count()
            )
            assert so_luong == 1
        finally:
            db.close()
    finally:
        _xoa_tin_dang(id_tin)
        _xoa_nguoi_dung_theo_id(nguoi_dung_id)


def test_luu_tin_khong_ton_tai_hoac_chua_duyet_tra_ve_404() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    id_tin_chua_duyet = _tao_tin_dang_voi_trang_thai(
        f"KiemThuYeuThich-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.CHO_DUYET
    )
    try:
        headers = {"Authorization": f"Bearer {token}"}

        khong_ton_tai = client.post("/api/favorites/999999999", headers=headers)
        assert khong_ton_tai.status_code == 404

        chua_duyet = client.post(f"/api/favorites/{id_tin_chua_duyet}", headers=headers)
        assert chua_duyet.status_code == 404
    finally:
        _xoa_tin_dang(id_tin_chua_duyet)
        _xoa_nguoi_dung_theo_id(nguoi_dung_id)


def test_bo_luu_tin_yeu_thich_thanh_cong() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    id_tin = _tao_tin_dang_voi_trang_thai(
        f"KiemThuYeuThich-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET
    )
    try:
        headers = {"Authorization": f"Bearer {token}"}
        client.post(f"/api/favorites/{id_tin}", headers=headers)

        bo_luu = client.delete(f"/api/favorites/{id_tin}", headers=headers)
        assert bo_luu.status_code == 200

        ids = client.get("/api/favorites/ids", headers=headers)
        assert ids.json() == []
    finally:
        _xoa_tin_dang(id_tin)
        _xoa_nguoi_dung_theo_id(nguoi_dung_id)


def test_bo_luu_tin_chua_yeu_thich_tra_ve_404() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    id_tin = _tao_tin_dang_voi_trang_thai(
        f"KiemThuYeuThich-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET
    )
    try:
        headers = {"Authorization": f"Bearer {token}"}

        response = client.delete(f"/api/favorites/{id_tin}", headers=headers)
        assert response.status_code == 404
    finally:
        _xoa_tin_dang(id_tin)
        _xoa_nguoi_dung_theo_id(nguoi_dung_id)


def test_danh_sach_yeu_thich_chi_hien_thi_cua_nguoi_dung_hien_tai() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    nguoi_khac_id, token_nguoi_khac = _dang_ky_va_lay_token()
    id_tin = _tao_tin_dang_voi_trang_thai(
        f"KiemThuYeuThich-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET
    )
    try:
        client.post(f"/api/favorites/{id_tin}", headers={"Authorization": f"Bearer {token}"})

        danh_sach_nguoi_khac = client.get(
            "/api/favorites", headers={"Authorization": f"Bearer {token_nguoi_khac}"}
        )
        assert danh_sach_nguoi_khac.status_code == 200
        assert danh_sach_nguoi_khac.json()["items"] == []
    finally:
        _xoa_tin_dang(id_tin)
        _xoa_nguoi_dung_theo_id(nguoi_dung_id, nguoi_khac_id)


def test_tin_bi_khoa_sau_khi_da_luu_khong_con_trong_danh_sach() -> None:
    nguoi_dung_id, token = _dang_ky_va_lay_token()
    id_tin = _tao_tin_dang_voi_trang_thai(
        f"KiemThuYeuThich-{uuid.uuid4().hex[:8]}", TrangThaiTinDang.DA_DUYET
    )
    try:
        headers = {"Authorization": f"Bearer {token}"}
        client.post(f"/api/favorites/{id_tin}", headers=headers)

        db: Session = SessionLocal()
        try:
            tin = db.get(TinDang, id_tin)
            tin.trang_thai = TrangThaiTinDang.BI_KHOA
            db.commit()
        finally:
            db.close()

        danh_sach = client.get("/api/favorites", headers=headers)
        assert danh_sach.status_code == 200
        assert danh_sach.json()["items"] == []
    finally:
        _xoa_tin_dang(id_tin)
        _xoa_nguoi_dung_theo_id(nguoi_dung_id)
