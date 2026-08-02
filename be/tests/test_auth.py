import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.db.session import SessionLocal
from app.main import app
from app.models import NguoiDung

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
