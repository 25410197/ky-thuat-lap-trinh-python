import uuid

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_admin_user
from app.core.security import verify_password
from app.db.session import SessionLocal
from app.main import app
from app.models import NguoiDung
from app.models.enums import TrangThaiNguoiDung, VaiTroNguoiDung

client = TestClient(app)


def _email_ngau_nhien() -> str:
    return f"test-auth-{uuid.uuid4().hex[:12]}@example.com"


def _xoa_nguoi_dung(email: str) -> None:
    db: Session = SessionLocal()
    try:
        db.query(NguoiDung).filter(NguoiDung.email == email).delete()
        db.commit()
    finally:
        db.close()


def test_dang_ky_tao_tai_khoan_va_tra_ve_token() -> None:
    email = _email_ngau_nhien()
    try:
        response = client.post(
            "/api/auth/register",
            json={"fullName": "Nguyễn Văn A", "email": email, "password": "matkhau123"},
        )

        assert response.status_code == 201
        body = response.json()
        assert body["user"]["email"] == email
        assert body["user"]["fullName"] == "Nguyễn Văn A"
        assert body["user"]["role"] == "user"
        assert body["accessToken"]

        db = SessionLocal()
        try:
            nguoi_dung = db.query(NguoiDung).filter(NguoiDung.email == email).first()
            assert nguoi_dung is not None
            assert verify_password("matkhau123", nguoi_dung.mat_khau_hash)
        finally:
            db.close()
    finally:
        _xoa_nguoi_dung(email)


def test_dang_ky_trung_email_bi_tu_choi() -> None:
    email = _email_ngau_nhien()
    try:
        payload = {"fullName": "Người Dùng", "email": email, "password": "matkhau123"}
        first = client.post("/api/auth/register", json=payload)
        assert first.status_code == 201

        second = client.post("/api/auth/register", json=payload)
        assert second.status_code == 409
    finally:
        _xoa_nguoi_dung(email)


def test_dang_nhap_thanh_cong_tra_ve_token() -> None:
    email = _email_ngau_nhien()
    try:
        client.post(
            "/api/auth/register",
            json={"fullName": "Người Dùng", "email": email, "password": "matkhau123"},
        )

        response = client.post("/api/auth/login", json={"email": email, "password": "matkhau123"})

        assert response.status_code == 200
        assert response.json()["accessToken"]
    finally:
        _xoa_nguoi_dung(email)


def test_dang_nhap_sai_mat_khau_bi_tu_choi() -> None:
    email = _email_ngau_nhien()
    try:
        client.post(
            "/api/auth/register",
            json={"fullName": "Người Dùng", "email": email, "password": "matkhau123"},
        )

        response = client.post("/api/auth/login", json={"email": email, "password": "saimatkhau"})

        assert response.status_code == 401
    finally:
        _xoa_nguoi_dung(email)


def test_lay_thong_tin_ca_nhan_can_token() -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_lay_thong_tin_ca_nhan_voi_token_hop_le() -> None:
    email = _email_ngau_nhien()
    try:
        register_response = client.post(
            "/api/auth/register",
            json={"fullName": "Người Dùng", "email": email, "password": "matkhau123"},
        )
        token = register_response.json()["accessToken"]

        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json()["email"] == email
    finally:
        _xoa_nguoi_dung(email)


def _nguoi_dung_gia(vai_tro: VaiTroNguoiDung) -> NguoiDung:
    return NguoiDung(
        id=1,
        ho_ten="Test",
        email="test@example.com",
        mat_khau_hash="x",
        vai_tro=vai_tro,
        trang_thai=TrangThaiNguoiDung.HOAT_DONG,
    )


def test_admin_dependency_cho_phep_quan_tri_vien() -> None:
    admin = _nguoi_dung_gia(VaiTroNguoiDung.QUAN_TRI)

    assert get_current_admin_user(nguoi_dung=admin) is admin


def test_admin_dependency_tu_choi_nguoi_dung_thuong() -> None:
    nguoi_dung = _nguoi_dung_gia(VaiTroNguoiDung.NGUOI_DUNG)

    with pytest.raises(HTTPException) as exc_info:
        get_current_admin_user(nguoi_dung=nguoi_dung)

    assert exc_info.value.status_code == 403


def _dang_ky_va_lay_token(email: str) -> str:
    response = client.post(
        "/api/auth/register",
        json={"fullName": "Người Dùng", "email": email, "password": "matkhau123"},
    )
    return response.json()["accessToken"]


def test_cap_nhat_ho_so_thanh_cong() -> None:
    email = _email_ngau_nhien()
    try:
        token = _dang_ky_va_lay_token(email)

        response = client.patch(
            "/api/auth/me",
            json={"fullName": "Tên Mới", "phone": "0901234567"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["fullName"] == "Tên Mới"
        assert body["phone"] == "0901234567"

        db = SessionLocal()
        try:
            nguoi_dung = db.query(NguoiDung).filter(NguoiDung.email == email).first()
            assert nguoi_dung is not None
            assert nguoi_dung.ho_ten == "Tên Mới"
            assert nguoi_dung.so_dien_thoai == "0901234567"
        finally:
            db.close()
    finally:
        _xoa_nguoi_dung(email)


def test_cap_nhat_ho_so_can_dang_nhap() -> None:
    response = client.patch("/api/auth/me", json={"fullName": "Tên Mới"})

    assert response.status_code == 401


def test_doi_mat_khau_thanh_cong() -> None:
    email = _email_ngau_nhien()
    try:
        token = _dang_ky_va_lay_token(email)

        response = client.post(
            "/api/auth/doi-mat-khau",
            json={"currentPassword": "matkhau123", "newPassword": "matkhaumoi456"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 204

        db = SessionLocal()
        try:
            nguoi_dung = db.query(NguoiDung).filter(NguoiDung.email == email).first()
            assert nguoi_dung is not None
            assert verify_password("matkhaumoi456", nguoi_dung.mat_khau_hash)
        finally:
            db.close()

        dang_nhap_lai = client.post(
            "/api/auth/login", json={"email": email, "password": "matkhaumoi456"}
        )
        assert dang_nhap_lai.status_code == 200
    finally:
        _xoa_nguoi_dung(email)


def test_doi_mat_khau_sai_mat_khau_hien_tai_bi_tu_choi() -> None:
    email = _email_ngau_nhien()
    try:
        token = _dang_ky_va_lay_token(email)

        response = client.post(
            "/api/auth/doi-mat-khau",
            json={"currentPassword": "saimatkhau", "newPassword": "matkhaumoi456"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 400
    finally:
        _xoa_nguoi_dung(email)
