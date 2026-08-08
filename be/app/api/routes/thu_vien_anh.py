import io
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.core.config import get_settings
from app.core.minio_client import build_public_url, get_minio_client
from app.models import AnhThuVien, HinhAnhTinDang, NguoiDung
from app.schemas.anh_thu_vien import AnhThuVienItem, DanhSachAnhThuVien, DoiTenAnhRequest

router = APIRouter(prefix="/image-library", tags=["thu-vien-anh"])

DINH_DANG_CHO_PHEP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
DUNG_LUONG_TOI_DA = 5 * 1024 * 1024
SO_LUONG_TOI_DA_MOI_LAN = 20


def _sang_item(anh: AnhThuVien) -> AnhThuVienItem:
    return AnhThuVienItem(
        id=anh.id,
        url=anh.duong_dan_anh,
        ten_tep=anh.ten_tep_goc,
        dung_luong=anh.dung_luong,
        ngay_tai_len=anh.ngay_tai_len,
    )


@router.get("", response_model=DanhSachAnhThuVien)
def danh_sach_anh_thu_vien(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: str | None = Query(None, description="Tìm theo tên tệp"),
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> DanhSachAnhThuVien:
    truy_van = db.query(AnhThuVien).filter(AnhThuVien.nguoi_dung_id == nguoi_dung.id)
    if q:
        truy_van = truy_van.filter(AnhThuVien.ten_tep_goc.ilike(f"%{q.strip()}%"))

    total = truy_van.count()
    rows = (
        truy_van.order_by(AnhThuVien.ngay_tai_len.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return DanhSachAnhThuVien(
        items=[_sang_item(anh) for anh in rows], total=total, page=page, page_size=page_size
    )


@router.post("", status_code=201, response_model=list[AnhThuVienItem])
async def tai_anh_len_thu_vien(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> list[AnhThuVienItem]:
    if len(files) > SO_LUONG_TOI_DA_MOI_LAN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chỉ được tải lên tối đa {SO_LUONG_TOI_DA_MOI_LAN} ảnh mỗi lần.",
        )

    settings = get_settings()
    client = get_minio_client()
    ket_qua: list[AnhThuVien] = []

    for file in files:
        if file.content_type not in DINH_DANG_CHO_PHEP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Định dạng ảnh không hợp lệ: {file.filename}. Chỉ chấp nhận JPEG, PNG, WEBP.",
            )

        content = await file.read()
        if len(content) > DUNG_LUONG_TOI_DA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ảnh {file.filename} vượt quá dung lượng tối đa 5MB.",
            )

        file_ext = DINH_DANG_CHO_PHEP[file.content_type]
        object_name = f"{uuid.uuid4().hex}.{file_ext}"

        client.put_object(
            settings.minio_bucket,
            object_name,
            data=io.BytesIO(content),
            length=len(content),
            content_type=file.content_type,
        )

        anh = AnhThuVien(
            nguoi_dung_id=nguoi_dung.id,
            ten_doi_tuong=object_name,
            duong_dan_anh=build_public_url(object_name),
            ten_tep_goc=file.filename or object_name,
            dung_luong=len(content),
        )
        db.add(anh)
        ket_qua.append(anh)

    db.commit()
    for anh in ket_qua:
        db.refresh(anh)

    return [_sang_item(anh) for anh in ket_qua]


@router.patch("/{anh_id}", response_model=AnhThuVienItem)
def doi_ten_anh(
    anh_id: int,
    du_lieu: DoiTenAnhRequest,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> AnhThuVienItem:
    anh = db.get(AnhThuVien, anh_id)
    if anh is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy ảnh.")
    if anh.nguoi_dung_id != nguoi_dung.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền sửa ảnh này.")

    anh.ten_tep_goc = du_lieu.ten_tep
    db.commit()
    db.refresh(anh)

    return _sang_item(anh)


@router.delete("/{anh_id}", status_code=204)
def xoa_anh_thu_vien(
    anh_id: int,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> None:
    anh = db.get(AnhThuVien, anh_id)
    if anh is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy ảnh.")
    if anh.nguoi_dung_id != nguoi_dung.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xoá ảnh này.")

    dang_duoc_dung = (
        db.query(HinhAnhTinDang).filter(HinhAnhTinDang.anh_thu_vien_id == anh_id).first()
    )
    if dang_duoc_dung is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ảnh đang được dùng trong tin đăng, gỡ khỏi tin trước khi xoá.",
        )

    settings = get_settings()
    try:
        get_minio_client().remove_object(settings.minio_bucket, anh.ten_doi_tuong)
    except Exception:
        pass

    db.delete(anh)
    db.commit()
